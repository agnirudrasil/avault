import json
from datetime import datetime
from json import JSONDecodeError
from typing import Any, List, Optional, Union

import emoji as emojilib
import sqlalchemy.exc
from fastapi import APIRouter, Depends, Response, Request, Header, status, HTTPException, UploadFile
from pydantic import BaseModel, root_validator, ValidationError
from sqlalchemy import desc, asc
from sqlalchemy.orm import Session

from api import models
from api.api import deps
from api.core.events import Events, websocket_emitter
from api.core.permissions import Permissions
from api.core.storage import storage
from api.models.channels import Channel, ChannelType, Overwrite, PinnedMessages
from api.models.invites import Invite
from api.models.messages import Message, Reactions, MessageTypes
from api.models.user import User
from api.models.webhooks import Webhook
from api.schemas.channel import ChannelEdit
from api.schemas.invite import ChannelInvite
from api.schemas.message import MessageCreate
from api.schemas.overwrite import Overwrite as OverwriteSchema
from api.utils.attachment import file_to_attachment
from api.worker import embed_message

router = APIRouter()


class WebhookCreate(BaseModel):
    name: Optional[str] = None
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


@router.get('/{channel_id}/messages')
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


@router.post('/{channel_id}/messages')
async def create_message(channel_id: int,
                         request: Request,
                         content_type: str = Header(...),
                         content_length: int = Header(..., lt=1024 * 1024 * 5),
                         dependency: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.SEND_MESSAGES)),
                         db: Session = Depends(deps.get_db)) -> Any:
    embed_checker = deps.ChannelPerms(Permissions.EMBED_LINKS)
    attachments = []
    body = None
    if content_type.startswith('multipart/form-data'):
        form_body = await request.form()
        files: list[UploadFile] = form_body.getlist("files")
        if files:
            for file in files:
                attachment = file_to_attachment(file, channel_id)
                attachments.append(attachment)
                storage.upload_file(file.file, "avault",
                                    f"attachments/{channel_id}/{attachment['id']}/{attachment['filename']}", "public",
                                    file.content_type)
        payload_json: UploadFile = form_body.get('payload_json')
        if payload_json and payload_json.content_type == "application/json":
            try:
                payload = await payload_json.read(1024 * 1024 * 1)
                body = MessageCreate(**json.loads(payload))
            except JSONDecodeError:
                raise HTTPException(status_code=400, detail='Invalid JSON')
            except ValidationError as e:
                raise HTTPException(status_code=400, detail=e.json())
    elif content_type.startswith('application/json'):
        json_body = await request.json()
        try:
            body = MessageCreate(**json_body)
        except ValidationError as e:
            return {'error': e.json()}
    else:
        return Response(content={"data": "Invalid content type"}, status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE, )
    channel, current_user = dependency
    my_attachments = []
    if body and body.attachments:
        for attachment in body.attachments:
            my_attachments.append({**attachments[attachment.id], "description": attachment.description})
    else:
        my_attachments = attachments
    message = Message(body.content.strip() if body else "", channel_id, current_user.id,
                      embeds=body.embeds if body else None,
                      replies_to=body.message_reference if body else None,
                      message_type=MessageTypes.REPLY if body and body.message_reference else MessageTypes.DEFAULT,
                      attachments=my_attachments)
    db.add(message)
    db.commit()
    if not message.embeds and await embed_checker.is_valid(channel, current_user, db):
        embed_message.delay(message.content, message.id, channel.guild_id, current_user.id)
    await websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_CREATE,
                            message.serialize(current_user.id, db))
    return message.serialize(current_user.id, db)


@router.get('/{channel_id}/messages/{message_id}',
            dependencies=[])
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


@router.delete('/{channel_id}/messages/{message_id}')
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
            await websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_DELETE,
                                    {"id": str(message.id), "channel_id": str(channel.id),
                                     'guild_id': str(channel.guild_id)})
            return
        response.status_code = 401
        return {"message": "Not authorized"}
    response.status_code = 404
    return {"message": "Message not found"}


@router.delete('/{channel_id}/messages/bulk-delete', status_code=204,
               dependencies=[])
async def bulk_delete_messages(channel_id: int, body: MessageBulkDelete,
                               dependencies: Channel = Depends(deps.ChannelPerms(Permissions.MANAGE_MESSAGES)),
                               db: Session = Depends(deps.get_db)):
    db.query(Message).filter_by(channel_id=channel_id).filter(Message.id.in_(map(int, body.messages))).delete()

    channel, user = dependencies
    await (websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_DELETE_BULK,
                             {"ids": map(str, body.messages), "channel_id": str(channel.id),
                              'guild_id': str(channel.guild_id)}))
    return


@router.patch('/{channel_id}/messages/{message_id}')
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
            await (websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_UPDATE,
                                     prev_message.serialize(current_user.id, db)))
            return prev_message.serialize(current_user.id, db)
        response.status_code = 403
        return {"message": "Not authorized"}
    response.status_code = 404
    return


@router.post('/{channel_id}/messages/{message_id}/ack', status_code=204)
async def message_ack(channel_id: int, message_id: int, current_user: User = Depends(deps.get_current_user),
                      db: Session = Depends(deps.get_db)):
    unread = db.query(models.Unread).filter_by(user_id=current_user.id).filter_by(channel_id=channel_id).first()
    if unread:
        unread.last_message_id = message_id
    else:
        unread = models.Unread(user_id=current_user.id, channel_id=channel_id, message_id=message_id)
        db.add(unread)
    db.commit()
    await websocket_emitter(None, None, event=Events.MESSAGE_ACK,
                            args={"channel_id": str(channel_id), "message_id": str(message_id)},
                            user_id=current_user.id)
    return


async def create_reaction_with_perms(permission, channel, current_user, db, message, emoji):
    perms_checker = deps.ChannelPerms(permission)
    if await perms_checker.is_valid(channel, current_user, db):
        try:
            reaction = Reactions(emoji, current_user.id)
            message.reactions.append(reaction)
            db.add(message)
            db.commit()
            await websocket_emitter(channel.id, channel.guild_id, Events.MESSAGE_REACTION_ADD, {
                'user_id': str(current_user.id),
                'channel_id': str(channel.id),
                'message_id': str(message.id),
                'guild_id': str(channel.guild_id),
                'emoji': emoji,
            })
        except sqlalchemy.exc.IntegrityError:
            pass
    else:
        raise ValueError("Unauthorized")


@router.put('/{channel_id}/message/{message_id}/reactions/{emoji}/@me', status_code=204)
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


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/@me')
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
            await websocket_emitter(channel_id, message.channel.guild_id,
                                    Events.MESSAGE_REACTION_REMOVE, {
                                        'user_id': str(current_user.id),
                                        'channel_id': str(channel_id),
                                        'message_id': str(message_id),
                                        'guild_id': str(channel.guild_id),
                                        'emoji': emoji,
                                    })
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/{user_id}')
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
            await websocket_emitter(channel_id, message.channel.guild_id, Events.MESSAGE_REACTION_REMOVE,
                                    {
                                        'user_id': str(user_id),
                                        'channel_id': str(channel_id),
                                        'message_id': str(message_id),
                                        'guild_id': str(channel.guild_id),
                                        'emoji': emoji,
                                    })
            db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.get('/{channel_id}/message/{message_id}/reactions/{emoji}',
            dependencies=[Depends(deps.ChannelPerms([Permissions.VIEW_CHANNEL, Permissions.READ_MESSAGE_HISTORY]))])
async def get_reactions(channel_id: int, message_id: int, emoji: str, limit: int = 3,
                        db: Session = Depends(deps.get_db)) -> Union[list, Response]:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reactions: List[Reactions] = db.query(Reactions).filter_by(message_id=message_id). \
            filter_by(reaction=emoji).limit(limit).all()
        return [reaction.user.serialize() for reaction in reactions]
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions')
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
        await websocket_emitter(channel_id, message.channel.guild_id,
                                Events.MESSAGE_REACTION_REMOVE_ALL, {
                                    'channel_id': str(channel_id),
                                    'guild_id': str(channel.guild_id),
                                    'message_id': str(message_id)
                                })
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}')
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
        await websocket_emitter(channel_id, message.channel.guild_id,
                                Events.MESSAGE_REACTION_REMOVE_EMOJI, {
                                    'channel_id': str(channel_id),
                                    'guild_id': str(channel.guild_id),
                                    'message_id': str(message_id),
                                    'emoji': emoji
                                })
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
    await websocket_emitter(channel_id, channel.guild_id, Events.CHANNEL_UPDATE,
                            channel.serialize())
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
    await websocket_emitter(channel_id, channel.guild_id, Events.CHANNEL_UPDATE,
                            channel.serialize())
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
            return {**invite.serialize()}
    invite = Invite(channel_id, current_user.id,
                    data.max_age, data.max_uses, db)
    db.add(invite)
    db.commit()
    await websocket_emitter(channel_id, channel.guild_id, Events.INVITE_CREATE, invite.serialize())
    return invite.serialize()


@router.get('/{channel_id}/invites', dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
def get_invites(channel_id: int, db: Session = Depends(deps.get_db)):
    invites = db.query(Invite).filter_by(channel_id=channel_id).all()
    if not invites:
        return Response(status_code=404)
    return [invite.serialize() for invite in invites]


@router.get('/{channel_id}')
def get_channel(dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL))):
    return dependencies[0].serialize()


@router.patch('/{channel_id}', dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
async def edit_channel(channel_id: int,
                       body: ChannelEdit,
                       response: Response,
                       db: Session = Depends(deps.get_db)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        channel.name = body.name
        if body.icon:
            channel.icon = body.icon
        if body.topic is not None:
            channel.topic = body.topic
        db.commit()
        await websocket_emitter(channel_id, channel.guild_id, Events.CHANNEL_UPDATE,
                                channel.serialize())
        return channel.serialize()
    response.status_code = 404
    return {"message": "Channel not found"}


@router.delete("/{channel_id}", dependencies=[Depends(deps.ChannelPerms(Permissions.MANAGE_CHANNELS))])
async def delete_channel(channel_id: int,
                         db: Session = Depends(deps.get_db)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        db.delete(channel)
        db.commit()
        await websocket_emitter(channel_id, channel.guild_id, Events.CHANNEL_DELETE,
                                channel.serialize())
        return {"success": True}
    return {"success": False}


@router.post("/{channel_id}/typing", status_code=204)
async def typing(channel_id: int,
                 dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.SEND_MESSAGES))):
    channel, user = dependencies
    await websocket_emitter(channel_id, channel.guild_id, Events.TYPING_START, {
        'channel_id': str(channel_id),
        'guild_id': str(channel.guild_id),
        'user_id': str(user.id),
        'timestamp': str(datetime.now()),
    })
    return


@router.get("/{channel_id}/pins")
def get_pins(channel_id: int,
             db: Session = Depends(deps.get_db),
             dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.VIEW_CHANNEL))):
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
    channel, user = dependencies
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel.id).first()
    if message:
        if len(channel.pinned_messages) < 50:
            message.pinned = True
            pinned_message = PinnedMessages()
            pinned_message.message = message
            channel.pinned_messages.append(pinned_message)
            new_message = Message("", channel_id, user.id, message_type=MessageTypes.CHANNEL_PINNED_MESSAGE)
            db.add(new_message)
            db.commit()
            await websocket_emitter(channel_id, channel.guild_id, Events.CHANNEL_PINS_UPDATE, {
                'guild_id': str(channel.guild_id),
                'channel_id': str(channel.id),
            })
            await (websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_UPDATE,
                                     message.serialize(user.id, db)))
            await websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_CREATE,
                                    new_message.serialize(user.id, db))
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
        await websocket_emitter(channel_id, channel.guild_id, Events.CHANNEL_PINS_UPDATE, {
            'guild_id': str(channel.guild_id),
            'channel_id': str(channel.id),
        })
        await (websocket_emitter(channel_id, channel.guild_id, Events.MESSAGE_UPDATE,
                                 message.serialize(user.id, db)))
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
    return [webhook.serialize() for webhook in channel.webhooks]


@router.post('/{channel_id}/webhooks')
async def create_webhook(channel_id: int,
                         data: WebhookCreate,
                         db: Session = Depends(deps.get_db),
                         dependencies: tuple[Channel, User] = Depends(deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS))):
    channel, current_user = dependencies
    name = data.name if data.name else "Captain Hook"
    webhook = Webhook(1, channel_id, current_user.id,
                      name, data.avatar, guild_id=channel.guild_id)
    channel.webhooks.append(webhook)
    db.add(webhook)
    db.commit()
    await websocket_emitter(channel_id, channel.guild_id, Events.WEBHOOKS_UPDATE, {
        'guild_id': str(channel.guild_id),
        'channel_id': str(channel.id),
    })
    return webhook.serialize()
