from sqlalchemy.ext.hybrid import hybrid_property
from werkzeug.security import generate_password_hash, check_password_hash
from werkzeug.security import generate_password_hash

from avault import db


class User(db.Model):
    id = db.Column(db.Integer, primary_key=True, autoincrement=True)
