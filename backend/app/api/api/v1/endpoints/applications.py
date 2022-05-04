import secrets
from datetime import datetime
from typing import Optional

from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api import models
from api.api import deps
from api.core import security

router = APIRouter()


class ApplicationCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class ApplicationEdit(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    redirect_uris: Optional[list[str]] = None


def generate_secret_token():
    secret_token = secrets.token_urlsafe(32)
    hashed_token = security.get_password_hash(secret_token)
    return [hashed_token, secret_token]


@router.get("/")
async def get_applications(current_user: models.User = Depends(deps.get_current_user),
                           db: Session = Depends(deps.get_db)):
    applications: list[models.Application] = db.query(models.Application).filter_by(owner_id=current_user.id).all()

    return [app.serialize() for app in applications]


@router.post("/")
async def create_application(body: ApplicationCreate, current_user: models.User = Depends(deps.get_current_user),
                             db: Session = Depends(deps.get_db)):
    hashed_token, secret_token = generate_secret_token()
    application = models.Application(name=body.name, secret=hashed_token, owner_id=current_user.id,
                                     description=body.description)
    db.add(application)
    db.commit()
    return application.serialize()


@router.get("/{application_id}")
async def get_application(application_id: int, response: Response,
                          current_user: models.User = Depends(deps.get_current_user),
                          db: Session = Depends(deps.get_db)):
    application = db.query(models.Application).filter_by(id=application_id).filter_by(owner_id=current_user.id).first()
    if application:
        return application.serialize()
    response.status_code = 404
    return {"detail": "Not Found"}


@router.patch("/{application_id}")
async def edit_application(application_id: int, body: ApplicationEdit, response: Response,
                           current_user: models.User = Depends(deps.get_current_user),
                           db: Session = Depends(deps.get_db)):
    application: models.Application = db.query(models.Application).filter_by(id=application_id).filter_by(
        owner_id=current_user.id).first()
    if not application:
        response.status_code = 404
        return {"detail": "Not Found"}
    if body.name:
        application.name = body.name
    application.description = body.description
    application.redirect_uris = body.redirect_uris
    db.commit()
    return application.serialize()


@router.post("/{application_id}/reset")
async def reset_token(application_id: int, response: Response,
                      current_user: models.User = Depends(deps.get_current_user),
                      db: Session = Depends(deps.get_db)):
    application: models.Application = db.query(models.Application).filter_by(id=application_id).filter_by(
        owner_id=current_user.id).first()
    if not application:
        response.status_code = 404
        return {"detail": "Not Found"}
    hashed_token, secret_token = generate_secret_token()
    application.secret = hashed_token
    db.commit()
    return {
        "token": secret_token
    }


@router.delete("/{application_id}", status_code=204)
async def delete_application(application_id: int,
                             current_user: models.User = Depends(deps.get_current_user),
                             db: Session = Depends(deps.get_db)):
    db.query(models.Application).filter_by(id=application_id).filter_by(owner_id=current_user.id).delete()
    db.commit()
    return


@router.post("/{application_id}/bot")
async def create_bot(application_id: int, response: Response,
                     current_user: models.User = Depends(deps.get_current_user),
                     db: Session = Depends(deps.get_db)):
    application: models.Application = db.query(models.Application).filter_by(id=application_id).filter_by(
        owner_id=current_user.id).first()
    if application.bot:
        response.status_code = 409
        return {"detail": "Bot already exists"}
    bot = models.User(db, username=application.name, bot=True)
    application.bot = bot
    db.commit()
    return application.serialize()


@router.post("/{application_id}/bot/reset")
async def reset_bot_token(application_id: int, response: Response,
                          current_user: models.User = Depends(deps.get_current_user),
                          db: Session = Depends(deps.get_db)):
    application: models.Application = db.query(models.Application).filter_by(id=application_id).filter_by(
        owner_id=current_user.id).first()
    if not application:
        response.status_code = 404
        return {"detail": "Not Found"}
    if not application.bot:
        response.status_code = 404
        return {"detail": "Bot not found"}
    iat = datetime.utcnow()
    token = security.create_access_token(db, application.bot.id, expires_delta="na", iat=iat)

    return {
        "token": token
    }
