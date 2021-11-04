import random
from avault import db, snowflake_id, ph
from argon2.exceptions import VerifyMismatchError, VerificationError, HashingError, InvalidHash


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.BigInteger, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    tag = db.Column(db.String(5), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    guilds = db.relationship("GuildMembers", back_populates="member")

    def generate_tag(self, username):
        tag = random.randint(1, 9999)
        tag_str = '#' + str(tag).zfill(4)
        user = User.query.filter_by(tag=tag_str, username=username).first()
        if user:
            return self.generate_tag(username)
        return tag

    def check_password(self, password):
        verified = False
        try:
            ph.verify(self.password, password)
            verified = True
        except VerificationError:
            pass
        except VerifyMismatchError:
            pass
        except HashingError:
            pass
        except InvalidHash:
            pass
        return verified

    def serialize(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'tag': self.tag,
            'email': self.email,
        }

    def __init__(self, username, password, email):
        self.id = next(snowflake_id)
        self.username = username
        self.email = email
        self.password = ph.hash(password)
        self.tag = '#' + str(self.generate_tag(username)).zfill(4)

    def __repr__(self):
        return '<User %r>' % self.username + self.tag
