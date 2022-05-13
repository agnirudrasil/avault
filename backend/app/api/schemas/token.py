from typing import Optional

from pydantic import BaseModel, validator


class Token(BaseModel):
    access_token: str
    refresh_token: str


class TokenPayload(BaseModel):
    sub: Optional[int] = None
    iat: int = None
    mfa: Optional[bool] = None


class Login(BaseModel):
    email: str
    password: str
    code: Optional[str] = None

    @classmethod
    @validator("code")
    def check_code(cls, v):
        if isinstance(v, str):
            if len(v) != 6 or len(v) != 8:
                raise ValueError("Invalid code")
        return v
