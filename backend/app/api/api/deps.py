
from typing import Generator
from api.core.compute_permissions import compute_overwrites
from api.core.permissions import Permissions
from api.models.invites import Invite

from fastapi import Depends, HTTPException, status, Request
from fastapi.security import OAuth2PasswordBearer
from jose import jwt
from pydantic import ValidationError
from sqlalchemy.orm import Session

from api import models, schemas, crud
from api.core import security
from api.core.config import settings
from api.db.session import SessionLocal

reusable_oauth2 = OAuth2PasswordBearer(
    tokenUrl=f"{settings.API_V1_STR}/auth/access-token"
)


def get_db() -> Generator:
    try:
        db = SessionLocal()
        yield db
    finally:
        db.close()


def get_current_user(
    db: Session = Depends(get_db), token: str = Depends(reusable_oauth2)
) -> models.User:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    user = crud.user.get(db, id=token_data.sub)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user


class InvitePerms:
    def __init__(self, permission: Permissions) -> None:
        self.permission = permission

    def __call__(
        self,
        request: Request,
        current_user: models.User = Depends(get_current_user),
        db: Session = Depends(get_db),
    ) -> Invite:
        code = request.path_params["code"]
        invite: Invite = db.query(models.Invite).filter_by(id=code).first()
        if not invite:
            raise HTTPException(status_code=404, detail="Invite not found")
        channels = invite.channel
        if channels.guild_id:
            guild_member: models.GuildMembers = db.query(models.GuildMember).filter_by(
                user_id=current_user.id, guild_id=channels.guild_id
            ).first()
            if guild_member:
                permissions = compute_overwrites(
                    guild_member.permissions, channels, db)
                if permissions & self.permission == self.permission:
                    return invite
        if channels.is_member(current_user.id):
            return invite
        raise HTTPException(
            status_code=403, detail="You do not have permission to delete this invite")
