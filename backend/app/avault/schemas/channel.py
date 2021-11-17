from typing import Literal, Optional
from avault.models.channels import ChannelType
from pydantic import BaseModel, validator


class ThreadCreate(BaseModel):
    name: str
    auto_arrive_duration: Optional[int] = 1440
    type: Literal['public', 'private']


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
        if len(v) > 100:
            raise ValueError("Name must be less than 100 characters")
        elif len(v) < 1:
            raise ValueError("Name must be at least 1 characters")
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

    @ validator("type")
    def validate_type(cls, field):
        if field not in ChannelType.__members__:
            raise ValueError("Invalid channel type")
        return field


class ChannelEdit(BaseModel):
    name: str
    icon: Optional[str] = None
