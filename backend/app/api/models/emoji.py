from sqlalchemy import BigInteger, Column, Text, ARRAY, ForeignKey, Boolean
from sqlalchemy.orm import relationship

from api.core.security import snowflake_id
from api.db.base_class import Base


class Emoji(Base):
    __tablename__ = "emojis"
    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    roles = Column(ARRAY(BigInteger), nullable=False)
    user_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    animated = Column(Boolean, nullable=False)
    guild_id = Column(BigInteger, ForeignKey("guilds.id", ondelete="CASCADE"))
    user = relationship("User")

    def serialize(self):
        return {
            "id": str(self.id),
            "name": self.name,
            "roles": list(map(str, self.roles)),
            "user": self.user.serialize(),
            "animated": self.animated,
        }

    def __init__(self, name: str, guild_id: int, user_id: int, roles: list[int], animated: bool):
        self.id = next(snowflake_id)
        self.name = name
        self.roles = roles
        self.user_id = user_id
        self.animated = animated
        self.guild_id = guild_id
