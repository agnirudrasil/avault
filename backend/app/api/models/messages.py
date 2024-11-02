import enum
import json
import re
from datetime import datetime

from sqlalchemy import Column, ForeignKey, DateTime, Boolean, UniqueConstraint, func, BigInteger, Text, Integer, cast, \
    ARRAY
from sqlalchemy.dialects.postgresql import JSONB, array
from sqlalchemy.orm import relationship, Session

from api.core.security import snowflake_id
from api.db.base_class import Base
from . import Channel


class MessageTypes(int, enum.Enum):
    DEFAULT = 0
    REPLY = 1
    CHANNEL_PINNED_MESSAGE = 2
    GUILD_MEMBER_JOIN = 3


class Reactions(Base):
    __tablename__ = 'reactions'
    id = Column(BigInteger, primary_key=True)
    message_id = Column(BigInteger, ForeignKey(
        'messages.id', ondelete="CASCADE"))
    user_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="CASCADE"))
    reaction = Column(Text, nullable=False)
    message = relationship('Message', back_populates='reactions')
    user = relationship('User')
    __table_args__ = (
        UniqueConstraint('message_id', 'user_id',
                         'reaction', name='_reaction_uc'),
    )

    def serialize(self):
        return {
            'id': self.id,
            'message_id': self.message_id,
            'user_id': self.user_id,
            'reaction': self.reaction
        }

    def __init__(self, emoji: str, user_id: int):
        self.id = next(snowflake_id)
        self.reaction = emoji
        self.user_id = user_id

    def __repr__(self):
        return '<Reactions {}>'.format(self.reaction)


class Message(Base):
    __tablename__ = 'messages'
    id = Column(BigInteger, primary_key=True)
    channel_id = Column(BigInteger, ForeignKey(
        'channels.id', ondelete='CASCADE'), nullable=False)
    guild_id = Column(BigInteger, ForeignKey(
        'guilds.id', ondelete='CASCADE'), nullable=True)
    author_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="SET NULL"))
    webhook_id = Column(BigInteger)
    content = Column(Text)
    timestamp: datetime = Column(
        DateTime, nullable=False, default=func.now())
    replies_to = Column(BigInteger, ForeignKey(
        'messages.id', ondelete="SET NULL"))
    edited_timestamp = Column(DateTime)
    message_type = Column("type", Integer, nullable=False,
                          default=MessageTypes.DEFAULT)
    tts = Column(Boolean, nullable=False, default=False)
    webhook_author = Column(JSONB)
    embeds = Column(JSONB)
    attachments = Column(JSONB)
    pinned = Column(Boolean, nullable=False, default=False)
    channel: Channel = relationship('Channel', foreign_keys=channel_id)
    reactions = relationship('Reactions', back_populates='message')
    author = relationship('User')
    reply = relationship('Message', remote_side=[id])

    def serialize(self, current_user, db, nonce=None):
        author = None
        if self.webhook_id:
            author = self.webhook_author
        else:
            author = self.author.serialize()
        reactions_count = db.query(Reactions.reaction, func.count("*"), func.bool_or(Reactions.user_id == current_user)).filter_by(
            message_id=self.id).group_by(Reactions.reaction).all()
        serialized = {
            'id': str(self.id),
            'channel_id': str(self.channel_id) if self.channel_id else None,
            'author_id': str(self.author_id) if self.author_id else None,
            'content': self.content,
            'pinned': self.pinned,
            'webhook_id': str(self.webhook_id) if self.webhook_id else None,
            'timestamp': self.timestamp.isoformat(),
            'type': self.message_type,
            "guild_id": str(self.guild_id) if self.guild_id else None,
            'edited_timestamp': self.edited_timestamp.isoformat() if self.edited_timestamp else None,
            'tts': self.tts,
            'embeds': [json.loads(embed) for embed in self.embeds] if self.embeds else [],
            'attachments': self.attachments,
            'reactions': [{"emoji": reaction[0], "count": reaction[1], "me": reaction[2]} for reaction in
                          reactions_count],
            'author': author,
            'mention': self.mention(),
            'mention_everyone': self.mentions_everyone(),
            'mention_roles': self.mentions_roles(),
            'mention_channels': self.mentions_channels(),
            'reply': self.reply.serialize(current_user, db) if self.reply else None,
        }

        if nonce:
            serialized['nonce'] = nonce

        return serialized

    def mentions_everyone(self):
        return '@everyone' in self.content

    def mention(self):
        return re.findall(r'<@(\d+)>', self.content)

    def mentions_roles(self):
        return re.findall(r'<@&(\d+)>', self.content)

    def mentions_channels(self):
        return re.findall(r'<#(\d+)>', self.content)

    def process_mentions(self, guild_id, db: Session):
        db.query(func.process_mention(
            self.author_id,
            self.channel_id,
            guild_id,
            cast(array([int(u) for u in self.mention()]), ARRAY(BigInteger)),
            cast(array([int(r) for r in self.mentions_roles()]),
                 ARRAY(BigInteger)),
            self.mentions_everyone(),
        )).all()

    def __init__(self,
                 content,
                 channel_id,
                 author_id,
                 message_type=MessageTypes.DEFAULT,
                 tts=False,
                 embeds=None,
                 replies_to=None,
                 attachments=None,
                 webhook_id=None,
                 webhook_author=None,
                 guild_id: int = None):
        self.id = next(snowflake_id)
        self.content = content
        self.channel_id = channel_id
        self.author_id = author_id
        self.tts = tts
        self.pinned = False
        self.message_type = message_type
        self.replies_to = replies_to
        self.edited_timestamp = None
        self.timestamp = datetime.utcnow()
        self.embeds = [embed.json() for embed in embeds] if embeds else None
        self.attachments = attachments
        self.webhook_author = webhook_author
        self.webhook_id = webhook_id
        self.guild_id = guild_id
