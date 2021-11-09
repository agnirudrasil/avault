from typing import Optional
from flask import Blueprint, jsonify

from avault.invites import Invite


bp = Blueprint('invites', __name__, url_prefix='/invites')


@bp.route('/<string:code>')
def get_invite(code):
    invite: Optional[Invite] = Invite.query.filter_by(code=code).first()
    if invite:
        return jsonify(**invite.serialize())
    return jsonify({'error': 'Invite not found'}), 404
