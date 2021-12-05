from typing import Optional
from api.core import redis
from api.models.channels import Channel, Overwrite
from api.models.guilds import GuildMembers
from sqlalchemy.orm import Session


async def compute_overwrites(base_permissions: int,
                             channel: Channel,
                             member: GuildMembers,
                             db: Session):
    cached_perms = await redis.hget(
        f'overwrite-channel:{channel.id}', f"{member.user_id}:{member.guild}")
    if cached_perms:
        return int(cached_perms)

    permissions = base_permissions
    overwrite_everyone: Optional[Overwrite] = db.query(Overwrite).filter_by(
        id=channel.guild_id).filter_by(channel_id=channel.id).first()
    if overwrite_everyone:
        permissions &= ~overwrite_everyone.deny
        permissions |= overwrite_everyone.allow

    allow = 0
    deny = 0

    overwrites = db.query(Overwrite).filter_by(
        channel_id=channel.id).\
        filter(Overwrite.id.in_([role.id for role in member.roles])).\
        all()

    for overwrite in overwrites:
        allow |= overwrite.allow
        deny |= overwrite.deny

    permissions &= ~deny
    permissions |= allow

    overwrite_member: Optional[Overwrite] = db.query(Overwrite).filter_by(
        id=member.user_id).filter_by(channel_id=channel.id).first()

    if overwrite_member:
        permissions &= ~overwrite_member.deny
        permissions |= overwrite_member.allow

    await redis.hset(f"overwrite-channel:{channel.id}",
                     f"{member.user_id}:{member.guild}", permissions)

    return permissions
