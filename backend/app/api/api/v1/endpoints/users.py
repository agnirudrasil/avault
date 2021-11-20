from typing import List, Union
from api.api import deps
from api.models.user import User
from api.models.channels import Channel, ChannelType
from api.crud import user
from api.models.guilds import GuildMembers
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

router = APIRouter()


class PatchUser(BaseModel):
    username: str


class CreateDm(BaseModel):
    recipient_id: int


class CreateGroup(BaseModel):
    recipient_ids: List[int]


@router.get("/@me")
def get_me(db: Session = Depends(deps.get_db),
           user: User = Depends(deps.get_current_user)):
    return user.serialize()


@router.patch("/@me")
def edit_me(body: PatchUser, db: Session = Depends(deps.get_db),
            user: User = Depends(deps.get_current_user)):
    existing_user = db.query(User).filter_by(
        username=body.username).filter_by(tag=user.tag).first()
    tag = ""
    if (existing_user):
        tag = user.generate_tag(body.username)
    user.username = body.username
    if (tag):
        user.tag = tag
        db.commit()
    return user.serialize()


@router.post("/@me/channels")
def create_dm_channel(body: CreateDm, response: Response, db: Session = Depends(deps.get_db),
                      user: User = Depends(deps.get_current_user)):
    channel: Channel = Channel(ChannelType.dm, None, "", owner_id=user.id)
    recipient = db.query(User).filter_by(id=user.id).first()
    if not recipient:
        response.status_code = 404
        return {"message": "User not found"}
    channel.members.append(user)
    channel.members.append(recipient)
    db.add(channel)
    db.commit()
    return channel.serialize()


@router.post("/@me/channels/group")
def create_group_dm(body: CreateGroup, response: Response, db: Session = Depends(deps.get_db),
                    user: User = Depends(deps.get_current_user)):
    channel: Channel = Channel(ChannelType.group, None, "", owner_id=user.id)
    for recipient_id in body.recipient_ids:
        recipient = db.query(User).filter_by(id=recipient_id).first()
        if not recipient:
            response.status_code = 404
            return {"message": "User not found"}
        channel.members.append(recipient)
    channel.members.append(user)
    db.add(channel)
    db.commit()
    return channel.serialize()


@router.get("/@me/channels")
def get_dm_channels(db: Session = Depends(deps.get_db),
                    user: User = Depends(deps.get_current_user)):
    return {[channel.serialize() for channel in user.channels]}


@router.get('/{user_id}')
def get_user(user_id: int, db: Session = Depends(deps.get_db)):
    return user.get(db, user_id).serialize()


@router.get('/@me/guilds')
def get_guilds(response: Response, db: Session = Depends(deps.get_db),
               current_user: User = Depends(deps.get_current_user)):
    user = db.query(User).filter_by(id=current_user.id).first()
    if user:
        guilds = user.guilds
        if guilds:
            return {'guilds': [guild.guild.preview() for guild in guilds]}
        return {'guilds': []}
    response.status_code = 401
    return {'guilds': []}


@router.delete('/@me/guilds/{guild_id}', status_code=204)
def leave_guild(guild_id: int, response: Response, current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)):
    guild_memeber = db.query(GuildMembers).filter_by(
        user_id=current_user.id, guild_id=guild_id).first()
    if guild_memeber:
        db.session.delete(guild_memeber)
        db.session.commit()
        return
    response.status_code = 404
    return {'success': False}
