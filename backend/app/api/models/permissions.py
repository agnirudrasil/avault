from typing import Text
from api.db.base_class import Base
from sqlalchemy import BigInteger, Column, Text


class Permission(Base):
    __tablename__ = 'permissions'
    permission = Column(Text, primary_key=True)
    value = Column(BigInteger, nullable=False)
    title = Column(Text, nullable=False)

    def serialize(self):
        return {
            'permission': self.permission,
            'value': str(self.value),
            'title': self.title
        }

    def __init__(self, permission: str, value: int, title: str):
        self.permission = permission
        self.value = value
        self.title = title
