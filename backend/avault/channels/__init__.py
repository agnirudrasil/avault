import enum

from sqlalchemy import func

from avault import db, snowflake_id


class ChannelType(enum.Enum):
    guild_text = 'GUILD_TEXT'
    dm = 'DM'
    guild_category = 'GUILD_CATEGORY'
    guild_news = 'GUILD_NEWS'
    guild_public_thread = 'GUILD_PUBLIC_THREAD'
    guild_private_thread = 'GUILD_PRIVATE_THREAD'
    group_dm = 'GROUP_DM'


channel_members = db.Table('channel_members',
                           db.Column('channel_id', db.BigInteger, db.ForeignKey(
                               'channels.id'), primary_key=True),
                           db.Column('user_id', db.BigInteger, db.ForeignKey(
                               'users.id'), primary_key=True))

valid_channel_types = ['guild_text',
                       'guild_public_thread',
                       'guild_private_thread',
                       'guild_news']


class Channel(db.Model):
    __tablename__ = 'channels'
    id = db.Column(db.BigInteger, primary_key=True)
    type = db.Column(db.Enum(ChannelType), nullable=False)
    guild_id = db.Column(db.BigInteger, db.ForeignKey(
        'guilds.id'), nullable=True)
    position = db.Column(db.Integer, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    topic = db.Column(db.String(1024), nullable=True)
    nsfw = db.Column(db.Boolean, nullable=False)
    last_message_timestamp = db.Column(db.DateTime, nullable=True)
    owner_id = db.Column(db.BigInteger, db.ForeignKey(
        'users.id'), nullable=True)
    parent_id = db.Column(db.BigInteger, db.ForeignKey(
        'channels.id'), nullable=True)
    members = db.relationship(
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
            'owner_id': str(self.owner_id),
            'parent_id': str(self.parent_id),
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
