from datetime import datetime, timedelta
from typing import Optional
from sqlalchemy.exc import IntegrityError
from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from avault.channels import Channel, ChannelType
from avault.guild import Guild, GuildMembers
from avault.invites import Invite
from avault.users import User
from avault import db
from pydantic import BaseModel, validator, ValidationError


bp = Blueprint("channels", __name__, url_prefix="/channels")


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


@bp.route('/join/<string:code>', methods=['GET'])
@jwt_required()
def join_guild(code):
    invite: Invite = Invite.query.filter_by(id=code).first()
    if invite:
        guild_id = invite.channel.guild_id
        if invite.max_uses != 0 and invite.max_uses == invite.count:
            db.session.delete(invite)
            db.session.commit()
            return jsonify({"message": "Invite has been used"}), 403
        if invite.max_age != 0 and (invite.created_at + timedelta(seconds=invite.max_age)) >= datetime.now():
            # db.session.delete(invite)
            # db.session.commit()
            return jsonify({"message": "Invite has expired"}), 403
        if guild_id:
            try:
                guild: Guild = Guild.query.filter_by(id=guild_id).first()
                user = User.query.filter_by(id=get_jwt_identity()).first()
                guild_member = GuildMembers()
                guild_member.member = user
                guild_member.guild = guild
                guild.members.append(guild_member)
                db.session.add(guild)
                invite.count += 1
                db.session.add(invite)
                db.session.commit()
                return jsonify({"message": "Joined guild"}), 200
            except IntegrityError:
                return jsonify({"message": "Already in guild"}), 403
        return "Sucess"
    return "", 404


@bp.route('/<int:channel_id>/invites', methods=['POST', 'GET'])
@jwt_required()
def invite(channel_id):
    if request.method == 'POST':
        try:
            data = ChannelInvite(**request.json)
            if data.unique == False:
                invite = Invite.query.filter_by(channel_id=channel_id).\
                    filter_by(user_id=get_jwt_identity()).\
                    filter_by(max_uses=data.max_uses).\
                    filter_by(max_age=data.max_age).first()
                if invite:
                    return jsonify(**invite.serialize())
            invite = Invite(channel_id, get_jwt_identity(),
                            data.max_age, data.max_uses)
            db.session.add(invite)
            db.session.commit()
            return jsonify(**invite.serialize())
        except ValidationError as e:
            return jsonify({'errors': e.json()}), 400
    else:
        invites = Invite.query.filter_by(channel_id=channel_id).all()
        return jsonify({'invites': [invite.serialize() for invite in invites]})


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
