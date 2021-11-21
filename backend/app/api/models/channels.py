import enum
from html5lib import serialize
from sqlalchemy import func

from api.core.security import snowflake_id
from api.db.base_class import Base
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
                               'channels.id', ondelete="CASCADE"), primary_key=True),
                        Column('user_id', BigInteger, ForeignKey(
                               'users.id', ondelete="CASCADE"), primary_key=True))

valid_channel_types = ['guild_text',
                       'guild_public_thread',
                       'guild_private_thread',
                       'guild_news']


class PinnedMessages(Base):
    __tablename__ = 'pinned_messages'
    channel_id = Column(BigInteger, ForeignKey(
        'channels.id', ondelete="CASCADE"), primary_key=True)
    message_id = Column(BigInteger, ForeignKey(
        'messages.id', ondelete="CASCADE"), primary_key=True)
    channel = relationship('Channel', back_populates='pinned_messages')
    message = relationship('Message', backref='pinned_messages')


class ThreadMetadata(Base):
    __tablename__ = 'thread_metadata'
    channel_id = Column(BigInteger, ForeignKey("channels.id",
                        ondelete="CASCADE"), primary_key=True)
    archived = Column(Boolean, default=False)
    archive_timestamp = Column(DateTime, default=func.now())
    auto_archive_duration = Column(Integer, default=0)
    locked = Column(Boolean, default=False)
    channel = relationship('Channel', back_populates='thread_metadata')

    def serialize(self):
        return {
            "archived": self.archived,
            "locked": self.locked,
            "auto_archive_duration": self.auto_archive_duration,
            'archive_timestamp': self.archive_timestamp
        }

    def __init__(self, channel_id, archived=False, locked=False, auto_archive_duration=0):
        self.archived = archived
        self.locked = locked
        self.auto_archive_duration = auto_archive_duration
        self.channel_id = channel_id


class Overwrite(Base):
    __tablename__ = 'overwrites'
    id = Column(BigInteger, primary_key=True)
    member_id = Column(BigInteger,  ForeignKey(
        'guild_members.id', ondelete="CASCADE"))
    role_id = Column(BigInteger, ForeignKey(
        'roles.id', ondelete="CASCADE"))
    allow = Column(BigInteger, nullable=False)
    deny = Column(BigInteger, nullable=False)
    channel_id = Column(BigInteger, ForeignKey('channels.id', ondelete="CASCADE",),
                        nullable=False)
    channel = relationship('Channel', back_populates='overwrites')
    role = relationship('Role')
    member = relationship('GuildMembers')

    def serialize(self):
        type = 0 if self.role_id else 1
        return {
            'id': self.role_id or self.member_id,
            'type': type,
            'allow': self.allow,
            'deny': self.deny,
            'channel_id': self.channel_id,
        }

    def __init__(self,
                 member_id=None,
                 role_id=None,
                 allow=None,
                 deny=None,
                 channel_id=None):
        self.id = next(snowflake_id)
        self.member_id = member_id
        self.role_id = role_id
        self.allow = allow
        self.deny = deny
        self.channel_id = channel_id

    def __repr__(self):
        return f'<Overwrite: {self.id}>'


class Channel(Base):
    __tablename__ = 'channels'
    id = Column(BigInteger, primary_key=True)
    type = Column(Enum(ChannelType), nullable=False)
    guild_id = Column(BigInteger, ForeignKey(
        'guilds.id', ondelete="CASCADE"), nullable=True)
    position = Column(Integer, nullable=False)
    name = Column(String(100), nullable=False)
    topic = Column(String(1024), nullable=True)
    nsfw = Column(Boolean, nullable=False)
    last_message_timestamp = Column(DateTime, nullable=True)
    owner_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="SET NULL"), nullable=True)
    parent_id = Column(BigInteger, ForeignKey(
        'channels.id', ondelete="SET NULL"), nullable=True)
    members = relationship(
        'User', secondary=channel_members, backref='channels_members')
    overwrites = relationship('Overwrite', back_populates='channel')
    pinned_messages = relationship('PinnedMessages', back_populates='channel')
    thread_metadata = relationship('ThreadMetadata', back_populates='channel')

    def serialize(self):
        data = {
            'id': str(self.id),
            'type': self.type.value,
            'position': self.position,
            'name': self.name,
            'topic': self.topic,
            'nsfw': self.nsfw,
            'last_message_timestamp': self.last_message_timestamp,
            'owner_id': str(self.owner_id) if self.owner_id else None,
            'parent_id': str(self.parent_id) if self.parent_id else None,
        }
        if self.type not in [ChannelType.dm,
                             ChannelType.group_dm,
                             ChannelType.guild_public_thread,
                             ChannelType.guild_private_thread]:
            data['overwrites'] = [overwrite.serialize()
                                  for overwrite in self.overwrites]
        if self.members:
            data['recipients'] = [m.serialize() for m in self.members]
        if self.thread_metadata:
            data['thread_metadata'] = self.thread_metadata.serialize()
        return data

    def __init__(self, type,
                 guild_id,
                 name, topic="",
                 nsfw=False,
                 owner_id=None,
                 parent_id=None):
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
            if type in valid_channel_types:
                self.parent_id = parent_id
            else:
                self.parent_id = None
