# from datetime import datetime, timedelta
from typing import Optional

from fastapi import APIRouter, Depends, File, Form, Response, UploadFile, BackgroundTasks
from pydantic import BaseModel
from sqlalchemy import asc, desc
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.api import deps
from api.core.events import Events, websocket_emitter
from api.core.permissions import Permissions
from api.models.channels import Channel, ChannelType, Overwrite
from api.models.guilds import Guild, GuildBans, GuildMembers
from api.models.roles import Role
from api.models.user import User
from api.schemas.channel import ChannelValidate

router = APIRouter()


class CreateGuildBan(BaseModel):
    reason: Optional[str] = None
    delete_message_days: Optional[int] = 0


class GuildMemberUpdate(BaseModel):
    nick: Optional[str] = None


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
    position: int


class GuildEdit(BaseModel):
    name: str


@router.post('/')
def create_guild(
        background_task: BackgroundTasks,
        name: str = Form(..., min_length=5, max_length=80),
        icon: Optional[UploadFile] = File(...),
        current_user: User = Depends(deps.get_current_user),
        db: Session = Depends(deps.get_db)):
    guild = Guild(name, current_user.id)
    if icon:
        pass
    guild_member = GuildMembers(is_owner=True)
    role = Role(guild.id, '@everyone', 0, 0, 1071698660929, True, guild.id)
    category = Channel(ChannelType.guild_category,
                       guild.id, 'TEXT CHANNELS')
    general = Channel(ChannelType.guild_text,
                      guild.id, 'general', parent_id=category.id)
    guild.channels.append(category)
    guild.channels.append(general)
    guild_member.member = current_user
    guild.members.append(guild_member)
    db.add(guild)
    db.add(role)
    db.commit()
    background_task.add_task(websocket_emitter, None, None, Events.GUILD_CREATE, guild.serialize(), current_user.id)
    return guild.preview()


@router.get('/{guild_id}')
def get_guild(guild_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        return guild.serialize()
    return Response(status_code=404)


@router.get('/{guild_id}/preview')
def get_guild(guild_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        return guild.preview()
    return Response(status_code=404)


@router.patch('/{guild_id}')
def edit_guild(body: GuildEdit,
               background_task: BackgroundTasks,
               db: Session = Depends(deps.get_db),
               dependencies: tuple[Guild, User] = Depends(deps.GuildPerms(Permissions.MANAGE_GUILD))):
    guild, user = dependencies
    guild.name = body.name
    db.commit()
    background_task.add_task(websocket_emitter, None, guild.id, Events.GUILD_UPDATE, guild.serialize())
    return guild.serialize()


@router.delete('/{guild_id}', status_code=204)
def delete_guild(guild_id: int,
                 background_task: BackgroundTasks,
                 response: Response,
                 db: Session = Depends(deps.get_db),
                 user: User = Depends(deps.get_current_user)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_owner(user.id):
        db.delete(guild)
        db.commit()
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_DELETE, guild.serialize())
        return
    response.status_code = 404
    return {"error": "Guild not found"}


@router.put('/{guild_id}/members/{user_id}/roles/{role_id}', status_code=204,
            dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_ROLES))])
def add_user_role(guild_id: int,
                  user_id: int,
                  role_id: int,
                  background_task: BackgroundTasks,
                  db: Session = Depends(deps.get_db)):
    guild_member = db.query(GuildMembers).filter_by(
        user_id=user_id).filter_by(guild_id=guild_id).first()
    if guild_member:
        role = db.query(Role).filter_by(id=role_id).first()
        guild_member.roles.append(role)
        db.commit()
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_UPDATE,
                                 guild_member.serialize())
        return ''


@router.delete('/{guild_id}/members/{user_id}/roles/{role_id}', status_code=204,
               dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_ROLES))])
def delete_user_role(guild_id: int,
                     background_task: BackgroundTasks,
                     user_id: int,
                     role_id: int,
                     db: Session = Depends(deps.get_db)):
    guild_member = db.query(GuildMembers).filter_by(
        user_id=user_id, guild_id=guild_id).first()
    if guild_member:
        try:
            role = db.query(Role).filter_by(id=role_id).first()
            guild_member.roles.remove(role)
            db.commit()
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_UPDATE,
                                     guild_member.serialize())
        except ValueError:
            pass
        return ''
    return Response(status_code=404)


@router.get('/{guild_id}/roles')
def get_roles(guild_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        roles = db.query(Role).filter_by(guild_id=guild_id).order_by(
            desc(Role.position)).order_by(asc(Role.id)).all()
        return {[role.serialize() for role in roles]}
    return Response(status_code=404)


@router.get('/{guild_id}/roles/{role_id}')
def get_roles(guild_id: int,
              role_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        role = db.query(Role).filter_by(
            guild_id=guild_id).filter_by(id=role_id).first()
        return role.serialize()
    return Response(status_code=404)


@router.get('/{guild_id}/roles/{role_id}/members', dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_ROLES))])
def get_role_members(guild_id: int,
                     role_id: int,
                     db: Session = Depends(deps.get_db)):
    members = db.query(GuildMembers).filter_by(guild_id=guild_id).filter(
        GuildMembers.roles.any(Role.id == role_id)).all()
    return [member.serialize() for member in members]


@router.post('/{guild_id}/roles', dependencies=[Depends(deps.get_current_user)])
def create_role(guild_id: int,
                data: RoleCreate,
                background_task: BackgroundTasks,
                db: Session = Depends(deps.get_db)):
    everyone_role = db.query(Role).filter_by(id=guild_id).first()
    role = Role(guild_id, data.name, data.color, 1,
                data.permissions or everyone_role.permissions,
                data.mentionable)
    db.add(role)
    db.commit()
    background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_ROLE_CREATE,
                             {'role': role.serialize(), 'guild_id': str(guild_id)})
    return role.serialize()


# TODO: Add code to update role order
@router.patch('/{guild_id}/roles', dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_ROLES))])
def update_role_positions(guild_id: int,
                          data: RolePositionUpdate,
                          db: Session = Depends(deps.get_db)):
    role_id = data.id
    position = data.position
    if position:
        role = db.query(Role).filter_by(
            id=role_id).filter_by(guild_id=guild_id).first()
        if role:
            db.commit()
            return '', 204
        return {'success': False, 'error': 'Role not found'}, 404
    return {'success': False, 'error': 'No position provided'}, 404


@router.patch('/{guild_id}/roles/{role_id}', dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_ROLES))])
def update_role(guild_id: int, role_id: int,
                data: RoleUpdate,
                background_task: BackgroundTasks,
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
    background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_ROLE_UPDATE,
                             {'role': role.serialize(), 'guild_id': str(guild_id)})
    return role.serialize()


@router.delete('/{guild_id}/roles/{role_id}', dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_ROLES))])
def delete_role(guild_id: int, role_id: int,
                background_task: BackgroundTasks,
                db: Session = Depends(deps.get_db)):
    role = db.query(Role).filter_by(id=role_id, guild_id=guild_id).first()
    if role:
        db.delete(role)
        db.commit()
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_ROLE_DELETE,
                                 {'role': role.serialize(), 'guild_id': str(guild_id)})
        return ''
    return Response(status_code=404)


@router.get('/{guild_id}/channels')
def get_guild_channels(guild_id: int, response: Response,
                       db: Session = Depends(deps.get_db),
                       user: User = Depends(deps.get_current_user)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, user.id):
        return {[channel.serialize() for channel in guild.channels]}
    response.status_code = 404
    return []


@router.post("/{guild_id}/channels", status_code=201,
             dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_CHANNELS))])
def create_guild_channel(guild_id: int, background_task: BackgroundTasks,
                         data: ChannelValidate,
                         db: Session = Depends(deps.get_db)):
    channel = Channel(data.type, guild_id, data.name,
                      data.topic, data.nsfw,
                      parent_id=data.parent_id)
    if data.privateChannel:
        overwrite = Overwrite(guild_id, 0, deny=1024 if data.privateChannel else 0, allow=0)
        channel.overwrites.append(overwrite)
    db.add(channel)
    db.commit()
    background_task.add_task(websocket_emitter, channel.id, guild_id, Events.CHANNEL_CREATE, channel.serialize())
    return channel.serialize()


# TODO change channel positions


@router.get('/{guild_id}/members/{user_id}')
def get_guild_member(guild_id: int, user_id: int, response: Response,
                     user: User = Depends(deps.get_current_user),
                     db: Session = Depends(deps.get_db)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, user.id):
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if member:
            return member.serialize()
        response.status_code = 404
        return
    response.status_code = 404
    return


@router.get('/{guild_id}/members')
def get_guild_members(guild_id: int, response: Response,
                      limit: int = 50,
                      after: Optional[int] = None,
                      user: User = Depends(deps.get_current_user),
                      db: Session = Depends(deps.get_db)):
    guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
    limit = max(limit, 1)
    limit = min(1000, limit)
    real_limit = limit + 1
    if guild and guild.is_member(db, user.id):
        if after:
            members = db.query(GuildMembers).filter_by(guild_id=guild_id).filter(User.id > after).limit(
                real_limit).all()
            return {"members": [member.serialize() for member in members[0:limit]], "has_more": len(members) > limit}
        members = db.query(GuildMembers).filter_by(guild_id=guild_id).limit(real_limit).all()
        return {"members": [member.serialize() for member in members[0:limit]], 'has_more': len(members) > limit}
    response.status_code = 404
    return


@router.put('/{guild_id}/members/{user_id}')
def add_guild_member(guild_id: int, user_id: int,
                     background_task: BackgroundTasks,
                     db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild:
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id).first()
        if member:
            return member.serialize()
        member = GuildMembers()
        guild.members.append(member)
        db.add(member)
        db.commit()
        background_task.add_task(websocket_emitter, member.id, guild_id, Events.GUILD_MEMBER_ADD, member.serialize())
        return member.serialize()


@router.patch('/{guild_id}/members/@me')
def update_guild_member(guild_id: int, data: GuildMemberUpdate,
                        background_task: BackgroundTasks,
                        dependencies: tuple[Guild, User] = Depends(deps.GuildPerms(Permissions.CHANGE_NICKNAME)),
                        db: Session = Depends(deps.get_db)):
    _, user = dependencies
    member = db.query(GuildMembers).filter_by(
        guild_id=guild_id).filter_by(user_id=user.id).first()
    if member:
        if data.nick:
            member.nickname = data.nick
            db.add(member)
            db.commit()
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_UPDATE, member.serialize())
        return member.serialize()
    return Response(status_code=404)


@router.patch('/{guild_id}/members/{user_id}', dependencies=[Depends(deps.GuildPerms(Permissions.MANAGE_NICKNAMES))])
def update_guild_member(guild_id: int, user_id: int, data: GuildMemberUpdate,
                        background_task: BackgroundTasks,
                        db: Session = Depends(deps.get_db)):
    member = db.query(GuildMembers).filter_by(
        guild_id=guild_id).filter_by(user_id=user_id).first()
    if member:
        if data.nick:
            member.nickname = data.nick
            db.commit()
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_UPDATE, member.serialize())
        return member.serialize()
    return Response(status_code=404)


@router.delete('/{guild_id}/members/{user_id}', status_code=204,
               dependencies=[Depends(deps.GuildPerms(Permissions.KICK_MEMBERS))])
def delete_guild_member(guild_id: int, user_id: int, background_task: BackgroundTasks,
                        db: Session = Depends(deps.get_db)):
    member = db.query(GuildMembers).filter_by(
        guild_id=guild_id).filter_by(user_id=user_id).first()
    if member:
        db.delete(member)
        db.commit()
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_REMOVE, member.serialize())
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_DELETE, {'id': str(guild_id)},
                                 user_id)
        return ''

    return Response(status_code=404)


@router.get('/{guild_id}/bans')
def get_guild_bans(dependencies: tuple[Guild, User] = Depends((deps.GuildPerms(Permissions.BAN_MEMBERS)))):
    guild, _ = dependencies
    return {[ban.serialize() for ban in guild.bans]}


@router.get('/{guild_id}/bans/{user_id}', dependencies=[Depends(deps.GuildPerms(Permissions.BAN_MEMBERS))])
def get_guild_ban(guild_id: int, user_id: int,
                  db: Session = Depends(deps.get_db)):
    ban = db.query(GuildBans).filter_by(
        guild_id=guild_id).filter_by(user_id=user_id).first()
    if ban:
        return ban.serialize()
    return Response(status_code=404)


@router.put('/{guild_id}/bans/{user_id}')
def add_guild_ban(guild_id: int, user_id: int, body: CreateGuildBan, background_task: BackgroundTasks,
                  dependencies: tuple[Guild, User] = Depends(deps.GuildPerms(Permissions.BAN_MEMBERS)),
                  db: Session = Depends(deps.get_db)):
    guild, user = dependencies
    try:
        ban = GuildBans(body.reason)
        guild.bans.append(ban)
        member = db.query(GuildMembers).filter_by(
            guild_id=guild_id).filter_by(user_id=user_id)
        if member:
            db.delete(member)
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_REMOVE,
                                     member.serialize())
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_DELETE, {'id': str(guild_id)},
                                     user_id)
        # TODO : delete previous messages
        # filter_after = datetime.now() + timedelta(days=body.delete_message_days)
        # messages = db.query(Message).filter_by(guild_id=guild_id).filter_by(
        #     author_id=user_id).filter(Message.timestamp >= filter_after).order_by(Message.channel_id).all()
        # if messages:
        #     prev_channel = 0
        #     for index, message in enumerate(messages):
        #
        #     db.delete(messages)
        #     background_task.add_task(websocket_emitter, user_id, guild_id, Events.MESSAGE_DELETE_BULK,
        #                              {'ids': [message.id for message in messages]})
        db.add(ban)
        db.commit()
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_BAN_ADD, ban.serialize())
        return ban.serialize()
    except IntegrityError:
        return


@router.delete('/{guild_id}/bans/{user_id}', dependencies=[Depends(deps.GuildPerms(Permissions.BAN_MEMBERS))])
def delete_guild_ban(guild_id: int, user_id: int, background_task: BackgroundTasks,
                     db: Session = Depends(deps.get_db)):
    guild_ban = db.query(GuildBans).filter_by(
        guild_id=guild_id).filter_by(user_id=user_id).first()
    if guild_ban:
        db.delete(guild_ban)
        db.commit()
        background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_BAN_REMOVE, guild_ban.serialize())
        return Response(status_code=204)
    return Response(status_code=404)


@router.get('/{guild_id}/webhooks')
def get_guild_webhooks(dependencies: tuple[Guild, User] = Depends(deps.GuildPerms(Permissions.MANAGE_WEBHOOKS))):
    guild, _ = dependencies
    return {[webhook.serialize() for webhook in guild.webhooks]}
