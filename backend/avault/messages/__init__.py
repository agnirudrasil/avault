from avault import db
from sqlalchemy.dialects.postgresql import JSONB
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
            'user_id': self.user,
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
    timestamp = db.Column(db.DateTime, nullable=False, default=db.func.now())
    replies_to = db.Column(db.BigInteger, db.ForeignKey('messages.id'))
    edited_timestamp = db.Column(db.DateTime)
    tts = db.Column(db.Boolean, nullable=False, default=False)
    mention_everyone = db.Column(db.Boolean, nullable=False, default=False)
    mentions = db.Column(db.ARRAY(db.BigInteger))
    mention_roles = db.Column(db.ARRAY(db.BigInteger))
    mention_channels = db.Column(db.ARRAY(db.BigInteger))
    embeds = db.Column(JSONB)
    attachments = db.Column(JSONB)
    reactions = db.relationship('Reactions', back_populates='message')
    channel = db.relationship('Channel')
    author = db.relationship('User')
    reply = db.relationship('Message', remote_side=[id])

    def serialize(self):
        return {
            'id': self.id,
            'channel_id': self.channel_id,
            'author_id': self.author_id,
            'content': self.content,
            'timestamp': self.timestamp,
            'edited_timestamp': self.edited_timestamp,
            'tts': self.tts,
            'mention_everyone': self.mention_everyone,
            'mentions': self.mentions,
            'mention_roles': self.mention_roles,
            'mention_channels': self.mention_channels,
            'embeds': self.embeds,
            'attachments': self.attachments,
            'reactions': [reaction.serialize() for reaction in self.reactions]
        }

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
        self.content = content
        self.channel_id = channel_id
        self.author_id = author_id
        self.tts = tts
        self.mention_everyone = self.mention_everyone(content)
        self.mentions = self.mentions(content)
        self.mention_roles = self.mention_roles(content)
        self.mention_channels = self.mention_channels(content)
        self.embeds = embeds
        self.attachments = attachments
