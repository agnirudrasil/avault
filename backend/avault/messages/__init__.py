from avault import db
from sqlalchemy.dialects.postgresql import JSONB


class Reactions(db.Model):
    __tablename__ = 'reactions'
    id = db.Column(db.Integer, primary_key=True)
    message_id = db.Column(db.Integer, db.ForeignKey('messages.id'))
    user_id = db.Column(db.Integer, db.ForeignKey('users.id'))
    reaction = db.Column(db.String(1), nullable=False)
    message = db.relationship('Messages', back_populates='reactions')
    user = db.relationship('Users', back_populates='reactions')

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
    edited_timestamp = db.Column(db.DateTime)
    tts = db.Column(db.Boolean, nullable=False, default=False)
    mention_everyone = db.Column(db.Boolean, nullable=False, default=False)
    mentions = db.Column(db.ARRAY(db.BigInteger))
    mention_roles = db.Column(db.ARRAY(db.BigInteger))
    mention_channels = db.Column(db.ARRAY(db.BigInteger))
    embeds = db.Column(JSONB)
    attachments = db.Column(JSONB)
    reactions = db.relationship('Reactions', back_populates='message')
    channel = db.relationship('Channels')
    author = db.relationship('Users')
