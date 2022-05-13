import random

from sqlalchemy import BigInteger, Column, String, Text, UniqueConstraint, Boolean, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import Session, relationship

from api.core.security import get_password_hash, verify_password, snowflake_id
from api.db.base_class import Base


class Unread(Base):
    __tablename__ = "unread"
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)
    channel_id = Column(BigInteger, ForeignKey("channels.id", ondelete="CASCADE"), primary_key=True)
    last_message_id = Column(BigInteger)
    mentions_count = Column(Integer, default=0)
    channel = relationship("Channel")

    def __init__(self, user_id: int, channel_id: int, message_id: int, mentions_count: int = 0):
        self.user_id = user_id
        self.channel_id = channel_id
        self.last_message_id = message_id
        self.mentions_count = mentions_count


class MFA(Base):
    __tablename__ = "mfa"
    user_id = Column(BigInteger, ForeignKey("users.id"), primary_key=True)
    secret = Column(String(255), nullable=False)
    backup_secret = Column(String(255), nullable=False)
    backup_count = Column(Integer, default=0, nullable=False)

    def __init__(self, user_id: int, secret: str, backup_secret: str):
        self.user_id = user_id
        self.secret = secret
        self.backup_secret = backup_secret
        self.backup_count = 0


class User(Base):
    __tablename__ = "users"
    id = Column(BigInteger, primary_key=True)
    username = Column(String(80), nullable=False)
    password = Column(Text, nullable=False)
    tag = Column(String(5), nullable=False)
    bot = Column(Boolean, nullable=False, default=True)
    bio = Column(String(400))
    email = Column(String(120), unique=True, nullable=False)
    avatar = Column(Text, nullable=True)
    accent_color = Column(Integer, nullable=True)
    banner = Column(Text, nullable=True)
    mfa_enabled = Column(Boolean, default=False)
    last_login = Column(DateTime, nullable=True, default=func.now())
    unread = relationship("Unread", cascade="all, delete-orphan")
    __table_args__ = (UniqueConstraint("username", "tag"),)

    def generate_tag(self, username, db: Session):
        tag = random.randint(1, 9999)
        tag_str = "#" + str(tag).zfill(4)
        user = db.query(User).filter_by(tag=tag_str, username=username).first()
        if user:
            return self.generate_tag(username)
        return tag

    def update_password(self, password):
        self.password = get_password_hash(password)

    def check_password(self, password):
        return verify_password(password, self.password)

    def serialize(self):
        obj = self.json()
        del obj["email"]
        return obj

    def json(self):
        return {
            "id": str(self.id),
            "username": self.username,
            "tag": self.tag,
            "email": self.email if not self.bot else None,
            "bot": self.bot,
            "accent_color": self.accent_color,
            "banner": self.banner,
            "banner_color": "#" + hex(self.accent_color).lstrip("0x") if self.accent_color else None,
            "avatar": self.avatar,
            "bio": self.bio,
            "mfa_enabled": self.mfa_enabled,
        }

    def __init__(self, db: Session, username: str, password: str = None, email: str = None, bot=False,
                 user_id=None):
        self.id = user_id if user_id is not None else next(snowflake_id)
        self.username = username
        self.email = email if email is not None else f"{self.id}@avault.agnirudra.me"
        self.password = get_password_hash(password) if password is not None else ""
        self.tag = "#" + str(self.generate_tag(username, db)).zfill(4)
        self.bot = bot

    def __repr__(self):
        return "<User %r>" % self.username + self.tag
