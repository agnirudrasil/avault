from sqlalchemy import Column, Text, String, ForeignKey, UniqueConstraint, BigInteger, Boolean
from sqlalchemy.ext.hybrid import hybrid_property
from sqlalchemy.orm import Session
from sqlalchemy.orm import relationship

from api.core.security import snowflake_id
from api.db.base_class import Base
from api.models.channels import ChannelType


class GuildBans(Base):
    __tablename__ = "guild_bans"
    user_id = Column(
        BigInteger, ForeignKey("users.id", ondelete="CASCADE"), primary_key=True
    )
    guild_id = Column(
        BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"), primary_key=True
    )
    reason = Column(Text)
    __table_args__ = (
        UniqueConstraint("guild_id", "user_id", name="guild_bans_guild_id_user_id_key"),
    )
    user = relationship("User", backref="guild_bans")
    guild = relationship("Guild", backref="bans")

    def serialize(self):
        return {"user": self.user.serialize(), "reason": self.reason, 'guild_id': str(self.guild_id)}

    def __init__(self, reason=None):
        self.reason = reason


class Guild(Base):
    __tablename__ = "guilds"

    id = Column(BigInteger, primary_key=True)
    name = Column(String(80), nullable=False)
    icon = Column(Text, nullable=True)
    owner_id = Column(BigInteger, ForeignKey("users.id"))
    owner = relationship("User", backref="owner")
    channels = relationship("Channel", order_by="asc(Channel.position)")
    roles = relationship("Role", back_populates="guild", order_by="Role.position, Role.id")

    def is_owner(self, user):
        return user == self.owner_id

    def is_member(self, db: Session, user_id):
        return (
                db.query(GuildMembers).filter_by(user_id=user_id).filter_by(guild_id=self.id).first()
                is not None
        )

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
        }

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "icon": self.icon,
            "owner": self.owner.serialize(),
            "owner_id": str(self.owner_id),
            "members": [member.serialize() for member in self.members],
            "channels": [channel.serialize() for channel in self.channels],
            'roles': [role.serialize() for role in self.roles],
        }

    def __init__(self, name, owner_id, icon=None):
        self.id = next(snowflake_id)
        self.name = name
        self.owner_id = owner_id
        self.icon = icon


class GuildMembers(Base):
    __tablename__ = "guild_members"
    guild_id = Column(
        BigInteger,
        ForeignKey("guilds.id", ondelete="CASCADE"),
        nullable=False,
        primary_key=True,
    )
    user_id = Column(
        BigInteger,
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        primary_key=True,
    )
    is_owner = Column(Boolean, nullable=False, default=False)
    nickname = Column(String(80), nullable=True)
    permissions = Column(BigInteger, nullable=False, default=0)
    member = relationship("User", backref="guilds")
    guild: Guild = relationship("Guild", backref="members")

    def serialize(self):
        return {
            "guild_id": str(self.guild_id),
            "user": self.member.serialize(),
            "nickname": self.nickname,
            "is_owner": self.is_owner,
            "permissions": str(self.permissions),
            "roles": [role.id for role in self.roles],
        }

    def __init__(self, nickname=None, permissions=1071698660929, is_owner: bool = False):
        self.id = next(snowflake_id)
        self.nickname = nickname
        self.is_owner = is_owner
        self.permissions = permissions
