import random
from sqlalchemy import func
from avault import db, snowflake_id, bcrypt


class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.BigInteger, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    password = db.Column(db.Text, nullable=False)
    tag = db.Column(db.String(5), nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    __table_args__ = (db.UniqueConstraint('username', 'tag', name='name_tag_uc'),
                      db.CheckConstraint('tag ~ \'#\d{4}$\'', name='tag_regex'),)

    def generate_tag(self, username):
        tag = random.randint(1, 9999)
        tag_str = str(tag).zfill(4)
        user = User.query.filter_by(tag=tag_str, username=username).first()
        if user:
            return self.generate_tag(username)
        return tag

    def check_password(self, password):
        return bcrypt.check_password_hash(self.password, password)

    def serialize(self):
        return {
            'id': self.id,
            'username': self.username,
            'tag': self.tag,
            'email': self.email,
            'created_at': self.created_at,
            'password': self.password
        }

    def __init__(self, username, password, email):
        self.id = next(snowflake_id)
        self.username = username
        self.email = email
        self.password = bcrypt.generate_password_hash(
            password, 12).decode('utf-8')
        self.tag = '#' + str(self.generate_tag(username)).zfill(4)

    def __repr__(self):
        return '<User %r>' % self.username + self.tag
