from sqlalchemy import BigInteger, ForeignKey, Column, Integer
from sqlalchemy.orm import relationship

from api.db.base_class import Base


class Relationship(Base):
    __tablename__ = 'relationships'
    requester_id = Column(BigInteger, ForeignKey('users.id'), primary_key=True)
    addressee_id = Column(BigInteger, ForeignKey('users.id'), primary_key=True)
    type = Column(Integer, default=0)
    requester = relationship('User', foreign_keys=[requester_id])
    addressee = relationship('User', foreign_keys=[addressee_id])

    def serialize(self, context: int):
        assert context == self.addressee_id or context == self.requester_id

        return {
            "id": str(self.addressee_id) if context == self.requester_id else str(self.requester_id),
            "type": self.type if self.type > 0 else 3 if context == self.addressee_id else 4,
            "user": self.addressee.serialize() if context == self.requester_id else self.requester.serialize()
        }

    def __init__(self, requester_id, addressee_id, relationship_type: int = None):
        self.requester_id = requester_id
        self.addressee_id = addressee_id
        self.type = relationship_type if relationship_type is not None else 0
