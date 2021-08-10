from datetime import date
import jwt
import datetime

from avault.server import app, db, bcrypt


class User(db.Model):
    __tablename__ = 'users'
