from api.core.security import snowflake_id
from api.db.base_class import Base
from sqlalchemy import Column, BigInteger, Table, ForeignKey, Boolean,  String, Integer
from sqlalchemy.orm import relationship, backref

role_members = Table('role_members', Base.metadata,
                     Column('member_id', BigInteger,
                            ForeignKey('guild_members.id', ondelete="CASCADE"), primary_key=True),
                     Column('role_id', BigInteger,
                            ForeignKey('roles.id', ondelete="CASCADE"), primary_key=True)
                     )


class Role(Base):
    __tablename__ = 'roles'

    id = Column(BigInteger, primary_key=True)
    guild_id = Column(BigInteger, ForeignKey(
        'guilds.id', ondelete="CASCADE"), nullable=False)
    name = Column(String(64), nullable=False)
    color = Column(Integer, nullable=False)
    position = Column(Integer, nullable=False)
    permissions = Column(BigInteger, nullable=False)
    mentionable = Column(Boolean, nullable=False)
    guild = relationship('Guild', backref='roles')
    members = relationship('GuildMembers', secondary=role_members,
                           lazy='subquery', backref=backref('roles', lazy=True))

    def serialize(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'color': self.color,
            'position': self.position,
            'permissions': str(self.permissions),
            'mentionable': self.mentionable
        }

    def __init__(self,
                 guild_id,
                 name,
                 color,
                 position,
                 permissions,
                 mentionable,
                 id=None):
        self.id = id if id is not None else next(snowflake_id)
        self.guild_id = guild_id
        self.name = name
        self.color = color
        self.position = position
        self.permissions = permissions
        self.mentionable = mentionable
