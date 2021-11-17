from datetime import datetime
from typing import List
from avault.schemas.channel import ChannelEdit, ChannelValidate, ThreadCreate
from avault.schemas.invite import ChannelInvite
from avault.schemas.overwrite import Overwrite as OverwriteSchema
from fastapi import APIRouter, Depends, Response
from itsdangerous import json
from sqlalchemy.orm import Session
from pydantic import BaseModel, ValidationError
from avault.models.invites import Invite
from avault.models.user import User
from avault.api import deps
from avault.models.messages import Message, Reactions
from avault.models.channels import Channel, ChannelType, Overwrite, PinnedMessages, ThreadMetadata, channel_members


router = APIRouter()


class MessageCreate(BaseModel):
    content: str


@router.get('/{channel_id}/messages')
def get_messages(channel_id: int,
                 db: Session = Depends(deps.get_db),
                 current_user: User = Depends(deps.get_current_user)) -> List[dict]:
    messages = db.query(Message).filter_by(channel_id=channel_id).order_by(
        Message.timestamp.desc()).limit(25).all()
    return {"messages": [message.serialize() for message in messages]}


@router.post('/{channel_id}/messages')
def create_message(channel_id: int,
                   body: MessageCreate,
                   current_user: User = Depends(deps.get_current_user),
                   db: Session = Depends(lambda: deps.get_db())) -> dict:
    message = Message(body.content.strip(), channel_id, current_user.id)
    db.add(message)
    db.commit()
    return {"message": message.serialize()}


@router.get('/{channel_id}/messages/{message_id}')
def get_message(channel_id: int,
                message_id: int,
                current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)) -> dict:
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        return {"message": message.serialize()}
    return "", 404


@router.delete('/{channel_id}/messages/{message_id}')
def delete_message(channel_id: int,
                   message_id: int,
                   current_user: User = Depends(deps.get_current_user),
                   db: Session = Depends(deps.get_db)) -> dict:
    message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        if message.author_id == current_user.id:
            db.delete(message)
            db.commit()
            return "", 204
        return {"message": "Not authorized"}, 403
    return "", 404


@router.patch('/{channel_id}/messages/{message_id}')
def edit_message(channel_id: int,
                 message_id: int,
                 message: MessageCreate,
                 current_user: User = Depends(deps.get_current_user),
                 db: Session = Depends(deps.get_db)) -> dict:
    prev_message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if prev_message:
        if prev_message.author_id == current_user.id:
            if message.content.strip():
                prev_message.content = message.content.strip()
                prev_message.edited_timestamp = datetime.now()
                db.commit()
            return {"message": prev_message.serialize()}
        return {"message": "Not authorized"}, 403
    return "", 404


@router.put('/{channel_id}/message/{message_id}/reactions/{emoji}/@me')
def create_reaction(channel_id: int, message_id: int, emoji: str,
                    db: Session = Depends(deps.get_db),
                    current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        if len(message.reactions) == 0:
            # TODO requires ADD_REACTION permission
            reaction = Reactions(emoji, current_user.id)
            message.reactions.append(reaction)
            db.add(message)
            db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/@me')
def delete_reaction(channel_id: int, message_id: int, emoji: str,
                    db: Session = Depends(deps.get_db),
                    current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reaction = db.query(Reactions).filter_by(message_id=message_id).\
            filter_by(reaction=emoji).\
            filter_by(user_id=current_user.id).first()
        if reaction:
            db.delete(reaction)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}/{user_id}')
def delete_reaction_by_user(channel_id: int, message_id: int, emoji: str,
                            user_id: int,
                            db: Session = Depends(deps.get_db),
                            current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reaction = db.query(Reactions).filter_by(message_id=message_id).\
            filter_by(reaction=emoji).\
            filter_by(user_id=user_id).first()
        if reaction:
            db.delete(reaction)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.get('/{channel_id}/message/{message_id}/reactions/{emoji}')
def get_reactions(channel_id: int, message_id: int, emoji: str,
                  db: Session = Depends(deps.get_db),
                  current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        reactions: List[Reactions] = db.query(Reactions).filter_by(message_id=message_id).\
            filter_by(reaction=emoji).limit(25).all()
        return {[reaction.user.serialize() for reaction in reactions]}
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions')
def delete_all_reactions(channel_id: int, message_id: int,
                         db: Session = Depends(deps.get_db),
                         current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        db.query(Reactions).filter_by(
            message_id=message_id).delete(synchronize_session=False)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete('/{channel_id}/message/{message_id}/reactions/{emoji}')
def delete_all_reactions_with_same_emoji(channel_id: int, message_id: int, emoji: str,
                                         db: Session = Depends(deps.get_db),
                                         current_user: User = Depends(deps.get_current_user)) -> Response:
    message: Message = db.query(Message).filter_by(
        id=message_id).filter_by(channel_id=channel_id).first()
    if message:
        db.query(Reactions).filter_by(
            message_id=message_id).filter_by(reaction=emoji).delete(synchronize_session=False)
        db.commit()
        return Response(status_code=204)
    return Response(status_code=404)


@router.put('/{channel_id}/permissions/{overwrite_id}')
def update_permissions(channel_id: int, overwrite_id: int,
                       body: OverwriteSchema,
                       db: Session = Depends(deps.get_db),
                       current_user: User = Depends(deps.get_current_user)) -> Response:
    overwrite = None
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if not channel:
        return Response(status_code=404)
    if body.type == 1:
        overwrite = db.query(Overwrite).filter_by(
            member_id=overwrite_id).filter_by(channel_id=channel_id).first()
    else:
        overwrite: Overwrite = db.query(Overwrite).filter_by(
            role_id=overwrite_id).filter_by(channel_id=channel_id).first()
    if overwrite:
        overwrite.allow = overwrite.allow
        overwrite.deny = overwrite.deny
        db.commit()
        return Response(status_code=204)
    else:
        overwrite = Overwrite(
            allow=body.allow, deny=body.deny, channel_id=channel_id)
        if body.type == 1:
            overwrite.member_id = overwrite_id
        else:
            overwrite.role_id = overwrite_id
        db.add(overwrite)
        db.commit()
    return Response(status_code=404)


@router.post('/{channel_id}/invites')
def invite(channel_id: int,
           data: ChannelInvite,
           current_user: User = Depends(deps.get_current_user),
           db: Session = Depends(deps.get_db)):
    if data.unique == False:
        invite = db.query(Invite).filter_by(channel_id=channel_id).\
            filter_by(user_id=current_user.id).\
            filter_by(max_uses=data.max_uses).\
            filter_by(max_age=data.max_age).first()
        if invite:
            return {**invite.serialize()}
    invite = Invite(channel_id, current_user.id,
                    data.max_age, data.max_uses, db)
    db.add(invite)
    db.commit()
    return {**invite.serialize()}


@router.get('/{channel_id}/invites')
def get_invites(channel_id: int, db: Session = Depends(deps.get_db),):
    invites = db.query(Invite).filter_by(channel_id=channel_id).all()
    return {'invites': [invite.serialize() for invite in invites]}


@router.get('/{channel_id}')
def get_channel(channel_id: int, response: Response, db: Session = Depends(deps.get_db)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        return {**channel.serialize()}
    response.status_code = 404
    return {"message": "Channel not found"}


@router.patch('/{channel_id}')
def edit_channel(channel_id: int,
                 body: ChannelEdit,
                 response: Response,
                 db: Session = Depends(deps.get_db)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        channel.name = body.name
        channel.icon = body.icon
        db.commit()
        return {**channel.serialize()}
    response.status_code = 404
    return {"message": "Channel not found"}


@router.delete("/{channel_id}")
def delete(channel_id: int,
           db: Session = Depends(deps.get_db),
           current_user: User = Depends(deps.get_current_user)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        db.delete(channel)
        db.commit()
        return {"success": True}
    return {"success": False}


@router.post("/{channel_id}/typing", status_code=204)
def typing(channel_id: int,
           current_user: User = Depends(deps.get_current_user)):
    return ""


@router.get("/{channel_id}/pins")
def get_pins(channel_id: int,
             db: Session = Depends(deps.get_db),
             current_user: User = Depends(deps.get_current_user)):
    channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        pins: PinnedMessages = db.query(
            PinnedMessages).filter_by(channel_id=channel_id).all()
        return {'pins': [pin.message.serialize() for pin in pins]}


@router.put("/{channel_id}/pins/{message_id}")
def pin_message(channel_id: int, message_id: int,
                db: Session = Depends(deps.get_db),
                current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        message = db.query(Message).filter_by(
            id=message_id).filter_by(channel_id=channel.id).first()
        if message:
            channel.pinned_messages.append(message)
            db.commit()
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.delete("/{channel_id}/pins/{message_id}")
def unpin_message(channel_id: int, message_id: int,
                  db: Session = Depends(deps.get_db),
                  current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(id=channel_id).first()
    if channel:
        message = db.query(Message).filter_by(
            id=message_id).filter_by(channel_id=channel.id).first()
        if message:
            channel.pinned_messages.remove(message)
            db.commit()
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.put("/{channel_id}/recipients/{user_id}")
def add_recipient(channel_id: int, user_id: int,
                  db: Session = Depends(deps.get_db),
                  current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).filter_by(type=ChannelType.group_dm).first()
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
        id=channel_id).filter_by(type=ChannelType.group_dm).first()
    if channel:
        user: User = db.query(User).filter_by(id=user_id).first()
        if user:
            channel.recipients.remove(user)
            db.commit()
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.post("/{channel_id}/threads")
def create_thread(channel_id: int,
                  data: ThreadCreate,
                  db: Session = Depends(deps.get_db),
                  current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).first()
    if channel:
        type = ChannelType.guild_public_thread if data.type == "public" else ChannelType.guild_private_thread
        thread = Channel(type, channel.guild_id,
                         data.name, parent_id=channel.id)
        thread.thread_metadata = ThreadMetadata(
            thread.id, auto_archive_duration=data.auto_arrive_duration)
        db.add(thread)
        db.commit()
        return {**thread.serialize()}
    return Response(status_code=404)


@router.put("/{channel_id}/threads-members/@me")
def add_user_to_thread(channel_id: int,
                       db: Session = Depends(deps.get_db),
                       current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).first()
    if channel and channel.guild_id:
        channel.members.append(current_user)
        return Response(status_code=204)
    return Response(status_code=404)


@router.put("/{channel_id}/threads-members/{user_id}")
def add_user_to_thread(channel_id: int, user_id: int,
                       db: Session = Depends(deps.get_db),
                       current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).first()
    if channel:
        user: User = db.query(User).filter_by(id=user_id).first()
        if user:
            channel.members.append(user)
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.delete("/{channel_id}/threads-members/@me")
def leave_thread(channel_id: int,
                 db: Session = Depends(deps.get_db),
                 current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).first()
    if channel:
        channel.members.remove(current_user)
        return Response(status_code=204)
    return Response(status_code=404)


@router.delete("/{channel_id}/threads-members/{user_id}")
def remove_user_from_thread(channel_id: int, user_id: int,
                            db: Session = Depends(deps.get_db),
                            current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).first()
    if channel:
        user: User = db.query(User).filter_by(id=user_id).first()
        if user:
            channel.members.remove(user)
            return Response(status_code=204)
        return Response(status_code=404)
    return Response(status_code=404)


@router.get("/{channel_id}/threads-members")
def get_user_in_thread(channel_id: int,
                       db: Session = Depends(deps.get_db),
                       current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        id=channel_id).first()
    if channel:
        return {
            [member.serialize() for member in channel.members]
        }
    return Response(status_code=404)


@router.get("/{channel_id}/threads/active")
def get_active_threads(channel_id: int,
                       db: Session = Depends(deps.get_db),
                       current_user: User = Depends(deps.get_current_user)):
    channel: Channel = db.query(Channel).filter_by(
        parent_id=channel_id).first()
    if channel:
        return {
            [thread.serialize() for thread in channel]
        }
    return Response(status_code=404)
