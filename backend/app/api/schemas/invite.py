from typing import Optional
from pydantic import BaseModel, validator


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
