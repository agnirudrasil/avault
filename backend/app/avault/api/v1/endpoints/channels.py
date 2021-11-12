from datetime import datetime, timedelta
from typing import List, Optional
from avault.models.guilds import Guild, GuildMembers
from fastapi import APIRouter, Depends, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from avault import db
from pydantic import BaseModel, validator, ValidationError
from avault.models.invites import Invite
from avault.models.user import User
from avault.api import deps
from avault.models.messages import Message
from avault.models.channels import Channel, ChannelType


router = APIRouter()


class MessageCreate(BaseModel):
    content: str


class ChannelInvite(BaseModel):
    max_age: Optional[int] = 86400
    max_uses: Optional[int] = 0
    unique: Optional[bool] = False

    @validator('max_age')
    def validate_max_age(cls, v):
        if v is not None:
            if 0 <= v <= 604800:
                return v
            else:
                raise ValueError('max_age must be between 0 and 604800')
        v = 86400
        return v

    @validator('max_uses')
    def validate_max_uses(cls, v):
        if v is not None:
            if 0 <= v <= 100:
                return v
            else:
                raise ValueError('max_uses must be between 0 and 100')
        v = 0
        return v

    @validator('unique')
    def validate_unique(cls, v):
        return v if v is not None else False


@router.get('/join/{code}')
def join_guild(code: str,
               current_user: User = Depends(deps.get_current_user),
               db: Session = Depends(deps.get_db)):
    invite: Invite = db.query(Invite).filter_by(id=code).first()
    if invite:
        guild_id = invite.channel.guild_id
        if invite.max_uses != 0 and invite.max_uses == invite.count:
            db.session.delete(invite)
            db.session.commit()
            return {"message": "Invite has been used"}, 403
        if invite.max_age != 0 and (invite.created_at + timedelta(seconds=invite.max_age)) >= datetime.now():
            # db.session.delete(invite)
            # db.session.commit()
            return {"message": "Invite has expired"}, 403
        if guild_id:
            try:
                guild: Guild = Guild.query.filter_by(id=guild_id).first()
                user = User.query.filter_by(id=current_user.id).first()
                guild_member = GuildMembers()
                guild_member.member = user
                guild_member.guild = guild
                guild.members.append(guild_member)
                db.session.add(guild)
                invite.count += 1
                db.session.add(invite)
                db.session.commit()
                return {"message": "Joined guild"}, 200
            except IntegrityError:
                return {"message": "Already in guild"}, 403
        return "Sucess"
    return "", 404


@router.get('/{channel_id}/messages')
def get_messages(channel_id: int,
                 db: Session = Depends(deps.get_db),
                 current_user: User = Depends(deps.get_current_user)) -> List[dict]:
    messages = db.query(Message).filter_by(channel_id=channel_id).order_by(
        Message.timestamp.desc()).limit(25).all()
    return {"messages": [message.serialize() for message in messages]}


@router.post('/{channel_id}/messages')
def post_message(channel_id: int,
                 message: MessageCreate,
                 current_user: User = Depends(deps.get_current_user),
                 db: Session = Depends(lambda: deps.get_db())) -> dict:
    message = Message()
    message.channel_id = channel_id
    message.author_id = current_user()
    message.content = message.content.strip()
    message.timestamp = datetime.now()
    db.add(message)
    db.commit()
    return {"message": message.serialize()}


@router.get('/{channel_id}/messages/{message_id}')
def get_message(channel_id: int,
                message_id: int,
                current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)) -> dict:
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        return {"message": message.serialize()}
    return "", 404


@router.delete('/{channel_id}/messages/{message_id}')
def delete_message(channel_id: int,
                   message_id: int,
                   current_user: User = Depends(deps.get_current_user),
                   db: Session = Depends(deps.get_db)) -> dict:
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        if message.author_id == current_user.id:
            db.delete(message)
            db.commit()
            return "", 204
        return {"message": "Not authorized"}, 403
    return "", 404


@router.patch('/{channel_id}/messages/{message_id}')
def edit_message(channel_id: int,
                 message_id: int, message: MessageCreate,
                 current_user: User = Depends(deps.get_current_user),
                 db: Session = Depends(deps.get_db)) -> dict:
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        if message.author_id == current_user.id:
            message.content = message.content.strip()
            db.add(message)
            db.commit()
            return {"message": message.serialize()}
        return {"message": "Not authorized"}, 403
    return "", 404


@router.post('/{channel_id}/invites')
def invite(channel_id: int,
           data: ChannelInvite,
           current_user: User = Depends(deps.get_current_user),
           db: Session = Depends(deps.get_db)):
    if data.unique == False:
        invite = db.query(Invite).filter_by(channel_id=channel_id).\
            filter_by(user_id=current_user.id).\
            filter_by(max_uses=data.max_uses).\
            filter_by(max_age=data.max_age).first()
        if invite:
            return {**invite.serialize()}
    invite = Invite(channel_id, current_user.id,
                    data.max_age, data.max_uses, db)
    db.add(invite)
    db.commit()
    return {**invite.serialize()}


@router.get('/{channel_id}/invites')
def get_invites(channel_id: int, db: Session = Depends(deps.get_db),):
    invites = db.query(Invite).filter_by(channel_id=channel_id).all()
    return {'invites': [invite.serialize() for invite in invites]}


class ChannelValidate(BaseModel):
    name: str
    type: str
    guild_id: Optional[str]
    parent_id: Optional[int]
    owner_id: Optional[int]
    nsfw: Optional[bool]
    topic: Optional[str]
    privateChannel: bool

    @validator('name')
    def name_validate(cls, v: str, values):
        v = v.strip()
        if v is None:
            raise ValueError("Name cannot be empty")
        if len(v) > 80:
            raise ValueError("Name must be less than 100 characters")
        elif len(v) < 2:
            raise ValueError("Name must be at least 2 characters")
        return v

    @validator('nsfw')
    def nsfw_validate(cls, v: Optional[bool]):
        return bool(v)

    @validator('topic')
    def topic_validate(cls, v: str):
        v = v.strip()
        if 1 <= len(v) <= 1024:
            raise ValueError("Topic must be less than 1024 characters")
        return v or ""

    @validator("owner_id")
    def validate_owner_id(cls, field):
        if field is not None:
            user = User.query.filter_by(id=int(field)).first()
            if user is None:
                raise ValueError("Invalid owner id")
        return field

    @validator("parent_id")
    def validate_parent_id(cls, field):
        if field is not None:
            channel = Channel.query.filter_by(id=int(field)).first()
            if channel is None:
                raise ValueError("Invalid parent id")
        return field

    @validator("guild_id")
    def validate_guild_id(cls, field):
        if field is not None:
            guild = Guild.query.filter_by(id=int(field)).first()
            if guild is None:
                raise ValueError("Invalid guild id")
        return field

    @ validator("type")
    def validate_type(cls, field):
        if field not in ChannelType.__members__:
            raise ValueError("Invalid channel type")
        return field


@router.post("/create")
def create(data: ChannelValidate, db: Session = Depends(deps.get_db)):
    try:
        user = db.query(User).filter_by(id=data.owner_id).first()
        channel = Channel(data.type, data.guild_id, data.name,
                          data.topic, data.nsfw, data.owner_id, data.parent_id)
        if data.owner_id and user:
            channel.members.append(user)
        db.add(channel)
        db.commit()
        return {"success": True, "channel": channel.serialize()}, 200
    except ValidationError as e:
        return {"success": False, "error": e.json()}, 400
