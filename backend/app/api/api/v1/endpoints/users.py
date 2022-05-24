from datetime import timedelta, datetime
from typing import List, Optional

import pyotp
import sqlalchemy.exc
from fastapi import APIRouter, Depends, Response, Security, HTTPException
from pydantic import BaseModel, validator
from sqlalchemy import func
from sqlalchemy.orm import Session

from api.api import deps
from api.core import emitter, security, settings
from api.core.events import Events, websocket_emitter
from api.models import Relationship
from api.models.channels import Channel, ChannelType, ChannelMembers
from api.models.guilds import GuildMembers
from api.models.user import User, MFA, Unread
from api.schemas.user import EnableTOTP
from api.utils.validate_avatar import validate_avatar

router = APIRouter()


class PatchUser(BaseModel):
    username: Optional[str]
    password: Optional[str]
    new_password: Optional[str]
    email: Optional[str]
    avatar: Optional[str]
    accent_color: Optional[int]
    banner: Optional[str]
    bio: Optional[str]


class CreateDm(BaseModel):
    recipient_ids: List[int]

    @classmethod
    @validator("recipient_ids")
    def validate_recipient_ids(cls, v):
        if len(v) > 9:
            raise HTTPException(status_code=400, detail="Too many recipients")
        return v


class DisableTOTP(BaseModel):
    code: str


@router.get("/@me")
def get_me(oauth2_user: tuple[User, str] = Security(deps.get_oauth2_user, scopes=["identify"])):
    current_user, scope = oauth2_user
    if scope == "all" or "email" in scope.split(" "):
        return current_user.json()
    return current_user.serialize()


@router.patch("/@me")
async def edit_me(body: PatchUser, db: Session = Depends(deps.get_db),
                  current_user: User = Depends(deps.get_current_user)):
    body_dict = body.dict(exclude_unset=True)
    if "avatar" in body_dict:
        if body_dict["avatar"]:
            avatar_hash = await validate_avatar(current_user.id, body_dict["avatar"])
            current_user.avatar = avatar_hash
        else:
            current_user.avatar = None
    if "accent_color" in body_dict:
        current_user.accent_color = body_dict["accent_color"]
    if "banner" in body_dict:
        if body_dict["banner"]:
            banner_hash = await validate_avatar(current_user.id, body_dict["banner"], "banners")
            current_user.banner = banner_hash
        else:
            current_user.banner = None
    if "bio" in body_dict:
        current_user.bio = body_dict["bio"]
    if "username" in body_dict:
        if current_user.check_password(body_dict.get("password", "")):
            if body_dict["username"]:
                current_user.username = body_dict["username"]
        else:
            raise HTTPException(status_code=401, detail="Incorrect password")
    if "new_password" in body_dict:
        if current_user.check_password(body_dict.get("password", "")):
            current_user.update_password(body_dict["new_password"])
        else:
            raise HTTPException(status_code=401, detail="Incorrect password")

    db.commit()
    return current_user.serialize()


@router.post("/@me/channels")
async def create_dm_channel(body: CreateDm, db: Session = Depends(deps.get_db),
                            current_user: User = Depends(deps.get_current_user)):
    recipient_ids = set(body.recipient_ids)

    if current_user.id in recipient_ids:
        recipient_ids.remove(current_user.id)
    if len(recipient_ids) > 9:
        raise HTTPException(status_code=400, detail="Too many recipients")

    if len(recipient_ids) == 1:
        existing_channel = db.query(Channel).filter(
            db.query(ChannelMembers.channel_id).filter(
                ChannelMembers.user_id.in_([*[recipient_id for recipient_id in recipient_ids], current_user.id]),
                ChannelMembers.channel_id == Channel.id).having(
                func.count("*") == (len(recipient_ids) + 1)).exists()
        ).first()

        if existing_channel:
            for channel_member in existing_channel.members:
                if channel_member.user_id == current_user.id and channel_member.closed:
                    channel_member.closed = False
                    db.commit()
                    await websocket_emitter(channel_id=existing_channel.id, event=Events.CHANNEL_CREATE, guild_id=None,
                                            args=existing_channel.serialize(current_user.id),
                                            user_id=current_user.id, db=db)

            return existing_channel.serialize(current_user.id)

    if len(recipient_ids) == 1:
        channel = Channel(channel_type=ChannelType.dm, guild_id=None, name=None)

        users = db.query(User).filter(User.id.in_(body.recipient_ids)).first()

        for user in [users, current_user]:
            unread = Unread(channel_id=channel.id, user_id=user.id, message_id=None)
            db.add(unread)
            channel_member = ChannelMembers(closed=current_user.id != user.id)
            channel_member.user = user
            channel.members.append(channel_member)
        db.add(channel)
        db.commit()

        await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_CREATE, guild_id=None,
                                args=channel.serialize(current_user.id),
                                user_id=current_user.id, db=db)

        return channel.serialize(current_user.id)
    else:
        if current_user.bot:
            raise HTTPException(status_code=403, detail="Bots cannot create group dms")

        users = db.query(User).filter(User.id.in_(body.recipient_ids)).all()

        channel = Channel(channel_type=ChannelType.group_dm, guild_id=None, name=None, owner_id=current_user.id)

        for user in users:
            if user.bot:
                raise HTTPException(status_code=403, detail="Bots cannot be in a group dm")
            friend = db.query(Relationship).filter_by(type=1).filter(
                ((Relationship.addressee_id == current_user.id) & (Relationship.requester_id == user.id)) |
                ((Relationship.requester_id == current_user.id) & (Relationship.addressee_id == user.id))).first()
            if not friend:
                raise HTTPException(status_code=403, detail="You are not friends with this user")

            unread = Unread(channel_id=channel.id, user_id=user.id, message_id=None)
            db.add(unread)
            channel_member = ChannelMembers(closed=False)
            channel_member.user = user
            channel.members.append(channel_member)

        unread = Unread(channel_id=channel.id, user_id=current_user.id, message_id=None)
        db.add(unread)
        channel_member = ChannelMembers(closed=False)
        channel_member.user = current_user
        channel.members.append(channel_member)

        db.add(channel_member)
        db.commit()

        for user in [*users, current_user]:
            await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_CREATE, guild_id=None,
                                    args=channel.serialize(user.id), db=db)

        return channel.serialize(current_user.id)


@router.get("/@me/channels")
def get_dm_channels(current_user: User = Depends(deps.get_current_user)):
    return {[channel.channel.serialize(current_user.id) for channel in
             filter(lambda c: not c.closed, current_user.channels)]}


@router.get('/{user_id}', dependencies=[Depends(deps.get_current_user)])
def get_user(user_id: int, response: Response, db: Session = Depends(deps.get_db)):
    return {"message": "User not found"}


@router.get('/@me/guilds')
def get_guilds(oauth2_user: tuple[User, str] = Security(deps.get_oauth2_user, scopes=["guilds"])):
    current_user, scope = oauth2_user

    return [guild.guild.serialize() for guild in current_user.guilds]


@router.delete('/@me/guilds/{guild_id}', status_code=204)
async def leave_guild(guild_id: int, response: Response,
                      current_user: User = Depends(deps.get_current_user),
                      db: Session = Depends(deps.get_db)):
    guild_member = db.query(GuildMembers).filter_by(
        user_id=current_user.id, guild_id=guild_id).first()
    if guild_member:
        if guild_member.is_owner:
            response.status_code = 403
            return {"message": "Cannot leave guild, you are the owner"}
        if current_user.bot:
            await current_user.application.remove_bot_from_guild(db, guild_member.guild)
        else:
            db.delete(guild_member)
            db.commit()
            await emitter.in_room(str(current_user.id)).sockets_leave(str(guild_id))
            await websocket_emitter(channel_id=None, guild_id=guild_id, event=Events.GUILD_MEMBER_REMOVE,
                                    args=guild_member.serialize(), db=db)
            await websocket_emitter(channel_id=None, guild_id=guild_id, event=Events.GUILD_DELETE,
                                    args={'id': str(guild_id)},
                                    user_id=current_user.id, db=db)
        return
    response.status_code = 404
    return {'success': False}


@router.post("/@me/totp/disable")
async def disable_totp(body: DisableTOTP, response: Response, current_user: User = Depends(deps.get_current_user),
                       db: Session = Depends(deps.get_db)):
    if current_user.bot:
        raise HTTPException(status_code=403, detail="Bots cannot disable 2FA")
    if not current_user.mfa_enabled:
        raise HTTPException(status_code=403, detail="2FA is not enabled")

    mfa = db.query(MFA).filter_by(user_id=current_user.id).first()
    if not mfa:
        raise HTTPException(status_code=403, detail="2FA is not enabled")
    if not security.verify_otp(body.code, mfa):
        raise HTTPException(status_code=401, detail="Invalid 2FA code")

    current_user.mfa_enabled = False
    db.delete(mfa)
    db.commit()

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    iat = datetime.utcnow()

    return {
        "access_token": security.create_access_token(db, current_user.id, expires_delta=access_token_expires, iat=iat,
                                                     mfa_enabled=current_user.mfa_enabled),
        "refresh_token": security.create_refresh_token(db, response, current_user.id, iat=iat,
                                                       expires_delta=refresh_token_expires,
                                                       mfa_enabled=current_user.mfa_enabled),
    }


@router.post("/@me/totp/enable")
async def enable_totp(body: EnableTOTP, response: Response, db: Session = Depends(deps.get_db),
                      current_user: User = Depends(deps.get_current_user)):
    if current_user.bot:
        raise HTTPException(status_code=403, detail="Bots cannot enable 2FA")

    if current_user.mfa_enabled:
        raise HTTPException(status_code=400, detail="TOTP is already enabled")

    if not current_user.check_password(body.password):
        raise HTTPException(status_code=401, detail="Incorrect password or code")

    totp = pyotp.TOTP(body.secret)

    if not totp.verify(body.code):
        raise HTTPException(status_code=401, detail="Incorrect password or code")

    current_user.mfa_enabled = True
    backup_secret = pyotp.random_base32(32)
    mfa = MFA(current_user.id, body.secret, backup_secret)
    db.add(mfa)
    db.commit()

    backup_codes = []
    hotp = pyotp.HOTP(backup_secret, digits=8)

    for i in range(10):
        backup_codes.append({
            "code": hotp.at(i),
            "user_id": current_user.id,
            "consumed": False
        })

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    iat = datetime.utcnow()

    return {
        "backup_codes": backup_codes,
        "access_token": security.create_access_token(db, current_user.id, expires_delta=access_token_expires, iat=iat,
                                                     mfa_enabled=current_user.mfa_enabled),
        "refresh_token": security.create_refresh_token(db, response, current_user.id, iat=iat,
                                                       expires_delta=refresh_token_expires,
                                                       mfa_enabled=current_user.mfa_enabled),
    }


@router.get("/@me/relationships")
async def get_relationships(db: Session = Depends(deps.get_db), current_user: User = Depends(deps.get_current_user)):
    relationships: list[Relationship] = db.query(Relationship).filter(
        ((Relationship.addressee_id == current_user.id) & (Relationship.type != 2)) | (
                Relationship.requester_id == current_user.id)).all()

    return [relationship.serialize(current_user.id) for relationship in relationships]


class RelationshipCreate(BaseModel):
    username: str
    tag: str


class RelationshipUpdate(BaseModel):
    type: Optional[int] = None


async def create_relationship_func(db: Session, current_user: User, user: User):
    if current_user.bot:
        raise HTTPException(status_code=403, detail="Bots cannot create relationships")

    if not user:
        raise HTTPException(status_code=404, detail="User not found")

    if user.bot:
        raise HTTPException(status_code=403, detail="Bots cannot create relationships")

    if user.id == current_user.id:
        raise HTTPException(status_code=400, detail="You cannot create a relationship with yourself")

    existing_relationship: Relationship = db.query(Relationship).filter_by(
        addressee_id=current_user.id).filter_by(requester_id=user.id).first()

    if existing_relationship:
        raise HTTPException(status_code=400, detail="You already have a relationship with this user")

    try:
        relationship = Relationship(requester_id=current_user.id, addressee_id=user.id)

        db.add(relationship)
        db.commit()
        await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_ADD,
                                args=relationship.serialize(current_user.id), user_id=current_user.id, db=db)
        await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_ADD,
                                args=relationship.serialize(user.id), user_id=user.id, db=db)
    except sqlalchemy.exc.IntegrityError:
        raise HTTPException(status_code=400, detail="You already have a relationship with this user")

    return ""


@router.post("/@me/relationships", status_code=204)
async def create_relationship(
        body: RelationshipCreate,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_user),
):
    user: User = db.query(User).filter_by(username=body.username).filter_by(tag=body.tag).first()
    return await create_relationship_func(db, current_user, user)


@router.put("/@me/relationships/{relationship_id}", status_code=204)
async def accept_relationship(
        relationship_id: int,
        body: RelationshipUpdate,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_user),
):
    if body.type == 2:
        existing_relationship: Relationship = db.query(Relationship).filter_by(
            requester_id=current_user.id).filter_by(addressee_id=relationship_id).first()
        if existing_relationship:
            existing_relationship.type = 2
            await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_REMOVE,
                                    args={"id": str(current_user.id)}, user_id=relationship_id, db=db)
        else:
            existing_relationship = Relationship(requester_id=current_user.id, addressee_id=relationship_id,
                                                 relationship_type=2)
            db.add(existing_relationship)

        other_relationship: Relationship = db.query(Relationship).filter_by(
            requester_id=relationship_id).filter_by(addressee_id=current_user.id).filter(Relationship.type != 2).first()
        if other_relationship:
            db.delete(other_relationship)
            await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_REMOVE,
                                    args={"id": str(relationship_id)}, user_id=current_user.id, db=db)
            await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_REMOVE,
                                    args={"id": str(current_user.id)}, user_id=relationship_id, db=db)

        db.commit()

        await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_ADD,
                                args=existing_relationship.serialize(current_user.id), user_id=current_user.id, db=db)

        return ""

    relationship: Relationship = db.query(Relationship).filter_by(addressee_id=current_user.id).filter_by(
        requester_id=relationship_id).first()

    if not relationship:
        try:
            user = db.query(User).filter_by(id=relationship_id).first()
            return await create_relationship_func(db, current_user, user)
        except sqlalchemy.exc.IntegrityError:
            raise HTTPException(status_code=404, detail="Relationship not found")

    if relationship.addressee_id != current_user.id:
        raise HTTPException(status_code=403, detail="You do not have permission to update this relationship")

    if relationship.type != 0:
        raise HTTPException(status_code=400, detail="Relationship already accepted")

    relationship.type = 1
    db.commit()

    await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_UPDATE,
                            args=relationship.serialize(current_user.id), user_id=current_user.id, db=db)
    await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_UPDATE,
                            args=relationship.serialize(relationship_id), user_id=relationship_id, db=db)

    return ""


@router.delete("/@me/relationships/{relationship_id}", status_code=204)
async def delete_relationship(
        relationship_id: int,
        db: Session = Depends(deps.get_db),
        current_user: User = Depends(deps.get_current_user),
):
    relationship: Relationship = db.query(Relationship).filter(
        ((Relationship.addressee_id == relationship_id) & (Relationship.requester_id == current_user.id)) |
        ((Relationship.requester_id == relationship_id) & (Relationship.addressee_id == current_user.id))).first()

    if not relationship:
        raise HTTPException(status_code=404, detail="Relationship not found")

    await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_REMOVE,
                            args=relationship.serialize(current_user.id), user_id=current_user.id, db=db)
    await websocket_emitter(channel_id=None, guild_id=None, event=Events.RELATIONSHIP_REMOVE,
                            args=relationship.serialize(relationship_id), user_id=relationship_id, db=db)
    db.delete(relationship)
    db.commit()

    return ""
