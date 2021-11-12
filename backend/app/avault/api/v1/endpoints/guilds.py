from avault.api import deps
from fastapi import APIRouter, Depends, File, Form, UploadFile
from pydantic import BaseModel, ValidationError
from typing import Optional
from sqlalchemy.orm import Session
from avault.models.guilds import Guild, GuildMembers
from avault.models.roles import Role
from avault.models.user import User
from avault.models.channels import Channel, ChannelType


router = APIRouter()


# class GuildCreate(Form):
#     name = StringField('name', [validators.length(
#         min=5, max=80), validators.DataRequired()])
#     icon = FileField('icon')


class RoleCreate(BaseModel):
    name: Optional[str] = 'new role'
    permissions: Optional[int] = 0
    color: Optional[int] = 0
    mentionable: Optional[bool] = False


class RoleUpdate(BaseModel):
    name: Optional[str]
    permissions: Optional[int]
    color: Optional[int]
    mentionable: Optional[bool]


class RolePositionUpdate(BaseModel):
    id: int
    positon: int


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


@router.put('/{guild_id}/members/{user_id}/roles/{role_id}')
def add_role(guild_id: int,
             user_id: int,
             role_id: int,
             current_user: User = Depends(deps.get_current_user),
             db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        guild_member = db.query(GuildMembers).filter_by(
            member_id=user_id, guild_id=guild_id).first()
        if guild_member:
            guild_member.roles.append(
                db.query(Role).filter_by(id=role_id).first())
            db.commit()
            return '', 204
        return {'success': False, 'error': 'User not found'}, 404
    return {'success': False, 'error': 'Guild not found'}, 404


@ router.delete('/{guild_id}/members/{user_id}/roles/{role_id}')
def delete_user_role(guild_id: int,
                     user_id: int,
                     role_id: int,
                     current_user: User = Depends(deps.get_current_user),
                     db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        guild_member = db.query(GuildMembers).filter_by(
            member_id=user_id, guild_id=guild_id).first()
        if guild_member:
            guild_member.roles.remove(
                Role.query.filter_by(id=role_id).first())
            db.commit()
            return '', 204
        return {'success': False, 'error': 'User not found'}, 404


@ router.get('/{guild_id}/roles')
def get_roles(guild_id: int,
              current_user: User = Depends(deps.get_current_user),
              db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        roles = db.query(Role).filter_by(guild_id=guild_id).all()
        return {'roles': [role.serialize() for role in roles]}
    return {'roles': None}, 404


@router.post('/{guild_id}/roles')
def create_role(guild_id: int,
                data: RoleCreate,
                current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)):
    guild = db.query(Guild).filter_by(id=guild_id).first()
    if guild and guild.is_member(db, current_user.id):
        role = Role(guild_id, data.name, data.color, 1, data.permissions,
                    data.permissions, data.mentionable, guild_id)
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
            original_postion = role.position
            role.position = position
            db.query(Role).\
                filter_by(
                    Role.position.between(
                        max(original_postion - 1, 1), position),
                Role.id.not_(id)).\
                update({Role.position: Role.position + 1})
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
        role.permissions = data.permissions
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
