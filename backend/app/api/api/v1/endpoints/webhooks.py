import secrets
from typing import Optional

from fastapi import APIRouter, Depends, Response, HTTPException
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api import models
from api.api import deps
from api.core.events import websocket_emitter, Events
from api.core.permissions import Permissions
from api.models import Message
from api.models.webhooks import Webhook
from api.schemas.message import MessageCreate
from api.utils.validate_avatar import validate_avatar

router = APIRouter()


class PatchWebhook(BaseModel):
    name: Optional[str] = None
    avatar: Optional[str] = None


@router.get("/{webhook_id}", dependencies=[Depends(deps.get_current_user)])
def get_webhook(webhook_id: int,
                response: Response,
                db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        return webhook.serialize()
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.get("/{webhook_id}/{token}")
def get_webhook(webhook_id: int, token: str,
                response: Response,
                db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        token_correct = secrets.compare_digest(webhook.token, token)
        if token_correct:
            return webhook.serialize_token()
        response.status_code = 401
        return {"detail": "Token is incorrect"}
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.patch("/{webhook_id}")
async def update_webhook(webhook_id: int,
                         body: PatchWebhook,
                         response: Response,
                         user: models.User = Depends(deps.get_current_user),
                         db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        await deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS)(webhook.channel_id, user, db)
        if body.name:
            webhook.name = body.name
        if "avatar" in body.dict(exclude_unset=True):
            avatar = None
            if body.avatar:
                avatar = await validate_avatar(webhook.id, body.avatar)
            webhook.avatar = avatar
        db.commit()
        return webhook.serialize()
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.patch("/{webhook_id}/{token}")
async def update_webhook(webhook_id: int, token: str,
                         body: PatchWebhook,
                         response: Response,
                         db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        token_correct = secrets.compare_digest(webhook.token, token)
        if token_correct:
            if body.name:
                webhook.name = body.name
            if "avatar" in body.dict(exclude_unset=True):
                avatar = None
                if body.avatar:
                    avatar = await validate_avatar(webhook.id, body.avatar)
                webhook.avatar = avatar
            db.commit()
            webhook_json = webhook.serialize_token()
            return webhook_json
        response.status_code = 401
        return {"detail": "Token is incorrect"}
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.delete("/{webhook_id}", status_code=204,
               dependencies=[])
async def delete_webhook(webhook_id: int,
                         response: Response,
                         user: models.User = Depends(deps.get_current_user),
                         db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        await deps.ChannelPerms(Permissions.MANAGE_WEBHOOKS)(webhook.channel_id, user, db)
        db.delete(webhook)
        db.commit()
        return ""
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.delete("/{webhook_id}/{token}", status_code=204)
def delete_webhook(webhook_id: int, token: str,
                   response: Response,
                   db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        token_correct = secrets.compare_digest(webhook.token, token)
        if token_correct:
            db.delete(webhook)
            db.commit()
            return ""
        response.status_code = 401
        return {"detail": "Token is incorrect"}
    response.status_code = 404
    return {"detail": "Webhook not found"}


async def check_webhook(webhook_id: int, token: str, db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if not webhook:
        raise HTTPException(status_code=404, detail="Webhook not found")
    token_correct = secrets.compare_digest(webhook.token, token)
    if not token_correct:
        raise HTTPException(status_code=401, detail="Token is incorrect")
    return webhook


@router.post("/{webhook_id}/{token}", status_code=204)
async def execute_webhook(webhook_id: int, token: str,
                          webhook: Webhook = Depends(check_webhook),
                          body_stuff: tuple[MessageCreate, list] = Depends(deps.ExtractBody(MessageCreate)),
                          db: Session = Depends(deps.get_db)):
    body, attachments = body_stuff
    my_attachments = []

    if body and body.attachments:
        for attachment in body.attachments:
            my_attachments.append({**attachments[attachment.id], "description": attachment.description})
    else:
        my_attachments = attachments

    message = Message(content=body.content.strip(), channel_id=webhook.channel_id, embeds=body.embeds,
                      webhook_id=webhook.id, webhook_author=webhook.get_author(), author_id=None,
                      guild_id=webhook.guild_id, attachments=my_attachments)
    db.add(message)
    db.commit()

    await websocket_emitter(webhook.channel_id, webhook.guild_id, Events.MESSAGE_CREATE,
                            message.serialize(None, db), db=db)
    return ""
