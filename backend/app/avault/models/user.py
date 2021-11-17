
import random
from typing import List

from sqlalchemy import BigInteger, Column, String, Text, UniqueConstraint
from sqlalchemy.orm import relationship
from avault.db.base_class import Base
from avault.models.guilds import Guild
from avault.core.security import get_password_hash, verify_password, snowflake_id


class User(Base):
    __tablename__ = 'users'
    id = Column(BigInteger, primary_key=True)
    username = Column(String(80), nullable=False)
    password = Column(Text, nullable=False)
    tag = Column(String(5), nullable=False)
    email = Column(String(120), unique=True, nullable=False)
    channels = relationship('Channel', back_populates='user')
    guilds: List[Guild] = relationship(
        "GuildMembers", back_populates="member")
    __table_args__ = (UniqueConstraint('username', 'tag'),)

    def generate_tag(self, username, db):
        tag = random.randint(1, 9999)
        tag_str = '#' + str(tag).zfill(4)
        user = db.query(User).filter_by(tag=tag_str, username=username).first()
        if user:
            return self.generate_tag(username)
        return tag

    def check_password(self, password):
        return verify_password(password, self.password)

    def serialize(self):
        return {
            'id': str(self.id),
            'username': self.username,
            'tag': self.tag,
            'email': self.email,
        }

    def __init__(self, username, password, email, db):
        self.id = next(snowflake_id)
        self.username = username
        self.email = email
        self.password = get_password_hash(password)
        self.tag = '#' + str(self.generate_tag(username, db)).zfill(4)

    def __repr__(self):
        return '<User %r>' % self.username + self.tag
