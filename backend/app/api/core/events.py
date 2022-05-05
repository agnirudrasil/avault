import enum
from typing import Optional, Union

from sqlalchemy import func, or_, and_

from api import models
from api.core import emitter


class Events(str, enum.Enum):
    CHANNEL_CREATE = 'CHANNEL_CREATE'
    CHANNEL_UPDATE = 'CHANNEL_UPDATE'
    CHANNEL_DELETE = 'CHANNEL_DELETE'
    CHANNEL_PINS_UPDATE = 'CHANNEL_PINS_UPDATE'
    GUILD_UPDATE = 'GUILD_UPDATE'
    GUILD_DELETE = 'GUILD_DELETE'
    GUILD_CREATE = 'GUILD_CREATE'
    GUILD_BAN_ADD = 'GUILD_BAN_ADD'
    GUILD_BAN_REMOVE = 'GUILD_BAN_REMOVE'
    GUILD_EMOJIS_UPDATE = 'GUILD_EMOJIS_UPDATE'
    GUILD_STICKERS_UPDATE = 'GUILD_STICKERS_UPDATE'
    GUILD_MEMBER_ADD = 'GUILD_MEMBER_ADD'
    GUILD_MEMBER_REMOVE = 'GUILD_MEMBER_REMOVE'
    GUILD_MEMBER_UPDATE = 'GUILD_MEMBER_UPDATE'
    GUILD_ROLE_CREATE = 'GUILD_ROLE_CREATE'
    GUILD_ROLE_POSITION_UPDATE = 'GUILD_ROLE_POSITION_UPDATE'
    GUILD_ROLE_UPDATE = 'GUILD_ROLE_UPDATE'
    GUILD_ROLE_DELETE = 'GUILD_ROLE_DELETE'
    INVITE_CREATE = 'INVITE_CREATE'
    INVITE_DELETE = 'INVITE_DELETE'
    MESSAGE_CREATE = 'MESSAGE_CREATE'
    MESSAGE_UPDATE = 'MESSAGE_UPDATE'
    MESSAGE_DELETE = 'MESSAGE_DELETE'
    MESSAGE_DELETE_BULK = 'MESSAGE_DELETE_BULK'
    MESSAGE_REACTION_ADD = 'MESSAGE_REACTION_ADD'
    MESSAGE_REACTION_REMOVE = 'MESSAGE_REACTION_REMOVE'
    MESSAGE_REACTION_REMOVE_ALL = 'MESSAGE_REACTION_REMOVE_ALL'
    MESSAGE_REACTION_REMOVE_EMOJI = 'MESSAGE_REACTION_REMOVE_EMOJI'
    TYPING_START = 'TYPING_START'
    WEBHOOKS_UPDATE = 'WEBHOOKS_UPDATE'
    MESSAGE_ACK = 'MESSAGE_ACK'


def get_dm_channel_recipients(db, channel_id: int) -> list[str]:
    recipients: models.Channel = db.query(models.Channel).filter_by(id=channel_id).first()
    return [str(recipient.user_id) for recipient in recipients.members]


SPECIAL_EVENTS = {
    Events.CHANNEL_PINS_UPDATE,
    Events.MESSAGE_DELETE_BULK,
    Events.TYPING_START,
    Events.MESSAGE_DELETE_BULK,
    Events.MESSAGE_CREATE,
    Events.MESSAGE_UPDATE,
    Events.MESSAGE_DELETE,
    Events.MESSAGE_DELETE_BULK,
    Events.MESSAGE_REACTION_ADD,
    Events.MESSAGE_REACTION_REMOVE,
    Events.MESSAGE_REACTION_REMOVE_ALL,
    Events.MESSAGE_REACTION_REMOVE_EMOJI,
}


def get_recipients(event: Events, guild_id: Optional[int] = None, channel_id: Optional[int] = None,
                   user_id: Optional[int] = None, db=None) -> list[str]:
    if db is None:
        from api.api.deps import get_db
        db = next(get_db())
    if event == Events.MESSAGE_ACK:
        return [str(user_id)]
    if event == Events.GUILD_CREATE or (event == Events.GUILD_DELETE and user_id):
        return [str(user_id)]
    if event in SPECIAL_EVENTS:
        if not guild_id:
            return get_dm_channel_recipients(db, channel_id)
        recipients = db.query(models.GuildMembers).filter(
            and_(models.GuildMembers.guild_id == guild_id,
                 or_(models.GuildMembers.is_owner,
                     models.GuildMembers.permissions.op('&')(8) == 8,
                     func.compute_channel_overwrites(
                         models.GuildMembers.permissions,
                         guild_id,
                         models.GuildMembers.user_id,
                         channel_id).op('&')(1024) == 1024))).all()
        return [str(recipient.user_id) for recipient in recipients]
    else:
        if guild_id:
            return [str(guild_id)]
        return get_dm_channel_recipients(db, channel_id)


async def websocket_emitter(channel_id: Optional[int], guild_id: Optional[Union[int, str]], event: Events, args,
                            user_id: int = None):
    my_recipients = get_recipients(event, guild_id, channel_id, user_id)
    await emitter.to(my_recipients).emit(event, args)
