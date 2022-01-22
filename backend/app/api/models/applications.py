from cryptography.fernet import Fernet
from sqlalchemy import Column, BigInteger, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship

from api.core import settings
from api.core.security import snowflake_id
from api.db.base_class import Base


class Application(Base):
    __tablename__ = 'applications'
    id = Column(BigInteger, primary_key=True)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False, default="")
    redirect_uris = Column(ARRAY(Text), nullable=False, default=[])
    owner_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    secret: str = Column(Text, nullable=False)
    bot_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    owner = relationship("User", backref="applications", foreign_keys=owner_id)
    bot = relationship("User", foreign_keys=bot_id)

    def serialize(self):
        cipher_suite = Fernet(settings.FERNET_KEY)
        return {
            "id": str(self.id),
            "name": self.name,
            "description": self.description,
            "owner_id": self.owner_id,
            "bot": self.bot.serialize() if self.bot else None,
            "owner": self.owner.serialize(),
            "secret": cipher_suite.decrypt(self.secret.encode('utf-8')).decode("utf-8")
        }

    def __init__(self, name, owner_id, secret, description="", bot_id=None):
        self.id = next(snowflake_id)
        self.name = name
        self.secret = secret
        self.description = description
        self.owner_id = owner_id
        self.bot_id = bot_id
