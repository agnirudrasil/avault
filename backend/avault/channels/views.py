from wtforms import Form, StringField, validators, IntegerField, ValidationError, BooleanField
from flask import Blueprint, request
from flask_jwt_extended import jwt_required, get_jwt_identity
from avault.channels import Channel, ChannelType
from avault.guild import Guild
from avault.users import User
from avault import db


bp = Blueprint("channels", __name__, url_prefix="/channels")


class ChannelValidate(Form):
    name = StringField("name", [validators.Length(
        min=1, max=100), validators.DataRequired()])
    type = StringField("type", [validators.DataRequired()])
    guild_id = IntegerField("guild_id")
    parent_id = IntegerField("parent_id")
    owner_id = IntegerField("owner_id")
    position = IntegerField("position")
    nsfw = BooleanField("nsfw", [validators.DataRequired()])
    topic = StringField("topic", [validators.Length(
        min=1, max=1024)])

    def validate_owner_id(self, field):
        if field.data is not None:
            user = User.get_by_id(field.data)
            if user is None:
                raise ValidationError("Invalid owner id")

    def validate_parent_id(self, field):
        if field.data is not None:
            channel = Channel.get_by_id(field.data)
            if channel is None:
                raise ValidationError("Invalid parent id")

    def validate_guild_id(self, field):
        if field.data is not None:
            guild = Guild.get_by_id(field.data)
            if guild is None:
                raise ValidationError("Invalid guild id")

    def validate_type(self, field):
        if field.data not in ChannelType.__members__:
            raise ValidationError("Invalid channel type")


@bp.route("/create", methods=["POST"])
@jwt_required()
def create():
    form = ChannelValidate(request.form)
    if (form.validate()):
        user = User.get_by_id(form.owner_id.data)
        channel = Channel(
            name=form.name.data,
            type=ChannelType[form.type.data],
            guild_id=form.guild_id.data,
            parent_id=form.parent_id.data,
            owner_id=form.owner_id.data,
            position=form.position.data,
            nsfw=form.nsfw.data,
            topic=form.topic.data
        )
        if form.data.owner_id and user:
            channel.members.append(user)
        db.session.add(channel)
        db.save()
