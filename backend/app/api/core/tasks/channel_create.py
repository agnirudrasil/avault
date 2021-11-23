from typing import List, Optional
from api.core.compute_permissions import compute_overwrites
from api.models.channels import Channel, Overwrite
from api.models.guilds import GuildMembers
from sqlalchemy.orm import Session
from api.core import emitter, redis


async def channel_create(db: Session, channel: Channel):
    members: List[GuildMembers] = db.query(
        GuildMembers).filter_by(guild_id=channel.guild_id).all()
    emit_members = []
    for member in members:
        if member.is_owner:
            emit_members.append(str(member.user_id))
            continue

        if member.permissions & 0x8:
            emit_members.append(str(member.user_id))
            continue

        permission = await compute_overwrites(
            member.permissions, channel, member, db)

        if permission & 1024:
            emit_members.append(str(member.user_id))

    await emitter.in_room(emit_members).emit("CHANNEL_CREATE", channel)
