import enum

from sqlalchemy import func

from avault.core.security import snowflake_id
from avault.db.base_class import Base
from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean, DateTime, Table, BigInteger
from sqlalchemy.orm import relationship


class ChannelType(enum.Enum):
    guild_text = 'GUILD_TEXT'
    dm = 'DM'
    guild_category = 'GUILD_CATEGORY'
    guild_news = 'GUILD_NEWS'
    guild_public_thread = 'GUILD_PUBLIC_THREAD'
    guild_private_thread = 'GUILD_PRIVATE_THREAD'
    group_dm = 'GROUP_DM'


channel_members = Table('channel_members',
                        Base.metadata,
                        Column('channel_id', BigInteger, ForeignKey(
                               'channels.id'), primary_key=True),
                        Column('user_id', BigInteger, ForeignKey(
                               'users.id'), primary_key=True))

valid_channel_types = ['guild_text',
                       'guild_public_thread',
                       'guild_private_thread',
                       'guild_news']


class Channel(Base):
    __tablename__ = 'channels'
    id = Column(BigInteger, primary_key=True)
    type = Column(Enum(ChannelType), nullable=False)
    guild_id = Column(BigInteger, ForeignKey(
        'guilds.id'), nullable=True)
    position = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    topic = Column(String(1024), nullable=True)
    nsfw = Column(Boolean, nullable=False)
    last_message_timestamp = Column(DateTime, nullable=True)
    owner_id = Column(BigInteger, ForeignKey(
        'users.id'), nullable=True)
    parent_id = Column(BigInteger, ForeignKey(
        'channels.id'), nullable=True)
    members = relationship(
        'User', secondary=channel_members, backref='channels')

    def serialize(self):
        return {
            'id': str(self.id),
            'type': self.type.value,
            'position': self.position,
            'name': self.name,
            'topic': self.topic,
            'nsfw': self.nsfw,
            'last_message_timestamp': self.last_message_timestamp,
            'owner_id': str(self.owner_id) if self.owner_id else None,
            'parent_id': str(self.parent_id) if self.parent_id else None,
            'members': [member.serialize() for member in self.members]
        }

    def __init__(self, type, guild_id, name, topic="", nsfw=False, owner_id=None, parent_id=None):
        self.id = next(snowflake_id)
        self.type = type
        self.guild_id = guild_id
        if guild_id is not None:
            self.position = func.position_insert(guild_id)
        elif guild_id is not None and parent_id is not None:
            self.position = func.position_insert(guild_id, parent_id)
        self.name = name
        self.topic = topic
        self.nsfw = bool(nsfw)
        self.owner_id = owner_id
        if parent_id:
            if type.lower() in valid_channel_types:
                self.parent_id = parent_id
            else:
                self.parent_id = None
