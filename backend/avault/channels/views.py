from typing import Optional
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from avault.channels import Channel, ChannelType
from avault.guild import Guild
from avault.users import User
from avault import db
from pydantic import BaseModel, validator, ValidationError


bp = Blueprint("channels", __name__, url_prefix="/channels")


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

    @validator("type")
    def validate_type(cls, field):
        if field not in ChannelType.__members__:
            raise ValueError("Invalid channel type")
        return field


@bp.route("/create", methods=["POST"])
@jwt_required()
def create():
    try:
        data = ChannelValidate(**request.json)
        print(request.json)
        user = User.query.filter_by(id=data.owner_id).first()
        print(data)
        channel = Channel(data.type, data.guild_id, data.name,
                          data.topic, data.nsfw, data.owner_id, data.parent_id)
        if data.owner_id and user:
            channel.members.append(user)
        db.session.add(channel)
        db.session.commit()
        return jsonify({"success": True, "channel": channel.serialize()}), 200
    except ValidationError as e:
        return jsonify({"success": False, "error": e.json()}), 400
