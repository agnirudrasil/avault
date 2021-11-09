from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from avault.guild import GuildMembers
from avault.users import User
from avault import db

bp = Blueprint('users', __name__, url_prefix='/users')


@bp.route('/@me/guilds', methods=['GET'])
@jwt_required()
def get_guilds():
    user = User.query.filter_by(id=get_jwt_identity()).first()
    if user:
        guilds = user.guilds
        if guilds:
            return jsonify({'guilds': [guild.guild.preview() for guild in guilds]})
        return jsonify({'guilds': []})
    return jsonify({'guilds': []}), 401


@bp.route('/@me/guilds/<int:guild_id>', methods=['DELETE'])
@jwt_required()
def leave_guild(guild_id):
    guild_memeber = GuildMembers.query.filter_by(
        user_id=get_jwt_identity(), guild_id=guild_id).first()
    if guild_memeber:
        db.session.delete(guild_memeber)
        db.session.commit()
        return '', 204
    return jsonify({'success': False}), 404
