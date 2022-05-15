import datetime
from random import randint

from sqlalchemy import Column, String, BigInteger, ForeignKey, Integer, DateTime
from sqlalchemy import func
from sqlalchemy.orm import relationship, Session

from api.db.base_class import Base
from api.models.channels import Channel
from api.utils.nanoid import generate


class Invite(Base):
    __tablename__ = 'invites'
    id = Column(String(21), primary_key=True)
    channel_id = Column(BigInteger, ForeignKey(
        'channels.id', ondelete="CASCADE"), nullable=False)
    guild_id = Column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"), nullable=True)
    user_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="SET NULL"), nullable=False)
    created_at = Column(DateTime, nullable=False, default=func.now())
    max_age = Column(Integer, nullable=False, default=0)
    max_uses = Column(Integer, default=0)
    count = Column(Integer, default=0)
    channel: Channel = relationship('Channel')
    inviter = relationship('User')

    def serialize(self):
        my_invite = {
            'id': str(self.id),
            'inviter': self.inviter.serialize(),
            'expires_at': str(datetime.timedelta(seconds=self.max_age) + self.created_at),
            'count': self.count,
            'max_uses': self.max_uses
        }
        if self.channel.guild_id:
            my_invite['guild'] = self.channel.guild.preview()
        elif self.channel.guild_id:
            my_invite['channel'] = self.channel.serialize()
        return my_invite

    def gen_id(self, db):
        invite_id = generate(size=randint(8, 21))
        invite = db.query(Invite).filter_by(id=invite_id).first()
        if invite:
            return self.gen_id(db)
        return invite_id

    def __init__(self, channel_id, user_id, max_age, max_uses, db: Session, guild_id=None):
        self.id = self.gen_id(db)
        self.channel_id = channel_id
        self.user_id = user_id
        self.max_age = max_age or 86400
        self.max_uses = max_uses or 0
        self.created_at = datetime.datetime.now()
        self.guild_id = guild_id
