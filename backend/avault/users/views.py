from flask import Blueprint, jsonify, request, Response
from wtforms import Form, StringField, validators, PasswordField
from avault.users import User
from avault import db
from flask_jwt_extended import create_access_token, set_access_cookies
from flask_jwt_extended import jwt_required

bp = Blueprint('auth', __name__, url_prefix='/auth')


class Registration(Form):
    username = StringField('username', [validators.Length(
        min=3, max=80), validators.DataRequired()], (lambda x: x.strip(),))
    password = PasswordField('password', [validators.Length(
        min=6, max=25), validators.DataRequired(), validators.Regexp(
            '^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$',
            message='Password must contain at least one uppercase letter, one lowercase letter, one number and one special character')],
    )
    email = StringField(
        'email', [validators.Email(), validators.DataRequired()], (lambda x: x.strip(),))


@bp.route('/register', methods=['POST'])
def register():
    form = Registration(request.form)
    if form.validate():
        user = User.query.filter_by(email=form.email.data).first()
        if (user):
            return jsonify({'error': 'User already exists'}), 409
        user = User(form.username.data, form.password.data, form.email.data)
        db.session.add(user)
        db.session.commit()
        return jsonify({'success': True}), 201
    else:
        return jsonify({'success': False, 'errors': form.errors}), 403


@bp.route('/login', methods=['POST'])
def login():
    email = request.form.get('email', '').strip()
    password = request.form.get('password', '').strip()
    user = User.query.filter_by(email=email).first()
    if (user):
        if (user.check_password(password)):
            access_token = create_access_token(identity=user.id)
            response = jsonify({'success': True})
            set_access_cookies(response, access_token)
            return response, 200
        else:
            return jsonify({'errors': {"email": "Login or password is invalid",
                                       "password": "Login or password is invalid"}}), 401
    else:
        return jsonify({'error': 'User does not exist'}), 404


@bp.route("/protected", methods=['GET'])
@jwt_required()
def protected():
    return jsonify({'success': True}), 200
