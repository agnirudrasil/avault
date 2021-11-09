from sqlalchemy.sql.expression import false
from wtforms import Form, validators, StringField, FileField
from flask import Blueprint, jsonify, request
from avault import db
from avault.guild import Guild, GuildMembers
from avault.users import User
from avault.channels import Channel, ChannelType
from flask_jwt_extended import jwt_required, get_jwt_identity


bp = Blueprint('guild', __name__, url_prefix='/guilds')


class GuildCreate(Form):
    name = StringField('name', [validators.length(
        min=5, max=80), validators.DataRequired()])
    icon = FileField('icon')


@bp.route('/', methods=['POST'])
@jwt_required()
def create():
    form = GuildCreate(request.form)
    if form.validate():
        user_id = get_jwt_identity()
        user = User.query.filter_by(id=user_id).first()
        if user:
            guild = Guild(form.name.data, user_id)
            if form.icon.data:
                form.icon.data.save(
                    "/home/agnirudra/Projects/avault/backend/uploads/" + guild.id)
                guild.icon = "/home/agnirudra/Projects/avault/backend/uploads/" + guild.id
            guild_member = GuildMembers()
            category = Channel(ChannelType.guild_category,
                               guild.id, 'TEXT CHANNELS')
            general = Channel(ChannelType.guild_text,
                              guild.id, 'general')
            guild.channels.append(category)
            guild.channels.append(general)
            guild_member.member = user
            guild.members.append(guild_member)
            db.session.add(guild)
            db.session.commit()
            return jsonify({'success': True, 'guild': guild.preview()})
        return jsonify({'success': False, 'error': 'User not found'}), 401
    return jsonify({'success': 'false', 'errors': form.errors}), 403


@bp.route('/<int:guild_id>', methods=['GET'])
@jwt_required()
def get_guild(guild_id):
    guild = Guild.query.filter_by(id=guild_id).first()
    if guild and guild.is_member(get_jwt_identity()):
        return jsonify({'guild': guild.serialize()})
    return jsonify({'guild': None}), 404
