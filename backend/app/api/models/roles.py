from sqlalchemy import Column, BigInteger, ForeignKeyConstraint, PrimaryKeyConstraint, Table, ForeignKey, Boolean, \
    String, Integer
from sqlalchemy.orm import relationship, backref

from api.core.security import snowflake_id
from api.db.base_class import Base

role_members = Table('role_members', Base.metadata,
                     Column('user_id', BigInteger),
                     Column('guild_id', BigInteger, nullable=False),
                     Column('role_id', BigInteger),
                     ForeignKeyConstraint(['user_id', 'guild_id'],
                                          ['guild_members.user_id',
                                           'guild_members.guild_id'],
                                          'guild_members_role_fkey', ondelete='CASCADE'),
                     ForeignKeyConstraint(['role_id'],
                                          ['roles.id'],
                                          'role_members_role_id_fkey', ondelete='CASCADE'),
                     PrimaryKeyConstraint('user_id', 'guild_id', 'role_id'))


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
    tag = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=True)
    guild = relationship('Guild', back_populates="roles")
    members = relationship('GuildMembers', secondary=role_members,
                           lazy='subquery', backref=backref('roles', order_by="Role.position.desc(), Role.id.desc()",
                                                            lazy=True))

    def serialize(self):
        return {
            'id': str(self.id),
            'name': self.name,
            'color': self.color,
            'position': self.position,
            'permissions': str(self.permissions),
            'mentionable': self.mentionable
        }

    def ids(self):
        return str(self.id)

    def __init__(self,
                 guild_id: int,
                 name: str,
                 color: int,
                 position: int,
                 permissions: int,
                 mentionable: bool,
                 role_id=None):
        self.id = role_id if role_id is not None else next(snowflake_id)
        self.guild_id = guild_id
        self.name = name
        self.color = color
        self.position = position
        self.permissions = permissions
        self.mentionable = mentionable
