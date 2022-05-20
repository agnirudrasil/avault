import sqlalchemy.exc
from sqlalchemy import Column, BigInteger, Text, ForeignKey, ARRAY
from sqlalchemy.orm import relationship, Session, backref

from api.core.events import Events, websocket_emitter
from api.core.security import snowflake_id
from api.db.base_class import Base
from .guilds import GuildMembers, Guild
from .roles import Role
from .user import User
from ..core import emitter


class Application(Base):
    __tablename__ = 'applications'
    id = Column(BigInteger, primary_key=True)
    icon = Column(Text)
    name = Column(Text, nullable=False)
    description = Column(Text, nullable=False, default="")
    redirect_uris: list[str] = Column(ARRAY(Text), nullable=False, default=[])
    owner_id = Column(BigInteger, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    secret: str = Column(Text, nullable=False)
    bot_id = Column(BigInteger, ForeignKey("users.id", ondelete="SET NULL"))
    owner = relationship("User", backref="applications", foreign_keys=owner_id)
    bot: User = relationship("User", foreign_keys=bot_id, backref=backref("application", uselist=False))

    async def create_bot_role(self, db: Session, guild: Guild, permissions: int):
        role = Role(guild.id, self.bot.username, 0, 1,
                    permissions if permissions is not None else 0,
                    True, tag=self.bot.id)
        db.add(role)
        db.query(Role).filter_by(guild_id=guild.id).filter(
            Role.position >= 1).update({Role.position: Role.position + 1})
        updated_roles = db.query(Role).filter_by(guild_id=guild.id).filter(Role.position >= 2).all()
        db.commit()
        await (websocket_emitter(None, guild.id, Events.GUILD_ROLE_CREATE,
                                 {'role': role.serialize(), 'guild_id': str(guild.id)}))
        for role in updated_roles:
            await (websocket_emitter(None, guild.id, Events.GUILD_ROLE_UPDATE,
                                     {'role': role.serialize(), 'guild_id': str(guild.id)}))
        return role

    async def delete_bot_role(self, db: Session, guild: Guild):
        role = db.query(Role).filter_by(guild_id=guild.id).filter_by(tag=self.bot_id).first()
        position = role.position
        db.delete(role)
        db.query(Role).filter_by(guild_id=guild.id).filter(Role.position > position).update(
            {Role.position: Role.position - 1})
        await (websocket_emitter(None, guild.id, Events.GUILD_ROLE_DELETE,
                                 {'role': role.serialize(), 'guild_id': str(guild.id)}))
        update_roles = db.query(Role).filter_by(guild_id=guild.id).filter(Role.position >= position).all()
        for role in update_roles:
            await (websocket_emitter(None, guild.id, Events.GUILD_ROLE_UPDATE,
                                     {'role': role.serialize(), 'guild_id': str(guild.id)}))
        db.commit()

    async def remove_bot_from_guild(self, db: Session, guild: Guild):
        member = db.query(GuildMembers).filter_by(guild_id=guild.id).filter_by(user_id=self.bot_id).first()
        if not member:
            return
        await websocket_emitter(None, guild.id, Events.GUILD_MEMBER_REMOVE, member.serialize())
        db.delete(member)
        db.commit()

        await (websocket_emitter(None, guild.id, Events.GUILD_MEMBER_REMOVE, member.serialize()))
        await emitter.in_room(str(self.bot.id)).sockets_leave(str(guild.id))
        await websocket_emitter(None, guild.id, Events.GUILD_DELETE, {'id': str(guild.id)},
                                self.bot.id)
        await self.delete_bot_role(db, guild)

    async def add_bot_to_guild(self, db: Session, guild: Guild, permissions: int):
        existing = db.query(GuildMembers).filter_by(guild_id=guild.id).filter_by(user_id=self.bot_id).first()

        if existing:
            return

        try:
            role = await self.create_bot_role(db, guild, permissions)
            guild_member = GuildMembers()
            guild_member.member = self.bot
            guild_member.guild = guild
            guild.members.append(guild_member)
            guild_member.roles.append(role)
            db.commit()

            await emitter.in_room(str(self.bot.id)).sockets_join(str(guild.id))
            await websocket_emitter(None, guild.id, Events.GUILD_CREATE,
                                    {"guild": guild.serialize(
                                    ), "member": guild_member.serialize()},
                                    self.bot.id)
            await websocket_emitter(None, guild.id, Events.GUILD_MEMBER_ADD,
                                    guild_member.serialize())
        except sqlalchemy.exc.IntegrityError:
            pass

    def serialize(self):
        return {
            "id": str(self.id),
            "icon": self.icon,
            "name": self.name,
            "description": self.description,
            "bot": self.bot.serialize() if self.bot else None,
            "owner": self.owner.serialize(),
            "redirect_uris": self.redirect_uris
        }

    def __init__(self, name, owner_id, secret, description="", bot_id=None, icon=None):
        self.id = next(snowflake_id)
        self.name = name
        self.secret = secret
        self.description = description
        self.owner_id = owner_id
        self.bot_id = bot_id
        self.icon = icon
