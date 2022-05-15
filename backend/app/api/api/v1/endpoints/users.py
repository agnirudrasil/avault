from datetime import timedelta, datetime
from typing import List, Optional

import pyotp
from fastapi import APIRouter, Depends, Response, BackgroundTasks, Security, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api.api import deps
from api.core import emitter, security, settings
from api.core.events import Events, websocket_emitter
from api.models.channels import Channel, ChannelType
from api.models.guilds import GuildMembers
from api.models.user import User, MFA
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
    recipient_id: int


class CreateGroup(BaseModel):
    recipient_ids: List[int]


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


# TODO: update this function
@router.post("/@me/channels")
def create_dm_channel(body: CreateDm, response: Response, db: Session = Depends(deps.get_db),
                      current_user: User = Depends(deps.get_current_user)):
    channel: Channel = Channel(ChannelType.dm, None, "", owner_id=current_user.id)
    recipient = db.query(User).filter_by(id=current_user.id).first()
    if not recipient:
        response.status_code = 404
        return {"message": "User not found"}
    channel.members.append(current_user)
    channel.members.append(recipient)
    db.add(channel)
    db.commit()
    return channel.serialize()


# TODO: update this function
@router.post("/@me/channels/group")
def create_group_dm(body: CreateGroup, response: Response, db: Session = Depends(deps.get_db),
                    current_user: User = Depends(deps.get_current_user)):
    channel: Channel = Channel(ChannelType.group_dm, None, "", owner_id=current_user.id)
    for recipient_id in body.recipient_ids:
        recipient = db.query(User).filter_by(id=recipient_id).first()
        if not recipient:
            response.status_code = 404
            return {"message": "User not found"}
        channel.members.append(recipient)
    channel.members.append(current_user)
    db.add(channel)
    db.commit()
    return channel.serialize()


@router.get("/@me/channels")
def get_dm_channels(current_user: User = Depends(deps.get_current_user)):
    return {[channel.serialize() for channel in current_user.channels]}


@router.get('/{user_id}', dependencies=[Depends(deps.get_current_user)])
def get_user(user_id: int, response: Response, db: Session = Depends(deps.get_db)):
    return {"message": "User not found"}


@router.get('/@me/guilds')
def get_guilds(oauth2_user: tuple[User, str] = Security(deps.get_oauth2_user, scopes=["guilds"])):
    current_user, scope = oauth2_user

    return [guild.guild.preview() for guild in current_user.guilds]


@router.delete('/@me/guilds/{guild_id}', status_code=204)
async def leave_guild(guild_id: int, response: Response, background_task: BackgroundTasks,
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
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_MEMBER_REMOVE,
                                     guild_member.serialize())
            background_task.add_task(websocket_emitter, None, guild_id, Events.GUILD_DELETE, {'id': str(guild_id)},
                                     current_user.id)
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
