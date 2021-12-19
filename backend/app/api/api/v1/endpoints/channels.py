from datetime import datetime
from typing import Any, List, Optional, Union

from fastapi import APIRouter, Depends, Response, BackgroundTasks
from pydantic import BaseModel, root_validator
from sqlalchemy import desc
from sqlalchemy.orm import Session

from api import models
from api.api import deps
from api.core.events import Events, websocket_emitter
from api.core.permissions import Permissions
from api.models.channels import Channel, ChannelType, Overwrite, PinnedMessages
from api.models.invites import Invite
from api.models.messages import Message, Reactions
from api.models.user import User
from api.models.webhooks import Webhook
from api.schemas.channel import ChannelEdit
from api.schemas.invite import ChannelInvite
from api.schemas.message import MessageCreate
from api.schemas.overwrite import Overwrite as OverwriteSchema

router = APIRouter()


class WebhookCreate(BaseModel):
    name: str
    avatar: Optional[Any] = None


class MessageBulkDelete(BaseModel):
    messages: list[int]

    @classmethod
    @root_validator
    def validate_len(cls, v):
        messages = v.get('messages')
        if 2 <= len(messages) <= 100:
            raise ValueError('Only 2 to 100 messages can be deleted at a time')
        return v


@router.get('/{channel_id}/messages', dependencies=[Depends(
    deps.ChannelPerms([Permissions.VIEW_CHANNEL, Permissions.READ_MESSAGE_HISTORY])
)])
def get_messages(channel_id: int,
                 limit: int = 50,
                 before: Optional[int] = None,
                 after: Optional[int] = None,
                 db: Session = Depends(deps.get_db)) -> dict[str, list]:
    if after:
        messages = db.query(Message).filter_by(channel_id=channel_id).filter(Message.id >= after).order_by(desc(
            Message.timestamp)).limit(limit).all()
        return {"messages": [message.serialize() for message in messages]}

    elif before:
        messages = db.query(Message).filter_by(channel_id=channel_id).filter(Message.id <= before).order_by(desc(
            Message.timestamp)).limit(limit).all()
        return {"messages": [message.serialize() for message in messages]}

    messages = db.query(Message).filter_by(channel_id=channel_id).order_by(desc(
        Message.timestamp)).limit(limit).all()

    return {"messages": [message.serialize() for message in messages]}


@router.post('/{channel_id}/messages')
def create_message(channel_id: int,
                   body: MessageCreate,
                   background_task: BackgroundTasks,
                   dependency: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.SEND_MESSAGES)),
                   db: Session = Depends(lambda: deps.get_db())) -> dict:
    channel, current_user = dependency
    message = Message(body.content.strip(), channel_id, current_user.id)
    db.add(message)
    db.commit()
    background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.MESSAGE_CREATE,
                             message.serialize())
    return message.serialize()


@router.get('/{channel_id}/messages/{message_id}',
            dependencies=[Depends(deps.ChannelPerms(Permissions.READ_MESSAGE_HISTORY))])
def get_message(channel_id: int,
                message_id: int,
                response: Response,
                db: Session = Depends(deps.get_db)) -> Union[dict[str, str], None]:
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        return {"message": message.serialize()}
    response.status_code = 404
    return


@router.delete('/{channel_id}/messages/{message_id}')
async def delete_message(channel_id: int,
                         message_id: int,
                         response: Response,
                         background_task: BackgroundTasks,
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
            background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.MESSAGE_DELETE,
                                     {"id": message.id, "channel_id": channel.id, 'guild_id': channel.guild_id})
            return
        response.status_code = 401
        return {"message": "Not authorized"}
    response.status_code = 404
    return {"message": "Message not found"}


@router.delete('/{channel_id}/messages/bulk-delete', status_code=204,
               dependencies=[])
def bulk_delete_messages(channel_id: int, body: MessageBulkDelete, background_task: BackgroundTasks,
                         dependencies: Channel = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                         db: Session = Depends(deps.get_db)):
    db.query(Message).filter_by(channel_id=channel_id).filter(Message.id.in_(body.messages)).delete()

    channel, user = dependencies
    background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.MESSAGE_DELETE_BULK,
                             {"id": body.messages, "channel_id": channel.id, 'guild_id': channel.guild_id})
    return


@router.patch('/{channel_id}/messages/{message_id}')
async def edit_message(channel_id: int,
                       message_id: int,
                       message: MessageCreate,
                       response: Response,
                       background_task: BackgroundTasks,
                       current_user: User = Depends(deps.get_current_user),
                       db: Session = Depends(deps.get_db)) -> Union[dict, None]:
    perm_checker = deps.ChannelPerms(Permissions.MANAGE_MESSAGES)

    prev_message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if prev_message:
        if prev_message.author_id == current_user.id or await perm_checker.is_valid(channel, current_user, db):
            if message.content.strip() and prev_message.author_id == current_user.id:
                prev_message.content = message.content.strip()
                prev_message.edited_timestamp = datetime.now()
            db.commit()
            background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.MESSAGE_UPDATE,
                                     prev_message.serialize())
            return {"message": prev_message.serialize()}
        response.status_code = 403
        return {"message": "Not authorized"}
    response.status_code = 404
    return


async def create_reaction_with_perms(permission, channel, current_user, db, background_task, message, emoji):
    perms_checker = deps.ChannelPerms(permission)
    if await perms_checker.is_valid(channel, current_user, db):
        reaction = Reactions(emoji, current_user.id)
        message.reactions.append(reaction)
        db.add(message)
        db.commit()
        background_task.add_task(websocket_emitter, channel.id, channel.guild_id, Events.MESSAGE_REACTION_ADD, {
            'user_id': current_user.id,
            'channel_id': channel.id,
            'message_id': message.id,
            'guild_id': channel.guild_id,
            'emoji': emoji,
        })
    else:
        raise ValueError("Unauthorized")


@router.put('/{channel_id}/message/{message_id}/reactions/{emoji}/@me')
async def create_reaction(channel_id: int, message_id: int, emoji: str,
                          background_task: BackgroundTasks,
                          db: Session = Depends(deps.get_db),
                          current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    channel: Channel = db.query(Channel).filter_by(id=channel_id).first()
    if message:
        if len(message.reactions) == 0:
            try:
                await create_reaction_with_perms(Permissions.ADD_REACTIONS, channel, current_user, db, background_task,
                                                 message, emoji)
            except ValueError:
                return Response(status_code=403)
        else:
            try:
                await create_reaction_with_perms(Permissions.VIEW_CHANNEL, channel, current_user, db, background_task,
                                                 message, emoji)
            except ValueError:
                return Response(status_code=403)

    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/@me')
def delete_reaction(channel_id: int, message_id: int, emoji: str, background_task: BackgroundTasks,
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
            background_task.add_task(websocket_emitter, channel_id, message.channel.guild_id,
                                     Events.MESSAGE_REACTION_REMOVE, {
                                         'user_id': current_user.id,
                                         'channel_id': channel_id,
                                         'message_id': message_id,
                                         'guild_id': channel.guild_id,
                                         'emoji': emoji,
                                     })
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/{user_id}')
def delete_reaction_by_user(channel_id: int, message_id: int, emoji: str,
                            user_id: int,
                            background_task: BackgroundTasks,
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
            background_task.add_task(
                websocket_emitter, channel_id, message.channel.guild_id, Events.MESSAGE_REACTION_REMOVE, {
                    'user_id': user_id,
                    'channel_id': channel_id,
                    'message_id': message_id,
                    'guild_id': channel.guild_id,
                    'emoji': emoji,
                })
            db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.get('/{channel_id}/message/{message_id}/reactions/{emoji}',
            dependencies=[Depends(deps.ChannelPerms([Permissions.VIEW_CHANNEL, Permissions.READ_MESSAGE_HISTORY]))])
def get_reactions(channel_id: int, message_id: int, emoji: str,
                  db: Session = Depends(deps.get_db)) -> Union[set[list], Response]:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reactions: List[Reactions] = db.query(Reactions).filter_by(message_id=message_id). \
            filter_by(reaction=emoji).limit(25).all()
        return {[reaction.user.serialize() for reaction in reactions]}
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions')
def delete_all_reactions(channel_id: int, message_id: int, background_task: BackgroundTasks,
                         dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                         db: Session = Depends(deps.get_db)) -> Response:
    channel, _ = dependencies
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        db.query(Reactions).filter_by(
            message_id=message_id).delete(synchronize_session=False)
        background_task.add_task(websocket_emitter, channel_id, message.channel.guild_id,
                                 Events.MESSAGE_REACTION_REMOVE_ALL, {
                                     'channel_id': channel_id,
                                     'guild_id': channel.guild_id,
                                     'message_id': message_id
                                 })
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}')
def delete_all_reactions_with_same_emoji(channel_id: int, message_id: int, emoji: str, background_task: BackgroundTasks,
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
        background_task.add_task(websocket_emitter, channel_id, message.channel.guild_id,
                                 Events.MESSAGE_REACTION_REMOVE_EMOJI, {
                                     'channel_id': channel_id,
                                     'guild_id': channel.guild_id,
                                     'message_id': message_id,
                                     'emoji': emoji
                                 })
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


# TODO optimize this
@router.put('/{channel_id}/permissions/{overwrite_id}')
def update_permissions(channel_id: int, overwrite_id: int,
                       body: OverwriteSchema,
                       background_task: BackgroundTasks,
                       dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_ROLES)),
                       db: Session = Depends(deps.get_db)) -> Response:
    channel, _ = dependencies
    overwrite: Overwrite = db.query(Overwrite).filter_by(
        id=overwrite_id).filter_by(channel_id=channel_id).first()
    if overwrite:
        overwrite.allow = overwrite.allow
        overwrite.deny = overwrite.deny
        db.commit()
        return Response(status_code=204)
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
        db.add(overwrite)
        db.commit()
    channel = db.query(Channel).filter_by(id=channel_id).first()
    background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.CHANNEL_UPDATE,
                             channel.serialize())
    return Response(status_code=204)


@router.post('/{channel_id}/invites')
def create_invite(channel_id: int,
                  data: ChannelInvite,
                  background_task: BackgroundTasks,
                  dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.CREATE_INSTANT_INVITE)),
                  db: Session = Depends(deps.get_db)):
    channel, current_user = dependencies
    if not data.unique:
        invite = db.query(Invite).filter_by(channel_id=channel_id). \
            filter_by(user_id=current_user.id). \
            filter_by(max_uses=data.max_uses). \
            filter_by(max_age=data.max_age).first()
        if invite:
            return {**invite.serialize()}
    invite = Invite(channel_id, current_user.id,
                    data.max_age, data.max_uses, db)
    db.add(invite)
    db.commit()
    background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.INVITE_CREATE, invite.serialize())
    return invite.serialize()


@router.get('/{channel_id}/invites', dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
def get_invites(channel_id: int, db: Session = Depends(deps.get_db)):
    invites = db.query(Invite).filter_by(channel_id=channel_id).all()
    if not invites:
        return Response(status_code=404)
    return {'invites': [invite.serialize() for invite in invites]}


@router.get('/{channel_id}')
def get_channel(dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL))):
    return dependencies[0].serialize()


@router.patch('/{channel_id}', dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
def edit_channel(channel_id: int,
                 body: ChannelEdit,
                 response: Response,
                 background_task: BackgroundTasks,
                 db: Session = Depends(deps.get_db)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        channel.name = body.name
        channel.icon = body.icon
        db.commit()
        background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.CHANNEL_UPDATE,
                                 channel.serialize())
        return {**channel.serialize()}
    response.status_code = 404
    return {"message": "Channel not found"}


@router.delete("/{channel_id}", dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
def delete_channel(channel_id: int,
                   background_task: BackgroundTasks,
                   db: Session = Depends(deps.get_db)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        db.delete(channel)
        db.commit()
        background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.CHANNEL_DELETE,
                                 channel.serialize())
        return {"success": True}
    return {"success": False}


@router.post("/{channel_id}/typing", status_code=204)
def typing(channel_id: int,
           background_task: BackgroundTasks,
           dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.SEND_MESSAGES))):
    channel, user = dependencies
    background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.TYPING_START, {
        'channel_id': channel_id,
        'guild_id': channel.guild_id,
        'user_id': user.id,
        'timestamp': round(datetime.now()),
    })
    return


@router.get("/{channel_id}/pins")
def get_pins(channel_id: int,
             db: Session = Depends(deps.get_db),
             dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL))):
    channel, _ = dependencies
    pins: list[PinnedMessages] = db.query(
        PinnedMessages).filter_by(channel_id=channel_id).all()
    if not pins:
        return []
    return {[pin.message.serialize() for pin in pins]}


@router.put("/{channel_id}/pins/{message_id}")
def pin_message(channel_id: int, message_id: int,
                background_task: BackgroundTasks,
                db: Session = Depends(deps.get_db),
                dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES))):
    channel, _ = dependencies
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel.id).first()
    if message:
        if len(channel.pinned_messages) < 50:
            channel.pinned_messages.append(message)
            db.commit()
            background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.CHANNEL_PINS_UPDATE, {
                'guild_id': channel.guild_id,
                'channel_id': channel.id,
            })
            return Response(status_code=204)
        return Response(status_code=403)
    return Response(status_code=404)


@router.delete("/{channel_id}/pins/{message_id}")
def unpin_message(channel_id: int, message_id: int,
                  background_task: BackgroundTasks,
                  db: Session = Depends(deps.get_db),
                  dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES))):
    channel, _ = dependencies
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel.id).first()
    if message:
        channel.pinned_messages.remove(message)
        db.commit()
        background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.CHANNEL_PINS_UPDATE, {
            'guild_id': channel.guild_id,
            'channel_id': channel.id,
        })
        return Response(status_code=204)
    return Response(status_code=404)


@router.put("/{channel_id}/recipients/{user_id}")
def add_recipient(channel_id: int, user_id: int,
                  db: Session = Depends(deps.get_db),
                  current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).filter_by(type=ChannelType.group_dm).filter(
        Channel.members.any(User.id == current_user.id)).first()
    if channel:
        user: User = db.query(User).filter_by(id=user_id).first()
        if user:
            channel.recipients.append(user)
            db.commit()
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.delete("/{channel_id}/recipients/{user_id}")
def remove_recipient(channel_id: int, user_id: int,
                     db: Session = Depends(deps.get_db),
                     current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).filter_by(type=ChannelType.group_dm).filter(
        Channel.members.any(User.id == current_user.id)).first()
    if channel:
        user: User = db.query(User).filter_by(id=user_id).first()
        if user:
            channel.recipients.remove(user)
            db.commit()
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.get('/{channel_id}/webhooks')
def get_webhooks(dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS))):
    channel, user = dependencies
    return {
        [webhook.serialize() for webhook in channel.webhooks]
    }


@router.post('/{channel_id}/webhooks')
def create_webhook(channel_id: int,
                   data: WebhookCreate,
                   background_task: BackgroundTasks,
                   db: Session = Depends(deps.get_db),
                   dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS))):
    channel, current_user = dependencies
    webhook = Webhook(1, channel_id, current_user.id,
                      data.name, data.avatar, guild_id=channel.guild_id)
    channel.webhooks.append(webhook)
    db.commit()
    background_task.add_task(websocket_emitter, channel_id, channel.guild_id, Events.WEBHOOKS_UPDATE, {
        'guild_id': channel.guild_id,
        'channel_id': channel.id,
    })
    return webhook.serialize()
