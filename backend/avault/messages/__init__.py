from datetime import datetime
from avault.channels import Channel
from avault import db, snowflake_id
from sqlalchemy.dialects.postgresql import JSONB, ARRAY
from sqlalchemy.ext.hybrid import hybrid_property
import re


class Reactions(db.Model):
    __tablename__ = 'reactions'
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('messages.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    reaction = db.Column(db.String(1), nullable=False)
    message = db.relationship('Message', back_populates='reactions')
    user = db.relationship('User')

    def serialize(self):
        return {
            'id': self.id,
            'message_id': self.message_id,
            'user_id': self.user_id,
            'reaction': self.reaction
        }

    def __init__(self, reaction):
        self.reaction = reaction

    def __repr__(self):
        return '<Reactions {}>'.format(self.reaction)


class Message(db.Model):
    __tablename__ = 'messages'
    id = db.Column(db.BigInteger, primary_key=True)
    channel_id = db.Column(db.BigInteger, db.ForeignKey(
        'channels.id'), nullable=False)
    author_id = db.Column(db.BigInteger, db.ForeignKey(
        'users.id'))
    content = db.Column(db.Text)
    timestamp: datetime = db.Column(
        db.DateTime, nullable=False, default=db.func.now())
    replies_to = db.Column(db.BigInteger, db.ForeignKey('messages.id'))
    edited_timestamp = db.Column(db.DateTime)
    tts = db.Column(db.Boolean, nullable=False, default=False)
    mention_everyone = db.Column(db.Boolean, nullable=False, default=False)
    mentions = db.Column(ARRAY(db.BigInteger))
    mention_roles = db.Column(ARRAY(db.BigInteger))
    mention_channels = db.Column(ARRAY(db.BigInteger))
    embeds = db.Column(JSONB)
    attachments = db.Column(JSONB)
    reactions = db.relationship('Reactions', back_populates='message')
    channel: Channel = db.relationship('Channel')
    author = db.relationship('User')
    reply = db.relationship('Message', remote_side=[id])

    def serialize(self):
        return {
            'id': self.id,
            'channel_id': str(self.channel_id) if self.channel_id else None,
            'guild_id': str(self.guild_id) if self.guild_id else None,
            'author_id': str(self.author_id) if self.author_id else None,
            'content': self.content,
            'timestamp': self.timestamp.isoformat(),
            'edited_timestamp': self.edited_timestamp,
            'tts': self.tts,
            'mention_everyone': self.mention_everyone(self.content),
            'mentions': self.mentions(self.content),
            'mention_roles': self.mention_roles(self.content),
            'mention_channels': self.mention_channels(self.content),
            'embeds': self.embeds,
            'attachments': self.attachments,
            'reactions': [reaction.serialize() for reaction in self.reactions],
            'author': self.author.serialize() if self.author else None,
            'reply': self.reply.serialize() if self.reply else None
        }

    @hybrid_property
    def guild_id(self):
        return self.channel.guild_id

    def mention_everyone(self, content):
        return '@everyone' in content

    def mentions(self, content):
        return re.findall(r'<@(\d+)>', content)

    def mention_roles(self, content):
        return re.findall(r'<@&(\d+)>', content)

    def mention_channels(self, content):
        return re.findall(r'<#(\d+)>', content)

    def __init__(self,
                 content,
                 channel_id,
                 author_id,
                 tts,
                 embeds,
                 attachments):
        self.id = next(snowflake_id)
        self.content = content
        self.channel_id = channel_id
        self.author_id = author_id
        self.tts = tts
        self.mentions_everyone = self.mention_everyone(content)
        self.mention = self.mentions(content)
        self.mention_role = self.mention_roles(content)
        self.mention_channel = self.mention_channels(content)
        self.embeds = embeds
        self.attachments = attachments
