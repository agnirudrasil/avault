from typing import List
from api.core import emitter
from api.core.compute_permissions import compute_overwrites
from api.models.channels import Channel
from api.models.guilds import GuildMembers
from sqlalchemy.orm import Session


async def channel_pins_update(db: Session, fields: dict):
    if fields['guild_id']:
        members: List[GuildMembers] = db.query(
            GuildMembers).filter_by(guild_id=fields['guild_id']).all()
        emit_members = []
        for member in members:
            if member.is_owner:
                emit_members.append(str(member.user_id))
                continue

            if member.permissions & 0x8:
                emit_members.append(str(member.user_id))
                continue

            permission = await compute_overwrites(
                member.permissions, fields['channel'], member, db)

            if permission & 1024:
                emit_members.append(member.user_id)

        await emitter.in_room(emit_members).emit("CHANNEL_CREATE", {
            'guild_id': fields['guild_id'], 'channel': fields['channel'],
            'channel_id': fields['channel'].id
        })
    else:
        channel: Channel = db.query(Channel).filter_by(
            id=fields['channel'].id).first()
        if channel:
            await emitter.\
                to([str(a.id) for a in channel.members]).\
                emit('CHANNEL_PINS_UPDATE', {
                    'guild_id': fields['guild_id'], 'channel': fields['channel'],
                    'channel_id': fields['channel'].id
                })
