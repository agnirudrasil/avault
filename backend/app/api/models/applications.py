from sqlalchemy import Column, BigInteger, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship, Session

from api.core.security import snowflake_id
from api.db.base_class import Base
from .guilds import GuildMembers, Guild


class Application(Base):
    __tablename__ = 'applications'
    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False, default="")
    redirect_uris: list[str] = Column(ARRAY(Text), nullable=False, default=[])
    owner_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    secret: str = Column(Text, nullable=False)
    bot_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    owner = relationship("User", backref="applications", foreign_keys=owner_id)
    bot = relationship("User", foreign_keys=bot_id)

    def add_bot_to_guild(self, db: Session, guild: Guild):
        guild_member = GuildMembers()
        guild_member.member = self.bot
        guild_member.guild = guild
        guild.members.append(guild_member)
        db.commit()

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "bot": self.bot.serialize() if self.bot else None,
            "owner": self.owner.serialize(),
            "redirect_uris": self.redirect_uris
        }

    def __init__(self, name, owner_id, secret, description="", bot_id=None):
        self.id = next(snowflake_id)
        self.name = name
        self.secret = secret
        self.description = description
        self.owner_id = owner_id
        self.bot_id = bot_id
