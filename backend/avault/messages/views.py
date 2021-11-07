import functools
from typing import List
from flask import Blueprint, jsonify, request
from flask_jwt_extended.utils import get_jwt_identity
from avault import db, socketio
from avault.guild import Guild, GuildMembers
from avault.users import User
from avault.messages import Message
from flask_jwt_extended import verify_jwt_in_request, jwt_required
from flask_socketio import disconnect, emit, join_room

bp = Blueprint('messages', __name__, url_prefix='/messages')


@bp.route('/<int:channel_id>', methods=['GET'])
@jwt_required()
def get_messages(channel_id: int) -> List[dict]:
    messages = Message.query.filter_by(channel_id=channel_id).order_by(
        Message.timestamp.desc()).limit(25).all()
    return jsonify({"messages": [message.serialize() for message in messages]})


def authenticated_only(f):
    @functools.wraps(f)
    def wrapped(*args, **kwargs):
        verify_jwt_in_request(locations=['cookies'])
        id = get_jwt_identity()
        if id:
            return f(*args, **kwargs)
        else:
            disconnect()
    return wrapped


@socketio.on('connect')
@authenticated_only
def connect():
    user = User.query.filter_by(id=get_jwt_identity()).first()
    guilds: List[GuildMembers] = user.guilds
    my_guilds = []
    for guild in guilds:
        my_guilds.append(guild.guild.preview())
        join_room(guild.guild_id)
    emit('connect-data', {'guilds': my_guilds})


@socketio.on('message')
@authenticated_only
def message(data):
    print(data)
    user = User.query.filter_by(id=get_jwt_identity()).first()
    message: Message = Message(
        data['content'], data['channel'], get_jwt_identity(), False, [], [])
    db.session.add(message)
    db.session.commit()
    if message.guild_id:
        return emit('message', {'message': message.serialize()},
                    to=message.channel.guild_id)


@socketio.on('get-messages')
@authenticated_only
@socketio.on('disconnect')
def disconnect():
    print('Client disconnected')
