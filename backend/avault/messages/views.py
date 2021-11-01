from flask import Blueprint, jsonify
from avault import db
from avault.messages import Message

bp = Blueprint('messages', __name__, url_prefix='/messages')


@bp.route('/', methods=['GET'])
def get_messages():
    messages = Message.query.all()
    return jsonify([message.serialize() for message in messages])
