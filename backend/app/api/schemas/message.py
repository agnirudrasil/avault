from datetime import datetime
from typing import Literal, Optional

from pydantic import BaseModel, HttpUrl, validator, root_validator, AnyUrl


class Footer(BaseModel):
    text: str
    icon_url: Optional[HttpUrl] = None

    @validator("text")
    def validate_text(cls, v):
        if len(v) > 2048:
            raise ValueError("footer.text is longer that 2048 characters")
        return v


class EmbedProvider(BaseModel):
    name: Optional[str] = None
    url: Optional[HttpUrl] = None


class EmbedImage(BaseModel):
    url: Optional[AnyUrl] = None
    height: Optional[int] = None
    width: Optional[int] = None


class EmbedAuthor(BaseModel):
    name: str
    icon_url: Optional[HttpUrl] = None
    url: Optional[HttpUrl] = None

    @classmethod
    @validator("name")
    def validate_name(cls, v):
        if len(v) > 256:
            raise ValueError("author.name is longer that 256 characters")
        return v


class EmbedFields(BaseModel):
    name: str
    value: str
    inline: Optional[bool] = True

    @classmethod
    @validator("name")
    def validate_name(cls, v):
        if len(v) > 256:
            raise ValueError("field.name is longer that 256 characters")
        return v

    @classmethod
    @validator("value")
    def validate_value(cls, v):
        if len(v) > 1024:
            raise ValueError("field.value is longer that 256 characters")
        return v


class Embeds(BaseModel):
    title: Optional[str] = None
    type: Optional[Literal["rich", "image", "video",
                           'gifv', 'article', 'link']] = "rich"
    description: Optional[str] = None
    url: Optional[str] = None
    timestamp: Optional[datetime] = None
    color: Optional[int] = 0
    footer: Optional[Footer] = None
    image: Optional[EmbedImage] = None
    thumbnail: Optional[EmbedImage] = None
    author: Optional[EmbedAuthor] = None
    fields: Optional[list[EmbedFields]] = []
    video: Optional[EmbedImage] = None
    provider: Optional[EmbedProvider] = None

    @classmethod
    @validator("title")
    def validate_title(cls, v):
        if len(v) > 256:
            raise ValueError("embed.title is longer than 256 characters")
        return v

    @classmethod
    @validator("description")
    def validate_embed_len(cls, v):
        if len(v) > 4096:
            raise ValueError("embed.description is longer than 256 characters")
        return v

    @classmethod
    @root_validator
    def validate_fields(cls, v):
        fields = v.get("fields")
        if len(fields) > 25:
            raise ValueError("embed has more than 25 fields")
        return v

    @classmethod
    @root_validator
    def validate_length(cls, v):
        embed_length = 0
        fields, title, description, author, footer = v.get('fields'), v.get('title'), v.get('description'), v.get(
            'author'), v.get('footer')
        if title:
            embed_length += len(title)
        if description:
            embed_length += len(description)
        if author:
            embed_length += len(author.name)
        if footer:
            embed_length += len(footer.text)
        for field in fields:
            embed_length += len(field.name)
            embed_length += len(field.value)
        print(embed_length)
        if embed_length > 6000:
            raise ValueError('Characters in embeds exceed 6000')
        return v


class MessageCreate(BaseModel):
    content: Optional[str] = ""
    tts: bool = False
    embeds: Optional[list[Embeds]] = []
    message_reference: Optional[int] = None
