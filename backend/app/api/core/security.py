import secrets
from datetime import datetime, timedelta
from typing import Any, Union, Optional, Literal

import pyotp
from fastapi import Response
from jose import jwt
from passlib.context import CryptContext
from sqlalchemy.orm import Session

from api import schemas, models
from api.core.config import settings
from api.utils import snowflake

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

ALGORITHM = "HS256"


def verify_otp(code: str, mfa) -> bool:
    if len(code) == 6:
        totp = pyotp.TOTP(mfa.secret)
        if not totp.verify(code):
            return False
    else:
        hotp = pyotp.HOTP(mfa.backup_secret, 8)
        if not hotp.verify(code, mfa.backup_count):
            return False
        mfa.backup_count += 1
    return True


def create_access_token(
        db: Session,
        subject: Union[str, Any], expires_delta: Optional[Union[timedelta, Literal["na"]]] = None, iat: datetime = None,
        mfa_enabled: bool = False
) -> str:
    if expires_delta == "na":
        expire = None
    elif expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )

    to_encode = {"sub": str(subject), "iat": iat, "mfa": mfa_enabled}
    if expire is not None:
        to_encode["exp"] = expire
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    db.query(models.User).filter_by(id=subject).update({
        "last_login": iat
    })
    db.commit()
    return encoded_jwt


def create_refresh_token(
        db: Session,
        response: Response,
        subject: Union[str, Any],
        expires_delta: timedelta = None,
        iat: datetime = None,
        mfa_enabled: bool = False
) -> str:
    encoded_jwt = create_access_token(db, subject, expires_delta, iat, mfa_enabled)
    response.set_cookie(
        key='jid', value=encoded_jwt,
        max_age=settings.REFRESH_TOKEN_EXPIRE_MINUTES * 60,
        httponly=True
    )
    return encoded_jwt


def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    return pwd_context.hash(password)


def generate_token(length: int):
    return secrets.token_urlsafe(length)


def verify_jwt(token: str) -> schemas.TokenPayload:
    payload = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[ALGORITHM]
    )
    return schemas.TokenPayload(**payload)


snowflake_id = snowflake.generator()
