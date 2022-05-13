import time
from typing import Optional

from sqlalchemy import BigInteger, ForeignKey, Column, Integer, Text
from sqlalchemy.orm import relationship

from api.db.base_class import Base


class Token(Base):
    __tablename__ = 'tokens'
    user_id = Column(BigInteger, ForeignKey('users.id'), nullable=False, primary_key=True)
    application_id = Column(BigInteger, ForeignKey('applications.id'), nullable=False, primary_key=True)
    access_token = Column(Text, nullable=False, unique=True)
    refresh_token = Column(Text)
    issued_at = Column(Integer, nullable=False)
    expires_in = Column(Integer, nullable=False)
    scope = Column(Text, nullable=False)
    user = relationship('User')
    application = relationship('Application')

    def user_serialize(self) -> dict:
        return {
            "application": self.application.serialize(),
            "scopes": self.scope.split(' '),
        }

    def is_scope_same(self, scope: str) -> bool:
        return set(scope.split(' ')) == set(self.scope.split(' '))

    def is_expired(self) -> bool:
        return self.issued_at + self.expires_in < int(time.time())

    def __init__(self, user_id: int, application_id: int, issued_at: int, expires_in: int, access_token: str,
                 scope: str, refresh_token: Optional[str] = None):
        self.user_id = user_id
        self.application_id = application_id
        self.access_token = access_token
        self.refresh_token = refresh_token
        self.issued_at = issued_at
        self.expires_in = expires_in
        self.scope = scope
