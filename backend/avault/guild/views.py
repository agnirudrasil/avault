from wtforms import Form, validators, StringField
from flask import Blueprint, jsonify, request
from avault import db
from avault.guild import Guild, GuildMembers
from avault.users import User
from flask_jwt_extended import jwt_required, get_jwt_identity


bp = Blueprint('guild', __name__, url_prefix='/guild')


class GuildCreate(Form):
    name = StringField('name', [validators.length(
        min=5, max=80), validators.DataRequired()])


@bp.route('/create', methods=['POST'])
@jwt_required()
def create():
    form = GuildCreate(request.form)
    if form.validate():
        user = User.query.filter_by(id=get_jwt_identity()).first()
        if user:
            guild = Guild(form.name.data, get_jwt_identity())
            guild_member = GuildMembers()
            guild_member.member = user
            guild.members.append(guild_member)
            db.session.add(guild)
            db.session.commit()
            return jsonify({'success': True})
        return jsonify({'success': False, 'error': 'User not found'}), 401
    return jsonify({'success': 'false', 'errors': form.errors}), 403
