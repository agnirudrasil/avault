from datetime import datetime, timedelta
from api.api import deps
from api.schemas.channel import ChannelValidate
from fastapi import APIRouter, Depends, File, Form, Response, UploadFile
from pydantic import BaseModel
from typing import Optional
from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session
from api.models.guilds import Guild, GuildBans, GuildMembers
from api.models.roles import Role
from api.models.user import User
from api.models.channels import Channel, ChannelType
from api.models.messages import Message

router = APIRouter()


class CreateGuildBan(BaseModel):
    reason: Optional[str] = None
    delete_message_days: Optional[int] = 0


class GuildMemberUpdate(BaseModel):
    nick: str


class RoleCreate(BaseModel):
    name: Optional[str] = 'new role'
    permissions: Optional[int] = 0
    color: Optional[int] = 0
    mentionable: Optional[bool] = False


class RoleUpdate(BaseModel):
    name: Optional[str]
    color: Optional[int]
    permissions: Optional[int]
    mentionable: Optional[bool]


class RolePositionUpdate(BaseModel):
    id: int
    positon: int


class GuildEdit(BaseModel):
    name: str


@router.post('/')
def create(name: str = Form(..., min_length=5, max_length=80),
           icon: Optional[UploadFile] = File(...),
           current_user: User = Depends(deps.get_current_user),
           db: Session = Depends(deps.get_db)):
    user_id = current_user.id
    user = db.query(User).filter_by(id=user_id).first()
    if user:
        guild = Guild(name, user_id)
        if icon:
            pass
        guild_member = GuildMembers()
        role = Role(guild.id, '@everyone', 0, 0, 0x0, True, guild.id)
        category = Channel(ChannelType.guild_category,
                           guild.id, 'TEXT CHANNELS')
        general = Channel(ChannelType.guild_text,
                          guild.id, 'general', parent_id=category.id)
        guild.channels.append(category)
        guild.channels.append(general)
        guild_member.member = user
        guild.members.append(guild_member)
        db.add(guild)
        db.add(role)
        db.commit()
        return {'success': True, 'guild': guild.preview()}
    return {'success': False, 'error': 'User not found'}, 401


@router.get('/{guild_id}')
def get_guild(guild_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        return {'guild': guild.serialize()}
    return {'guild': None}, 404


@router.patch('/{guild_id}')
def edit_guild(guild_id: int, body: GuildEdit,
               response: Response,
               db: Session = Depends(deps.get_db),
               user: User = Depends(deps.get_current_user)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, user.id):
        guild.name = body.name
        db.commit()
        return guild.serialize()
    response.status_code = 404
    return {'error': 'Guild not found'}


@router.delete('/{guild_id}')
def delete_guild(guild_id: int,
                 response: Response,
                 db: Session = Depends(deps.get_db),
                 user: User = Depends(deps.get_current_user)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_owner(db, user):
        db.delete(guild)
        db.commit()
        return {"success": True}
    response.status_code = 404
    return {"error": "Guild not found"}


@router.put('/{guild_id}/members/{user_id}/roles/{role_id}', status_code=204)
def add_role(guild_id: int,
             user_id: int,
             role_id: int,
             current_user: User = Depends(deps.get_current_user),
             db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        guild_member = db.query(GuildMembers).filter_by(
            user_id=user_id, guild_id=guild_id).first()
        if guild_member:
            guild_member.roles.append(
                db.query(Role).filter_by(id=role_id).first())
            db.commit()
            return ''
        return {'success': False, 'error': 'User not found'}, 404
    return {'success': False, 'error': 'Guild not found'}, 404


@router.delete('/{guild_id}/members/{user_id}/roles/{role_id}', status_code=204)
def delete_user_role(guild_id: int,
                     user_id: int,
                     role_id: int,
                     current_user: User = Depends(deps.get_current_user),
                     db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        guild_member = db.query(GuildMembers).filter_by(
            user_id=user_id, guild_id=guild_id).first()
        if guild_member:
            try:
                guild_member.roles.remove(
                    db.query(Role).filter_by(id=role_id).first())
                db.commit()
            except ValueError:
                pass
            return ''
        return {'success': False, 'error': 'User not found'}, 404


@router.get('/{guild_id}/roles')
def get_roles(guild_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        roles = db.query(Role).filter_by(guild_id=guild_id).order_by(
            desc(Role.position)).order_by(asc(Role.id)).all()
        return {'roles': [role.serialize() for role in roles]}
    return {'roles': None}, 404


@router.get('/{guild_id}/roles/{role_id}')
def get_roles(guild_id: int,
              role_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        role = db.query(Role).filter_by(
            guild_id=guild_id).filter_by(id=role_id).first()
        return {'role': role.serialize()}
    return {'role': None}, 404


@router.post('/{guild_id}/roles')
def create_role(guild_id: int,
                data: RoleCreate,
                current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        role = Role(guild_id, data.name, data.color, 1, data.permissions,
                    data.mentionable)
        db.add(role)
        db.commit()
        return {'role': role.serialize()}, 201
    return {'role': None}, 404


@router.patch('/{guild_id}/roles')
def update_role_postions(guild_id: int,
                         data: RolePositionUpdate,
                         current_user: User = Depends(deps.get_current_user),
                         db: Session = Depends(deps.get_db)):
    id = data.id
    position = data.positon
    if position:
        role = db.query(Role).filter_by(
            id=id).filter_by(guild_id=guild_id).first()
        if role:

            db.commit()
            return '', 204
        return {'success': False, 'error': 'Role not found'}, 404
    return {'success': False, 'error': 'No position provided'}, 404


@router.patch('/{guild_id}/roles/{role_id}')
def update_role(guild_id: int, role_id: int,
                data: RoleUpdate,
                current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)):
    role = db.query(Role).filter_by(
        id=role_id).filter_by(guild_id=guild_id).first()
    if data.name:
        role.name = data.name
    if data.color:
        role.color = data.color
    if data.permissions:
        role.permissions = int(data.permissions)
    if data.mentionable:
        role.mentionable = data.mentionable
    db.commit()
    return {'role': role.serialize()}, 201


@router.delete('/{guild_id}/roles/{role_id}')
def delete_role(guild_id: int, role_id: int,
                db: Session = Depends(deps.get_db),
                current_user: User = Depends(deps.get_current_user)):
    role = db.query(Role).filter_by(id=role_id, guild_id=guild_id).first()
    if role:
        db.delete(role)
        db.commit()
        return '', 204
    return {'success': False, 'error': 'Role not found'}, 404


@router.get('/{guild_id}/channels')
def get_guild_channels(guild_id: int, response: Response,
                       db: Session = Depends(deps.get_db),
                       user: User = Depends(deps.get_current_user)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, user.id):
        return {[channel.serialize() for channel in guild.channels]}
    response.status_code = 404
    return {'channels': None}


@router.post("/{guild_id}/channels")
def create_guild_channel(guild_id: int, data: ChannelValidate,
                         current_user: User = Depends(deps.get_current_user),
                         db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        channel = Channel(data.type, guild_id, data.name,
                          data.topic, data.nsfw,
                          data.position, parent_id=data.parent_id)
        db.add(channel)
        db.commit()
        return {**channel.serialize()}, 201

# TODO change channel postions


@router.get('/{guild_id}/members/{user_id}')
def get_guild_member(guild_id: int, user_id: int, response: Response,
                     db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if member:
            return {'member': member.serialize()}
        response.status_code = 404
        return {'member': None}
    response.status_code = 404
    return {'member': None}


@router.get('/{guild_id}/members')
def get_guild_members(guild_id: int, response: Response,
                      db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        return {[member.serialize() for member in guild.members]}
    response.status_code = 404
    return {'members': None}


@router.put('/{guild_id}/members/{user_id}')
def add_guild_member(guild_id: int, user_id: int,
                     db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if member:
            return {'member': member.serialize()}
        member = GuildMembers()
        guild.members.append(member)
        db.add(member)
        db.commit()

        return {'member': member.serialize()}


@router.patch('/{guild_id}/members/{user_id}')
def update_guild_member(guild_id: int, user_id: int, data: GuildMemberUpdate,
                        db: Session = Depends(deps.get_db),
                        current_user: User = Depends(deps.get_current_user)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if member:
            if data.nick:
                member.nick = data.nick
            db.commit()
            return {'member': member.serialize()}
        return {'member': None}
    return {'member': None}


@router.patch('/{guild_id}/members/@me')
def update_guild_member_me(guild_id: int, data: GuildMemberUpdate,
                           current_user: User = Depends(deps.get_current_user),
                           db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=current_user.id).first()
        if member:
            if data.nick:
                member.nick = data.nick
            db.commit()
            return {'member': member.serialize()}
        return {'member': None}
    return {'member': None}


@router.delete('/{guild_id}/members/{user_id}')
def delete_guild_member(guild_id: int, user_id: int,
                        db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if member:
            db.delete(member)
            db.commit()
            return '', 204
        return {'member': None}
    return {'member': None}


@router.get('/{guild_id}/bans')
def get_guild_bans(guild_id: int, response: Response,
                   db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        return {[ban.serialize() for ban in guild.bans]}
    response.status_code = 404
    return {'bans': None}


@router.get('/{guild_id}/bans/{user_id}')
def get_guild_ban(guild_id: int, user_id: int, response: Response,
                  db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        ban = db.query(GuildBans).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if ban:
            return {'ban': ban.serialize()}
        response.status_code = 404
        return {'ban': None}
    response.status_code = 404
    return {'ban': None}


@router.put('/{guild_id}/bans/{user_id}')
def add_guild_ban(guild_id: int, user_id: int, body: CreateGuildBan,
                  current_user: User = Depends(deps.get_current_user),
                  db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        try:
            ban = GuildBans()
            guild.bans.append(ban)
            db.query(GuildMembers).filter_by(
                guild_id=guild_id).filter_by(user_id=user_id).delete()
            filter_after = datetime.now() + timedelta(days=body.delete_message_days)
            db.query(Message).filter_by(guild_id=guild_id).filter_by(
                author_id=user_id).filter(Message.timestamp >= filter_after).delete()
            db.add(ban)
            db.commit()
        except IntegrityError:
            return {'ban': None}
        return {'ban': ban.serialize()}
    return {'ban': None}


@router.delete('/{guild_id}/bans/{user_id}')
def delete_guild_ban(guild_id: int, user_id: int,
                     db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        ban = db.query(GuildBans).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if ban:
            db.delete(ban)
            db.commit()
            return '', 204
        return {'ban': None}
    return {'ban': None}
