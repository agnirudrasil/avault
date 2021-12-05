
from sqlalchemy.orm import Session, backref
from api.db.base_class import Base
from sqlalchemy.ext.hybrid import hybrid_property
from api.models.channels import ChannelType
from api.core.security import snowflake_id
from sqlalchemy import Column, Text, String, ForeignKey, UniqueConstraint, BigInteger
from sqlalchemy.orm import relationship


class GuildBans(Base):
    __tablename__ = 'guild_bans'
    user_id = Column(BigInteger, ForeignKey(
        'users.id', ondelete="CASCADE"), primary_key=True)
    guild_id = Column(BigInteger, ForeignKey(
        'guilds.id', ondelete="CASCADE"), primary_key=True)
    reason = Column(Text)
    __table_args__ = (UniqueConstraint('guild_id', 'user_id',
                      name='guild_bans_guild_id_user_id_key'),)
    user = relationship("User", backref='guild_bans')
    guild = relationship('Guild', backref='bans')

    def serialize(self):
        return {
            'user': self.user.serialize(),
            'reason': self.reason
        }

    def __init__(self, reason=None):
        self.reason = reason


class GuildMembers(Base):
    __tablename__ = "guild_members"
    guild_id = Column(BigInteger, ForeignKey(
        "guilds.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    user_id = Column(BigInteger, ForeignKey(
        "users.id", ondelete="CASCADE"), nullable=False, primary_key=True)
    nickname = Column(String(80), nullable=True)
    permissions = Column(BigInteger, nullable=False, default=0)
    member = relationship('User', back_populates="guilds")
    guild = relationship('Guild', back_populates="members")

    @hybrid_property
    def is_owner(self):
        return self.guild.owner_id == self.user_id

    def serialize(self):
        return {
            "guild_id": self.guild_id,
            "user": self.member.serialize(),
            "nickname": self.nickname,
            'roles': self.roles
        }

    def __init__(self, nickname=None, permissions=1071698660929):
        self.id = next(snowflake_id)
        self.nickname = nickname
        self.permissions = permissions


class Guild(Base):
    __tablename__ = "guilds"

    id = Column(BigInteger, primary_key=True)
    name = Column(String(80), nullable=False)
    icon = Column(Text, nullable=True)
    owner_id = Column(BigInteger, ForeignKey('users.id'))
    owner = relationship('User', backref='owner')
    members = relationship('GuildMembers', back_populates="guild")
    channels = relationship('Channel', order_by="asc(Channel.position)")

    def is_owner(self, db: Session, user):
        return user.id == self.owner_id

    def is_member(self, db: Session, user_id):
        return db.query(GuildMembers).filter_by(user_id=user_id, guild_id=self.id).first() is not None

    @ hybrid_property
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