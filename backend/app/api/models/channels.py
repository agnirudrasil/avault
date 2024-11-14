import enum
from typing import Optional

from sqlalchemy import Column, Integer, String, ForeignKey, Enum, Boolean, DateTime, BigInteger, \
    PrimaryKeyConstraint, Text
from sqlalchemy import func
from sqlalchemy.orm import relationship

from api.core.security import snowflake_id
from api.db.base_class import Base


class ChannelType(str, enum.Enum):
    guild_text = 'GUILD_TEXT'
    dm = 'DM'
    guild_category = 'GUILD_CATEGORY'
    guild_news = 'GUILD_NEWS'
    guild_public_thread = 'GUILD_PUBLIC_THREAD'
    guild_private_thread = 'GUILD_PRIVATE_THREAD'
    group_dm = 'GROUP_DM'
    guild_voice = 'GUILD_VOICE'


class ChannelMembers(Base):
    __tablename__ = 'channel_members'
    channel_id = Column(BigInteger, ForeignKey('channels.id', ondelete="CASCADE"), nullable=False, primary_key=True)
    user_id = Column(BigInteger, ForeignKey('users.id', ondelete="CASCADE"), nullable=False, primary_key=True)
    closed = Column(Boolean, nullable=False, default=False)
    user = relationship('User', backref='channels')
    channel = relationship('Channel', backref='members')

    def __init__(self, closed: bool = True):
        self.closed = closed


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
    id = Column(BigInteger, nullable=False)
    type = Column(Integer, nullable=False)
    allow = Column(BigInteger, nullable=False)
    deny = Column(BigInteger, nullable=False)
    channel_id = Column(BigInteger, ForeignKey('channels.id', ondelete="CASCADE", ),
                        nullable=False)
    channel = relationship('Channel', back_populates='overwrites')
    __table_args__ = (PrimaryKeyConstraint('id', 'channel_id', 'type'),)

    def serialize(self):
        return {
            'id': str(self.id),
            'type': self.type,
            'allow': str(self.allow),
            'deny': str(self.deny),
        }

    def __init__(self,
                 overwrite_id,
                 overwrite_type,
                 allow=None,
                 deny=None,
                 channel_id=None):
        self.id = overwrite_id
        self.type = overwrite_type
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
    position = Column(Integer, nullable=True)
    name = Column(String(100), nullable=True)
    topic = Column(String(1024), nullable=True)
    nsfw = Column(Boolean, nullable=True)
    last_message_timestamp = Column(DateTime, nullable=True)
    icon = Column(Text, nullable=True)
    last_message_id = Column(BigInteger, ForeignKey(
        'messages.id', ondelete="SET NULL", use_alter=True), nullable=True)
    owner_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="SET NULL"), nullable=True)
    parent_id = Column(BigInteger, ForeignKey(
        'channels.id', ondelete="SET NULL"), nullable=True)
    overwrites = relationship('Overwrite', back_populates='channel', cascade='all, delete-orphan')
    pinned_messages = relationship('PinnedMessages', back_populates='channel', cascade='all, delete-orphan')
    thread_metadata = relationship('ThreadMetadata', back_populates='channel', cascade='all, delete-orphan')

    def __init__(self,
                 channel_type: ChannelType,
                 guild_id: str,
                 name: str, topic="",
                 nsfw=False,
                 owner_id=None,
                 parent_id=None):
        self.id = next(snowflake_id)
        self.type = channel_type
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
            if channel_type.upper() == ChannelType.guild_text or channel_type.upper() == ChannelType.guild_voice:
                self.parent_id = parent_id
            else:
                self.parent_id = None

    def __repr__(self):
        return f'<Channel: {self.id}>'

    def serialize(self, context: Optional[int] = None):
        match self.type:
            case ChannelType.group_dm:
                assert context is not None
                return {
                    "id": str(self.id),
                    "name": self.name,
                    "last_message_id": str(self.last_message_id) if self.last_message_id else None,
                    "last_message_timestamp": self.last_message_timestamp.isoformat(
                    ) if self.last_message_timestamp else None,
                    "type": self.type,
                    "owner_id": str(self.owner_id),
                    "icon": self.icon,
                    "recipients": [{
                        "username": user.user.username,
                        "tag": user.user.tag,
                        "id": str(user.user.id),
                        "avatar": user.user.avatar,
                    } for user in filter(lambda u: u.user.id != context, self.members)]
                }
            case ChannelType.dm:
                assert context is not None
                return {
                    "id": str(self.id),
                    "last_message_id": str(self.last_message_id) if self.last_message_id else None,
                    "last_message_timestamp": self.last_message_timestamp.isoformat(
                    ) if self.last_message_timestamp else None,
                    "type": self.type,
                    "recipients": [{
                        "username": user.user.username,
                        "tag": user.user.tag,
                        "id": str(user.user.id),
                        "avatar": user.user.avatar,
                    } for user in filter(lambda u: u.user.id != context, self.members)]
                }
            case _:
                data = {
                    'id': str(self.id),
                    'type': self.type,
                    'position': self.position,
                    'name': self.name,
                    'topic': self.topic,
                    'nsfw': self.nsfw,
                    'guild_id': str(self.guild_id),
                    'last_message_timestamp': self.last_message_timestamp.isoformat() if self.last_message_timestamp else None,
                    'last_message_id': str(self.last_message_id) if self.last_message_id else None,
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

    def is_member(self, user):
        return user in self.members
