import re
from datetime import datetime

from api.core.security import snowflake_id
from api.db.base_class import Base
from api.models.channels import Channel
from sqlalchemy import Column, ForeignKey, String, DateTime, Boolean, UniqueConstraint, func, BigInteger, Text
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.orm import relationship


class Reactions(Base):
    __tablename__ = 'reactions'
    id = Column(BigInteger, primary_key=True)
    message_id = Column(BigInteger, ForeignKey(
        'messages.id', ondelete="CASCADE"))
    user_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="CASCADE"))
    reaction = Column(String(1), nullable=False)
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
        'guilds.id', ondelete='CASCADE'))
    author_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="SET NULL"))
    webhook_id = Column(BigInteger, ForeignKey(
        'webhooks.id', ondelete='SET NULL'))
    content = Column(Text)
    timestamp: datetime = Column(
        DateTime, nullable=False, default=func.now())
    replies_to = Column(BigInteger, ForeignKey(
        'messages.id', ondelete="SET NULL"))
    edited_timestamp = Column(DateTime)
    tts = Column(Boolean, nullable=False, default=False)
    mention_everyone = Column(Boolean, nullable=False, default=False)
    mentions = Column(ARRAY(BigInteger))
    mention_roles = Column(ARRAY(BigInteger))
    mention_channels = Column(ARRAY(BigInteger))
    embeds = Column(JSONB)
    attachments = Column(JSONB)
    reactions = relationship('Reactions', back_populates='message')
    channel: Channel = relationship('Channel')
    author = relationship('User')
    webhook = relationship('Webhook')
    reply = relationship('Message', remote_side=[id])

    def serialize(self):
        author = None
        if self.webhook_id:
            author = self.webhook.get_author()
        else:
            author = self.author.serialize()
        return {
            'id': str(self.id),
            'channel_id': str(self.channel_id) if self.channel_id else None,
            'guild_id': str(self.guild_id) if self.guild_id else None,
            'author_id': str(self.author_id) if self.author_id else None,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'edited_timestamp': self.edited_timestamp,
            'tts': self.tts,
            'mention_everyone': self.mentions_everyone(),
            'mentions': self.mention(),
            'mention_roles': self.mentions_roles(),
            'mention_channels': self.mentions_channels(),
            'embeds': self.embeds,
            'attachments': self.attachments,
            'reactions': [reaction.serialize() for reaction in self.reactions],
            'author': author,
            'reply': self.reply.serialize() if self.reply else None
        }

    def mentions_everyone(self):
        return '@everyone' in self.content

    def mention(self):
        return re.findall(r'<@(\d+)>', self.content)

    def mentions_roles(self):
        return re.findall(r'<@&(\d+)>', self.content)

    def mentions_channels(self):
        return re.findall(r'<#(\d+)>', self.content)

    def __init__(self,
                 content,
                 channel_id,
                 author_id,
                 tts=False,
                 embeds=None,
                 attachments=None, guild_id=None):
        self.id = next(snowflake_id)
        self.content = content
        self.channel_id = channel_id
        self.guild_id = guild_id
        self.author_id = author_id
        self.tts = tts
        self.timestamp = datetime.utcnow()
        self.mentions_everyone = self.mentions_everyone(content)
        self.mention = self.mentions(content)
        self.mention_role = self.mention_roles(content)
        self.mention_channel = self.mention_channels(content)
        self.embeds = embeds
        self.attachments = attachments
