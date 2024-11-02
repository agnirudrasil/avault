from datetime import datetime
from typing import Any, List, Optional, Union

import emoji as emojilib
import sqlalchemy.exc
from fastapi import APIRouter, Depends, Response, HTTPException
from pydantic import BaseModel, root_validator
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session

from api import models
from api.api import deps
from api.core.events import Events, websocket_emitter
from api.core.permissions import Permissions
from api.core.ratelimit import RateLimit
from api.models import Relationship
from api.models.channels import Channel, ChannelType, Overwrite, PinnedMessages, ChannelMembers
from api.models.invites import Invite
from api.models.messages import Message, Reactions, MessageTypes
from api.models.user import User, Unread
from api.models.webhooks import Webhook
from api.schemas.channel import ChannelEdit
from api.schemas.invite import ChannelInvite
from api.schemas.message import MessageCreate
from api.schemas.overwrite import Overwrite as OverwriteSchema
from api.utils.validate_avatar import validate_avatar
from api.worker import embed_message

router = APIRouter()


class WebhookCreate(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


class MessageBulkDelete(BaseModel):
    messages: list[int]

    @classmethod
    @root_validator
    def validate_len(cls, v):
        messages = v.get('messages')
        if 2 <= len(messages) <= 100:
            raise ValueError('Only 2 to 100 messages can be deleted at a time')
        return v


@router.get('/{channel_id}/messages', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("5/5seconds", limit_type="user")),
])
def get_messages(channel_id: int,
                 limit: int = 50,
                 before: Optional[int] = None,
                 after: Optional[int] = None,
                 dependencies: tuple[Channel, User] = Depends(
                     deps.ChannelPerms([Permissions.VIEW_CHANNEL, Permissions.READ_MESSAGE_HISTORY])),
                 db: Session = Depends(deps.get_db)) -> List[dict]:
    _, user = dependencies
    if after:
        messages = db.query(Message).filter_by(channel_id=channel_id).filter(Message.id > after).order_by(asc(
            Message.timestamp)).limit(limit).all()
        return [message.serialize(user.id, db) for message in messages]

    elif before:
        messages = db.query(Message).filter_by(channel_id=channel_id).filter(Message.id < before).order_by(desc(
            Message.timestamp)).limit(limit).all()
        return [message.serialize(user.id, db) for message in messages]

    messages = db.query(Message).filter_by(channel_id=channel_id).order_by(desc(
        Message.timestamp)).limit(limit).all()

    return [message.serialize(user.id, db) for message in messages]


@router.post('/{channel_id}/messages', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("5/5seconds", limit_type="user")),
])
async def create_message(channel_id: int,
                         db: Session = Depends(deps.get_db),
                         dependency: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.SEND_MESSAGES)),
                         body_stuff: tuple[MessageCreate, list] = Depends(deps.ExtractBody(MessageCreate))
                         ) -> Any:
    embed_checker = deps.ChannelPerms(Permissions.EMBED_LINKS)
    channel, current_user = dependency
    body, attachments = body_stuff

    my_attachments = []

    if body and body.attachments:
        for attachment in body.attachments:
            my_attachments.append({**attachments[attachment.id], "description": attachment.description})
    else:
        my_attachments = attachments

    message = Message(content=body.content.strip() if body else "",
                      channel_id=channel_id,
                      author_id=current_user.id,
                      embeds=body.embeds if body else None,
                      replies_to=body.message_reference if body else None,
                      message_type=MessageTypes.REPLY if body and body.message_reference else MessageTypes.DEFAULT,
                      attachments=my_attachments,
                      guild_id=channel.guild_id)

    if channel.type == ChannelType.dm:
        for channel_member in channel.members:
            if channel_member.user_id != current_user.id and channel_member.closed:
                channel_member.closed = False
                await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_CREATE, guild_id=None,
                                        args=channel.serialize(channel_member.user_id),
                                        user_id=channel_member.user_id, db=db)
            db.query(models.Unread).filter_by(channel_id=channel.id).filter_by(user_id=channel_member.user_id).update({
                models.Unread.mentions_count: models.Unread.mentions_count + 1
            })
    elif channel.type == ChannelType.group_dm:
        db.query(models.Unread).filter_by(channel_id=channel.id).filter(
            models.Unread.user_id.in_(map(lambda c: c.user_id, channel.members))). \
            update({models.Unread.mentions_count: models.Unread.mentions_count + 1})
    else:
        message.process_mentions(channel.guild_id, db)
    db.add(message)
    db.commit()

    if not message.embeds and await embed_checker.is_valid(channel, current_user, db):
        embed_message.delay(message.content, message.id, channel.guild_id, current_user.id)
    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_CREATE,
                            args=message.serialize(current_user=current_user.id, db=db,
                                                   nonce=body.nonce if body else None), db=db)

    return message.serialize(current_user.id, db, nonce=body.nonce if body else None)


@router.get('/{channel_id}/messages/{message_id}', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("5/5seconds", limit_type="user")),
])
def get_message(channel_id: int,
                message_id: int,
                response: Response,
                dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL)),
                db: Session = Depends(deps.get_db)) -> Union[dict[str, str], None]:
    channel, user = dependencies
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        return message.serialize(user.id, db)
    response.status_code = 404
    return


@router.delete('/{channel_id}/messages/bulk-delete', status_code=204, dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/5seconds", limit_type="user")),
])
async def bulk_delete_messages(channel_id: int, body: MessageBulkDelete,
                               dependencies: Channel = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                               db: Session = Depends(deps.get_db)):
    channel, user = dependencies
    messages = db.query(Message).filter(
        (Message.channel_id == channel_id) & Message.id.in_(body.messages)).delete()
    db.commit()

    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_DELETE_BULK,
                            args={"ids": list(map(str, body.messages)), "channel_id": str(channel.id),
                                  'guild_id': str(channel.guild_id)}, db=db)
    return ""


@router.delete('/{channel_id}/messages/{message_id}', status_code=204, dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("5/5seconds", limit_type="user")),
])
async def delete_message(channel_id: int,
                         message_id: int,
                         response: Response,
                         current_user: User = Depends(deps.get_current_user),
                         db: Session = Depends(deps.get_db)) -> Union[None, dict[str, str]]:
    perm_checker = deps.ChannelPerms(Permissions.MANAGE_MESSAGES)
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if message:
        if message.author_id == current_user.id or await perm_checker.is_valid(channel, current_user, db):
            db.delete(message)
            db.commit()
            response.status_code = 204
            await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_DELETE,
                                    args={"id": str(message.id), "channel_id": str(channel.id),
                                          'guild_id': str(channel.guild_id)}, db=db)
            return
        response.status_code = 401
        return {"message": "Not authorized"}
    response.status_code = 404
    return {"message": "Message not found"}


@router.patch('/{channel_id}/messages/{message_id}', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("5/5seconds", limit_type="user")),
])
async def edit_message(channel_id: int,
                       message_id: int,
                       message: MessageCreate,
                       response: Response,
                       current_user: User = Depends(deps.get_current_user),
                       db: Session = Depends(deps.get_db)) -> Union[dict, None]:
    perm_checker = deps.ChannelPerms(Permissions.MANAGE_MESSAGES)

    prev_message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if prev_message:
        if prev_message.author_id == current_user.id or await perm_checker.is_valid(channel, current_user, db):
            if message.content.strip() and prev_message.author_id == current_user.id:
                if prev_message.content != message.content.strip():
                    prev_message.edited_timestamp = datetime.utcnow()
                prev_message.content = message.content.strip()
            db.commit()
            prev_message.embeds = [embed.json() for embed in message.embeds] if message.embeds else []
            await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_UPDATE,
                                    args=prev_message.serialize(current_user.id, db), db=db)
            return prev_message.serialize(current_user.id, db)
        response.status_code = 403
        return {"message": "Not authorized"}
    response.status_code = 404
    return


@router.post('/{channel_id}/messages/{message_id}/ack', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/1seconds", limit_type="user")),
], status_code=204)
async def message_ack(channel_id: int, message_id: int, current_user: User = Depends(deps.get_current_user),
                      db: Session = Depends(deps.get_db)):
    if current_user.bot:
        return
    unread = db.query(models.Unread).filter_by(user_id=current_user.id).filter_by(channel_id=channel_id).first()
    if unread:
        unread.last_message_id = message_id
        unread.mentions_count = 0
    else:
        unread = models.Unread(user_id=current_user.id, channel_id=channel_id, message_id=message_id)
        db.add(unread)
    db.commit()
    await websocket_emitter(channel_id=None, guild_id=None, event=Events.MESSAGE_ACK,
                            args={"channel_id": str(channel_id), "message_id": str(message_id),
                                  "mentions_count": unread.mentions_count},
                            user_id=current_user.id, db=db)
    return


async def create_reaction_with_perms(permission, channel, current_user, db, message, emoji):
    perms_checker = deps.ChannelPerms(permission)
    if await perms_checker.is_valid(channel, current_user, db):
        try:
            reaction = Reactions(emoji, current_user.id)
            message.reactions.append(reaction)
            db.add(message)
            db.commit()
            await websocket_emitter(channel_id=channel.id, guild_id=channel.guild_id, event=Events.MESSAGE_REACTION_ADD,
                                    args={
                                        'user_id': str(current_user.id),
                                        'channel_id': str(channel.id),
                                        'message_id': str(message.id),
                                        'guild_id': str(channel.guild_id),
                                        'emoji': emoji,
                                    }, db=db)
        except sqlalchemy.exc.IntegrityError:
            pass
    else:
        raise ValueError("Unauthorized")


@router.put('/{channel_id}/message/{message_id}/reactions/{emoji}/@me', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/1seconds", limit_type="user")),
], status_code=204)
async def create_reaction(channel_id: int, message_id: int, emoji: str,
                          db: Session = Depends(deps.get_db),
                          current_user: User = Depends(deps.get_current_user)) -> Optional[Response]:
    message: Message = db.query(Message).filter_by(id=message_id).filter_by(channel_id=channel_id).first()
    channel: Channel = db.query(Channel).filter_by(id=channel_id).first()
    if not emojilib.is_emoji(emoji):
        return Response(status_code=400)
    if message:
        if len(message.reactions) == 0:
            try:
                await create_reaction_with_perms(Permissions.ADD_REACTIONS, channel, current_user, db,
                                                 message, emoji)
                return
            except ValueError:
                return Response(status_code=403)
        else:
            try:
                await create_reaction_with_perms(Permissions.VIEW_CHANNEL, channel, current_user, db,
                                                 message, emoji)
                return
            except ValueError:
                return Response(status_code=403)

    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/@me', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/1seconds", limit_type="user")),
])
async def delete_reaction(channel_id: int, message_id: int, emoji: str,
                          db: Session = Depends(deps.get_db),
                          dependencies: tuple[Channel, User] = Depends(
                              deps.ChannelPerms(Permissions.VIEW_CHANNEL))) -> Response:
    channel, current_user = dependencies
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reaction = db.query(Reactions).filter_by(message_id=message_id). \
            filter_by(reaction=emoji). \
            filter_by(user_id=current_user.id).first()
        if reaction:
            db.delete(reaction)
            await websocket_emitter(channel_id=channel_id, guild_id=message.channel.guild_id,
                                    event=Events.MESSAGE_REACTION_REMOVE, args={
                    'user_id': str(current_user.id),
                    'channel_id': str(channel_id),
                    'message_id': str(message_id),
                    'guild_id': str(channel.guild_id),
                    'emoji': emoji,
                }, db=db)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/{user_id}', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/1seconds", limit_type="user")),
])
async def delete_reaction_by_user(channel_id: int, message_id: int, emoji: str,
                                  user_id: int,
                                  dependencies: tuple[Channel, User] = Depends(
                                      deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                                  db: Session = Depends(deps.get_db)) -> Response:
    channel, user = dependencies
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reaction = db.query(Reactions).filter_by(message_id=message_id). \
            filter_by(reaction=emoji). \
            filter_by(user_id=user_id).first()
        if reaction:
            db.delete(reaction)
            await websocket_emitter(channel_id=channel_id, guild_id=message.channel.guild_id,
                                    event=Events.MESSAGE_REACTION_REMOVE,
                                    args={
                                        'user_id': str(user_id),
                                        'channel_id': str(channel_id),
                                        'message_id': str(message_id),
                                        'guild_id': str(channel.guild_id),
                                        'emoji': emoji,
                                    }, db=db)
            db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.get('/{channel_id}/message/{message_id}/reactions/{emoji}',
            dependencies=[
                Depends(RateLimit("50/1seconds", limit_type="global")),
                Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
                Depends(RateLimit("1/1seconds", limit_type="user")),
                Depends(deps.ChannelPerms([Permissions.VIEW_CHANNEL, Permissions.READ_MESSAGE_HISTORY]))
            ])
async def get_reactions(channel_id: int, message_id: int, emoji: str, limit: int = 3,
                        db: Session = Depends(deps.get_db)) -> Union[list, Response]:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reactions: List[Reactions] = db.query(Reactions).filter_by(message_id=message_id). \
            filter_by(reaction=emoji).limit(limit).all()
        return [reaction.user.serialize() for reaction in reactions]
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/1seconds", limit_type="user")),
])
async def delete_all_reactions(channel_id: int, message_id: int,
                               dependencies: tuple[Channel, User] = Depends(
                                   deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                               db: Session = Depends(deps.get_db)) -> Response:
    channel, _ = dependencies
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        db.query(Reactions).filter_by(
            message_id=message_id).delete(synchronize_session=False)
        await websocket_emitter(channel_id=channel_id, guild_id=message.channel.guild_id,
                                event=Events.MESSAGE_REACTION_REMOVE_ALL,
                                args={
                                    'channel_id': str(channel_id),
                                    'guild_id': str(channel.guild_id),
                                    'message_id': str(message_id)
                                }, db=db)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}', dependencies=[
    Depends(RateLimit("50/1seconds", limit_type="global")),
    Depends(RateLimit("10/1seconds", limit_type="shared", namespace="channels")),
    Depends(RateLimit("1/1seconds", limit_type="user")),
])
async def delete_all_reactions_with_same_emoji(channel_id: int, message_id: int, emoji: str,
                                               dependencies: tuple[Channel, User] = Depends(
                                                   deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                                               db: Session = Depends(deps.get_db)
                                               ) -> Response:
    channel, user = dependencies
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        db.query(Reactions).filter_by(
            message_id=message_id).filter_by(reaction=emoji).delete(synchronize_session=False)
        await websocket_emitter(channel_id=channel_id, guild_id=message.channel.guild_id,
                                event=Events.MESSAGE_REACTION_REMOVE_EMOJI, args={
                'channel_id': str(channel_id),
                'guild_id': str(channel.guild_id),
                'message_id': str(message_id),
                'emoji': emoji
            }, db=db)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/permissions/{overwrite_id}')
async def delete_permission(channel_id: int, overwrite_id: int,
                            dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_ROLES)),
                            db: Session = Depends(deps.get_db)) -> Response:
    channel, _ = dependencies
    db.query(Overwrite).filter_by(id=overwrite_id).filter_by(channel_id=channel_id).delete()
    db.commit()
    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.CHANNEL_UPDATE,
                            args=channel.serialize(), db=db)
    return Response(status_code=204)


# TODO optimize this
@router.put('/{channel_id}/permissions/{overwrite_id}')
async def update_permissions(channel_id: int, overwrite_id: int,
                             body: OverwriteSchema,
                             dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_ROLES)),
                             db: Session = Depends(deps.get_db)) -> Response:
    channel, _ = dependencies
    existing_overwrite: Overwrite = db.query(Overwrite).filter_by(
        id=overwrite_id).filter_by(channel_id=channel_id).first()
    if existing_overwrite:
        existing_overwrite.allow = body.allow
        existing_overwrite.deny = body.deny
        db.commit()
    else:
        if not channel.guild_id:
            return Response(status_code=400)
        if body.type == 1:
            guild_member = db.query(models.GuildMembers).filter_by(guild_id=channel.guild_id).filter_by(
                user_id=overwrite_id).first()
            if not guild_member:
                return Response(status_code=404)
        elif body.type == 0:
            role = db.query(models.Role).filter_by(guild_id=channel.guild_id).filter_by(id=overwrite_id).first()
            if not role:
                return Response(status_code=404)
        else:
            return Response(status_code=400)
        overwrite = Overwrite(
            overwrite_id=overwrite_id,
            channel_id=channel_id,
            overwrite_type=body.type,
            allow=body.allow,
            deny=body.deny,
        )
        channel.overwrites.append(overwrite)
        db.commit()
    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.CHANNEL_UPDATE,
                            args=channel.serialize(), db=db)
    return Response(status_code=204)


@router.post('/{channel_id}/invites')
async def create_invite(channel_id: int,
                        data: ChannelInvite,
                        dependencies: tuple[Channel, User] = Depends(
                            deps.ChannelPerms(Permissions.CREATE_INSTANT_INVITE)),
                        db: Session = Depends(deps.get_db)):
    channel, current_user = dependencies
    if not data.unique:
        invite = db.query(Invite).filter_by(channel_id=channel_id). \
            filter_by(user_id=current_user.id). \
            filter_by(max_uses=data.max_uses). \
            filter_by(max_age=data.max_age).first()
        if invite:
            return {**invite.serialize(current_user.id)}
    invite = Invite(channel_id=channel_id, user_id=current_user.id,
                    max_age=data.max_age, max_uses=data.max_uses, db=db, guild_id=channel.guild_id)
    db.add(invite)
    db.commit()
    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.INVITE_CREATE,
                            args=invite.serialize(current_user.id), db=db)
    return invite.serialize(current_user.id)


@router.get('/{channel_id}/invites', dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
def get_invites(channel_id: int, db: Session = Depends(deps.get_db)):
    invites = db.query(Invite).filter_by(channel_id=channel_id).all()
    if not invites:
        return Response(status_code=404)
    return [invite.serialize() for invite in invites]


@router.get('/{channel_id}')
def get_channel(dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL))):
    return dependencies[0].serialize()


@router.patch('/{channel_id}', dependencies=[])
async def edit_channel(channel_id: int,
                       body: ChannelEdit,
                       response: Response,
                       dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS)),
                       db: Session = Depends(deps.get_db)):
    channel, current_user = dependencies
    if channel:
        if body.name:
            channel.name = body.name
        channel.topic = body.topic
        if body.parent_id and channel.type != ChannelType.guild_category:
            parent_channel = db.query(Channel).filter_by(id=body.parent_id).first()
            if parent_channel and parent_channel.type == ChannelType.guild_category:
                channel.parent_id = body.parent_id
        body_dict = body.dict(exclude_unset=True)
        if body.owner_id and channel.owner_id == current_user.id:
            member = db.query(models.ChannelMembers).filter_by(channel_id=channel_id).filter_by(
                user_id=body.owner_id).first()
            if member:
                channel.owner_id = body.owner_id
        if "icon" in body_dict:
            icon = None
            if body_dict["icon"]:
                icon = await validate_avatar(channel.id, body.icon, "channel-icons")
            channel.icon = icon
        db.commit()
        if channel.type == ChannelType.group_dm or channel.type == ChannelType.dm:
            for channel_member in channel.members:
                await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_UPDATE, guild_id=None,
                                        args=channel.serialize(channel_member.user_id), user_id=channel_member.user_id,
                                        db=db)
        else:
            await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.CHANNEL_UPDATE,
                                    args=channel.serialize(), db=db)
        return channel.serialize(current_user.id)
    response.status_code = 404
    return {"message": "Channel not found"}


@router.delete("/{channel_id}")
async def delete_channel(channel_id: int,
                         dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS)),
                         db: Session = Depends(deps.get_db)):
    channel, current_user = dependencies
    if channel:
        if channel.type == ChannelType.dm:
            for channel_member in channel.members:
                if channel_member.user_id == current_user.id and not channel_member.closed:
                    channel_member.closed = True
                    db.commit()
                    await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_DELETE, guild_id=None,
                                            args=channel.serialize(current_user.id),
                                            user_id=current_user.id, db=db)
            return ""
        elif channel.type == ChannelType.group_dm:
            db.query(models.Unread).filter_by(channel_id=channel.id).filter_by(user_id=current_user.id).delete()
            db.query(models.ChannelMembers).filter_by(channel_id=channel.id).filter_by(user_id=current_user.id).delete()
            db.commit()
            await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_DELETE, guild_id=None,
                                    args={"id": str(channel_id)},
                                    user_id=current_user.id, db=db)
            if len(channel.members) == 0:
                db.delete(channel)
                db.commit()
                return ""
            for channel_member in channel.members:
                await websocket_emitter(channel_id=channel.id, event=Events.CHANNEL_UPDATE, guild_id=None,
                                        args=channel.serialize(channel_member.user_id), user_id=channel_member.user_id,
                                        db=db)
            return ""
        affected_channels = None
        if channel.type == ChannelType.guild_category:
            affected_channels = db.query(Channel).filter_by(parent_id=channel.id).all()
        db.query(models.Unread).filter_by(channel_id=channel_id).delete()
        db.delete(channel)
        db.commit()
        await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.CHANNEL_DELETE,
                                args=channel.serialize(), db=db)
        if affected_channels:
            for channel in affected_channels:
                await websocket_emitter(channel_id=channel.id, guild_id=channel.guild_id, event=Events.CHANNEL_UPDATE,
                                        args=channel.serialize(), db=db)
        return {"success": True}
    return {"success": False}


@router.post("/{channel_id}/typing", status_code=204)
async def typing(channel_id: int,
                 dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.SEND_MESSAGES)),
                 db: Session = Depends(deps.get_db)):
    """
    Send a typing indicator to the specified channel.

    This endpoint allows a user to indicate that they are typing in a channel.

    Args:
        channel_id (int): The ID of the channel where the typing indicator should be sent.
        dependencies (tuple[Channel, User]): The channel and user dependencies, ensuring the user has permission to send messages.
        db (Session): The database session.

    Returns:
        None
    """
    channel, user = dependencies
    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.TYPING_START, args={
        'channel_id': str(channel_id),
        'guild_id': str(channel.guild_id),
        'user_id': str(user.id),
        'timestamp': datetime.utcnow().isoformat(),
    }, db=db)
    return


@router.get("/{channel_id}/pins")
def get_pins(channel_id: int,
             db: Session = Depends(deps.get_db),
             dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL))):
    """
    Retrieve pinned messages for a specific channel.

    Args:
        channel_id (int): The ID of the channel to retrieve pinned messages from.
        db (Session): The database session.
        dependencies (tuple[Channel, User]): The channel and user dependencies, ensuring the user has permission to view the channel.

    Returns:
        List[dict]: A list of serialized pinned messages.
    """
    channel, user = dependencies
    pins: list[PinnedMessages] = db.query(
        PinnedMessages).filter_by(channel_id=channel_id).all()
    if not pins:
        return None
    return [pin.message.serialize(user.id, db) for pin in pins]


@router.put("/{channel_id}/pins/{message_id}")
async def pin_message(channel_id: int, message_id: int,
                      db: Session = Depends(deps.get_db),
                      dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES))):
    """
    Pin a message in a channel.

    Args:
        channel_id (int): The ID of the channel where the message is located.
        message_id (int): The ID of the message to pin.
        db (Session): The database session.
        dependencies (tuple[Channel, User]): The channel and user dependencies, ensuring the user has permission to manage messages.

    Returns:
        None
    """
    channel, user = dependencies
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel.id).first()
    if message:
        if len(channel.pinned_messages) < 50:
            message.pinned = True
            pinned_message = PinnedMessages()
            pinned_message.message = message
            channel.pinned_messages.append(pinned_message)
            new_message = Message(content="", channel_id=channel_id, author_id=user.id,
                                  message_type=MessageTypes.CHANNEL_PINNED_MESSAGE, guild_id=channel.guild_id, replies_to=message_id)
            db.add(new_message)
            db.commit()
            await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.CHANNEL_PINS_UPDATE,
                                    args={
                                        'guild_id': str(channel.guild_id),
                                        'channel_id': str(channel.id),
                                    }, db=db)
            await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_UPDATE,
                                    args=message.serialize(user.id, db), db=db)
            await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_CREATE,
                                    args=new_message.serialize(user.id, db), db=db)
            return Response(status_code=204)
        return Response(status_code=403)
    return Response(status_code=404)


@router.delete("/{channel_id}/pins/{message_id}")
async def unpin_message(channel_id: int, message_id: int,
                        db: Session = Depends(deps.get_db),
                        dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES))):
    channel, user = dependencies
    pinned_message = db.query(PinnedMessages).filter_by(
        message_id=message_id).filter_by(channel_id=channel.id).first()
    if pinned_message:
        pinned_message.message.pinned = False
        message = pinned_message.message
        db.delete(pinned_message)
        db.commit()
        await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.CHANNEL_PINS_UPDATE,
                                args={
                                    'guild_id': str(channel.guild_id),
                                    'channel_id': str(channel.id),
                                }, db=db)
        await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.MESSAGE_UPDATE,
                                args=message.serialize(user.id, db), db=db)
        return Response(status_code=204)
    return Response(status_code=404)


@router.put("/{channel_id}/recipients/{user_id}", status_code=204)
async def add_recipient(channel_id: int, user_id: int,
                        db: Session = Depends(deps.get_db),
                        dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES))):
    channel, current_user = dependencies
    if channel.type != ChannelType.group_dm:
        raise HTTPException(status_code=400, detail="Channel is not a group DM")

    if not len(channel.members) < 10:
        raise HTTPException(status_code=400, detail="Channel is full")

    friend = db.query(Relationship).filter_by(type=1).filter(
        ((Relationship.addressee_id == current_user.id) & (Relationship.requester_id == user_id)) |
        ((Relationship.requester_id == current_user.id) & (Relationship.addressee_id == user_id))).first()

    if not friend:
        raise HTTPException(status_code=403, detail="You are not friends with this user")

    unread = Unread(channel_id=channel.id, user_id=user_id, message_id=None)
    db.add(unread)
    channel_member = ChannelMembers(closed=False)
    channel_member.user = friend.requester if friend.requester_id == user_id else friend.addressee
    channel.members.append(channel_member)
    db.add(channel)

    db.commit()

    for member in channel.members:
        if member.user_id == user_id:
            await websocket_emitter(channel_id=channel_id, guild_id=None, event=Events.CHANNEL_CREATE,
                                    args=channel.serialize(user_id), user_id=user_id, db=db)
        else:
            await websocket_emitter(channel_id=channel_id, guild_id=None, event=Events.CHANNEL_UPDATE,
                                    args=channel.serialize(member.user_id), user_id=member.user_id, db=db)

    return ""


@router.delete("/{channel_id}/recipients/{user_id}")
async def remove_recipient(channel_id: int, user_id: int,
                           db: Session = Depends(deps.get_db),
                           dependencies: tuple[Channel, User] = Depends(
                               deps.ChannelPerms(Permissions.MANAGE_MESSAGES))):
    channel, current_user = dependencies
    if channel.type != ChannelType.group_dm:
        raise HTTPException(status_code=400, detail="Channel is not a group DM")

    channel_member = db.query(ChannelMembers).filter_by(
        channel_id=channel.id).filter_by(user_id=user_id).first()

    if channel.owner_id != current_user.id:
        raise HTTPException(status_code=403, detail="You are not the owner of this channel")

    if user_id == current_user.id:
        raise HTTPException(status_code=403, detail="You can't remove yourself from a group DM")

    if not channel_member:
        raise HTTPException(status_code=404, detail="User is not a member of this channel")

    unread = db.query(Unread).filter_by(channel_id=channel.id).filter_by(user_id=user_id).first()

    if unread:
        db.delete(unread)

    db.delete(channel_member)
    db.commit()

    await websocket_emitter(channel_id=channel_id, guild_id=None, event=Events.CHANNEL_DELETE,
                            args={"id": str(channel_id)}, user_id=user_id, db=db)

    for member in channel.members:
        await websocket_emitter(channel_id=channel_id, guild_id=None, event=Events.CHANNEL_UPDATE,
                                args=channel.serialize(member.user_id), user_id=member.user_id, db=db)

    return ""


@router.get('/{channel_id}/webhooks')
def get_webhooks(dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS))):
    channel, user = dependencies
    return [webhook.serialize() for webhook in channel.webhooks]


@router.post('/{channel_id}/webhooks')
async def create_webhook(channel_id: int,
                         data: WebhookCreate,
                         db: Session = Depends(deps.get_db),
                         dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS))):
    channel, current_user = dependencies
    name = data.name if data.name else "Captain Hook"
    webhook = Webhook(1, channel_id, current_user.id,
                      name, None, guild_id=channel.guild_id)
    if "avatar" in data.dict(exclude_unset=True):
        if data.avatar:
            avatar = await validate_avatar(user_id=webhook.id, avatar=data.avatar)
            webhook.avatar = avatar
    channel.webhooks.append(webhook)
    db.add(webhook)
    db.commit()
    await websocket_emitter(channel_id=channel_id, guild_id=channel.guild_id, event=Events.WEBHOOKS_UPDATE, args={
        'guild_id': str(channel.guild_id),
        'channel_id': str(channel.id),
    }, db=db)
    return webhook.serialize()
