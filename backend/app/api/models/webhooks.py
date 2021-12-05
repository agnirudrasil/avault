from api.core.security import generate_token
from api.db.base_class import Base
from sqlalchemy import BigInteger, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship


class Webhook(Base):
    __tablename__ = 'webhooks'
    id = Column(BigInteger, primary_key=True)
    type = Column(Integer, nullable=False)
    guild_id = Column(BigInteger, ForeignKey('guilds.id', ondelete="CASCADE"))
    channel_id = Column(BigInteger, ForeignKey(
        'channels.id', ondelete="CASCADE"), nullable=False)
    user_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="CASCADE"), nullable=False)
    name = Column(String(100), nullable=False)
    avatar = Column(String(2048))
    token = Column(Text, nullable=True)
    channel = relationship('Channel', backref='webhooks')
    guild = relationship('Guild', backref='webhooks')

    def get_author(self):
        return {
            'id': self.id,
            'bot': True,
            'username': self.name,
            'tag': '#0000',
            'avatar': self.avatar
        }

    def serialize(self):
        return {
            'id': self.id,
            'type': self.type,
            'guild_id': self.guild_id,
            'channel_id': self.channel_id,
            'user_id': self.user_id,
            'name': self.name,
            'avatar': self.avatar,
            'token': self.token
        }

    def __init__(self,
                 type,
                 channel_id,
                 user_id,
                 name,
                 avatar=None,
                 token=None,
                 guild_id=None):
        self.type = type
        self.guild_id = guild_id
        self.channel_id = channel_id
        self.user_id = user_id
        self.name = name
        self.avatar = avatar
        self.token = token if token else generate_token(68)
