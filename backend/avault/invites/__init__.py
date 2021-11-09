import datetime
from random import randint
from sqlalchemy import func
from avault import db
from avault.channels import Channel
from avault.utils.nanoid import generate


class Invite(db.Model):
    __tablename__ = 'invites'
    id = db.Column(db.String(21), primary_key=True)
    channel_id = db.Column(db.BigInteger, db.ForeignKey(
        'channels.id'), nullable=False)
    user_id = db.Column(db.BigInteger, db.ForeignKey(
        'users.id'), nullable=False)
    created_at = db.Column(db.DateTime, nullable=False, default=func.now())
    max_age = db.Column(db.Integer, nullable=False, default=0)
    max_uses = db.Column(db.Integer, default=0)
    count = db.Column(db.Integer, default=0)
    channel: Channel = db.relationship('Channel')

    def serialize(self):
        return {
            'id': str(self.id),
            'channel_id': str(self.channel_id),
            'user_id': self.user_id,
            'expires_at': str(datetime.timedelta(seconds=self.max_age) + self.created_at),
            'count': self.count,
            'max_uses': self.max_uses
        }

    def gen_id(self):
        id = generate(size=randint(8, 21))
        invite = Invite.query.filter_by(id=id).first()
        if invite:
            return self.gen_id()
        return id

    def __init__(self, channel_id, user_id, max_age, max_uses):
        self.id = self.gen_id()
        self.channel_id = channel_id
        self.user_id = user_id
        self.max_age = max_age or 86400
        self.max_uses = max_uses or 0
        self.created_at = datetime.datetime.now()
