
import datetime
from random import randint
from sqlalchemy import func
from avault.models.channels import Channel
from avault.utils.nanoid import generate
from avault.db.base_class import Base
from sqlalchemy import Column, String, BigInteger, ForeignKey, Integer, DateTime
from sqlalchemy.orm import relationship


class Invite(Base):
    __tablename__ = 'invites'
    id = Column(String(21), primary_key=True)
    channel_id = Column(BigInteger, ForeignKey(
        'channels.id'), nullable=False)
    user_id = Column(BigInteger, ForeignKey(
        'users.id'), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    max_age = Column(Integer, nullable=False, default=0)
    max_uses = Column(Integer, default=0)
    count = Column(Integer, default=0)
    channel: Channel = relationship('Channel')

    def serialize(self):
        return {
            'id': str(self.id),
            'channel_id': str(self.channel_id),
            'user_id': self.user_id,
            'expires_at': str(datetime.timedelta(seconds=self.max_age) + self.created_at),
            'count': self.count,
            'max_uses': self.max_uses
        }

    def gen_id(self, db):
        id = generate(size=randint(8, 21))
        invite = db.query(Invite).query.filter_by(id=id).first()
        if invite:
            return self.gen_id()
        return id

    def __init__(self, channel_id, user_id, max_age, max_uses, db):
        self.id = self.gen_id(db)
        self.channel_id = channel_id
        self.user_id = user_id
        self.max_age = max_age or 86400
        self.max_uses = max_uses or 0
        self.created_at = datetime.datetime.now()
