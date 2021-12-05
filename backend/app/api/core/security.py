from datetime import datetime, timedelta
import secrets
from typing import Any, Union
from api import schemas
from fastapi import Response

from jose import jwt
from passlib.context import CryptContext

from api.core.config import settings
from api.utils import snowflake

pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


ALGORITHM = "HS256"


def create_access_token(
    subject: Union[str, Any], expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
    return encoded_jwt


def create_refresh_token(
    response: Response,
    subject: Union[str, Any],
    expires_delta: timedelta = None
) -> str:
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(
            minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES
        )
    to_encode = {"exp": expire, "sub": str(subject)}
    encoded_jwt = jwt.encode(
        to_encode, settings.SECRET_KEY, algorithm=ALGORITHM)
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


def generate_token(len: int):
    return secrets.token_urlsafe(len)


def verify_jwt(token: str) -> schemas.TokenPayload:
    payload = jwt.decode(
        token, settings.SECRET_KEY, algorithms=[ALGORITHM]
    )
    return schemas.TokenPayload(**payload)


snowflake_id = snowflake.generator()
