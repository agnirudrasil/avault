from avault import db, snowflake_id
from sqlalchemy.ext.hybrid import hybrid_property
from avault.channels import ChannelType
import copy


class GuildMembers(db.Model):
    __tablename__ = "guild_members"
    guild_id = db.Column(db.BigInteger, db.ForeignKey(
        "guilds.id"), nullable=False, primary_key=True)
    user_id = db.Column(db.BigInteger, db.ForeignKey(
        "users.id"), nullable=False, primary_key=True)
    nickname = db.Column(db.String(80), nullable=True)
    member = db.relationship('User', back_populates="guilds")
    guild = db.relationship('Guild', back_populates="members")

    def serialize(self):
        return {
            "guild_id": self.guild_id,
            "user": self.member.serialize(),
            "nickname": self.nickname
        }

    def __init__(self, nickname=None):
        self.nickname = nickname


class Guild(db.Model):
    __tablename__ = "guilds"

    id = db.Column(db.BigInteger, primary_key=True)
    name = db.Column(db.String(80), nullable=False)
    icon = db.Column(db.Text, nullable=True)
    owner_id = db.Column(db.BigInteger, db.ForeignKey('users.id'))
    owner = db.relationship('User', backref='owner')
    members = db.relationship('GuildMembers', back_populates="guild")
    channels = db.relationship('Channel', order_by="asc(Channel.position)")

    def is_owner(self, member: GuildMembers):
        return member.user_id == self.owner_id

    def is_member(self, user_id):
        return GuildMembers.query.filter_by(user_id=user_id, guild_id=self.id).first() is not None

    @hybrid_property
    def first_channel(self):
        for channel in self.channels:
            if channel.type == ChannelType.guild_text:
                return str(channel.id)

    def preview(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "icon": self.icon,
            "first_channel": self.first_channel
        }

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "icon": self.icon,
            "owner": self.owner.serialize(),
            "members": [member.serialize() for member in self.members],
            "channels": [channel.serialize() for channel in self.channels],
        }

    def __init__(self, name, owner_id, icon=None):
        self.id = next(snowflake_id)
        self.name = name
        self.owner_id = owner_id
        self.icon = icon
