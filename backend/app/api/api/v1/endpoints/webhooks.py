import secrets
from typing import Any, Optional
from api.api import deps
from api.models.user import User
from api.models.webhooks import Webhook
from pydantic import BaseModel
from sqlalchemy.orm import Session
from fastapi import APIRouter, Depends, Response

router = APIRouter()


class PatchWebhook(BaseModel):
    name: str
    avatar: Optional[Any] = ""
    channel_id: int


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
            webhook_json = webhook.serialize()
            del webhook_json["user"]
            return webhook_json
        response.status_code = 401
        return {"detail": "Token is incorrect"}
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.patch("/{webhook_id}", dependencies=[Depends(deps.get_current_user)])
def update_webhook(webhook_id: int,
                   body: PatchWebhook,
                   response: Response,
                   db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        webhook.name = body.name
        if body.avatar:
            webhook.avatar = body.avatar
        webhook.channel_id = body.channel_id
        db.commit()
        return webhook.serialize()
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.patch("/{webhook_id}/{token}")
def update_webhook(webhook_id: int, token: str,
                   body: PatchWebhook,
                   response: Response,
                   db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
        token_correct = secrets.compare_digest(webhook.token, token)
        if token_correct:
            webhook.name = body.name
            if body.avatar:
                webhook.avatar = body.avatar
            db.commit()
            webhook_json = webhook.serialize()
            del webhook_json["user"]
            return webhook_json
        response.status_code = 401
        return {"detail": "Token is incorrect"}
    response.status_code = 404
    return {"detail": "Webhook not found"}


@router.delete("/{webhook_id}", status_code=204, dependencies=[Depends(deps.get_current_user)])
def delete_webhook(webhook_id: int,
                   response: Response,
                   db: Session = Depends(deps.get_db)):
    webhook = db.query(Webhook).filter_by(id=webhook_id).first()
    if webhook:
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


@router.post("/{webhook_id}/{token}", status_code=201)
def execute_webhook():
    pass
