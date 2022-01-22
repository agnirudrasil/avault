import secrets
from typing import Optional

from cryptography.fernet import Fernet
from fastapi import APIRouter, Depends, Response
from pydantic import BaseModel
from sqlalchemy.orm import Session

from api import models
from api.api import deps
from api.core.config import settings

router = APIRouter()


class ApplicationCreate(BaseModel):
    name: str
    description: Optional[str] = ""


class ApplicationEdit(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None
    redirect_uris: Optional[list[str]] = None


@router.get("/")
async def get_applications(current_user: models.User = Depends(deps.get_current_user),
                           db: Session = Depends(deps.get_db)):
    applications: list[models.Application] = db.query(models.Application).filter_by(owner_id=current_user.id).all()

    return [app.serialize() for app in applications]


@router.post("/")
async def create_application(body: ApplicationCreate, current_user: models.User = Depends(deps.get_current_user),
                             db: Session = Depends(deps.get_db)):
    secret_token = secrets.token_urlsafe(32)
    cipher_suite = Fernet(settings.FERNET_KEY)
    encoded_token = cipher_suite.encrypt(secret_token.encode('utf-8'))
    application = models.Application(name=body.name, secret=encoded_token.decode('utf-8'), owner_id=current_user.id,
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
    application = db.query(models.Application).filter_by(id=application_id).filter_by(owner_id=current_user.id).first()
    if not application:
        response.status_code = 404
        return {"detail": "Not Found"}
    if body.name:
        application.name = body.name
    if body.description is not None:
        application.description = body.description
    if body.redirect_uris is not None:
        application.redirect_uris = body.redirect_uris
    db.commit()
    return application.serialize()


@router.post("/{application_id}/reset")
async def reset_token(application_id: int, response: Response,
                      current_user: models.User = Depends(deps.get_current_user),
                      db: Session = Depends(deps.get_db)):
    application = db.query(models.Application).filter_by(id=application_id).filter_by(owner_id=current_user.id).first()
    if not application:
        response.status_code = 404
        return {"detail": "Not Found"}
    secret_token = secrets.token_urlsafe(32)
    cipher_suite = Fernet(settings.FERNET_KEY)
    encoded_token = cipher_suite.encrypt(secret_token.encode('utf-8'))
    application.secret = encoded_token.decode('utf-8')
    db.commit()
    return application.serialize()


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
    application = db.query(models.Application).filter_by(id=application_id).filter_by(owner_id=current_user.id).first()
    if application.bot:
        response.status_code = 409
        return {"detail": "Bot already exists"}

    
