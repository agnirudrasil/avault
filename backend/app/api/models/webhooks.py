from sqlalchemy import BigInteger, Column, ForeignKey, Integer, String, Text
from sqlalchemy.orm import relationship

from api.core.security import generate_token, snowflake_id
from api.db.base_class import Base


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
    user = relationship('User')

    def get_author(self):
        return {
            'id': str(self.id),
            'bot': True,
            'username': self.name,
            'tag': '#0000',
            'avatar': self.avatar
        }

    def serialize(self):
        return {
            'id': str(self.id),
            'type': self.type,
            'guild_id': str(self.guild_id),
            'channel_id': str(self.channel_id),
            'user': self.user.serialize(),
            'name': self.name,
            'avatar': self.avatar,
            'token': self.token
        }

    def serialize_token(self):
        return {
            'id': str(self.id),
            'type': self.type,
            'guild_id': str(self.guild_id),
            'channel_id': str(self.channel_id),
            'name': self.name,
            'avatar': self.avatar,
            'token': self.token
        }

    def __init__(self,
                 webhook_type,
                 channel_id,
                 user_id,
                 name,
                 avatar=None,
                 token=None,
                 guild_id=None):
        self.id = next(snowflake_id)
        self.type = webhook_type
        self.guild_id = guild_id
        self.channel_id = channel_id
        self.user_id = user_id
        self.name = name
        self.avatar = avatar
        self.token = token if token else generate_token(68)
