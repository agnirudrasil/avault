from datetime import timedelta
from typing import Any

from fastapi import APIRouter, Form, Depends, HTTPException
from pydantic import EmailStr
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from avault import crud, models, schemas
from avault.api import deps
from avault.core import security
from avault.core.config import settings
from avault.core.security import get_password_hash

router = APIRouter()


@router.post('/register')
def register(email: EmailStr = Form(''),
             username: str = Form('', min_length=3, max_length=80),
             password: str = Form('', min_length=6, max_lenght=25,
                                  regex='^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$'),
             db: Session = Depends(deps.get_db)):
    email = email.lower().strip()
    username = username.lower().strip()
    user = models.User.query.filter_by(email=email.lower()).first()
    if (user):
        return {'error': 'User already exists'}, 409
    user = models.User(username, password, email, db)
    db.add(user)
    db.commit()
    return {'success': True}, 201


@router.post("/login", response_model=schemas.Token)
def login_access_token(
    db: Session = Depends(deps.get_db), form_data: OAuth2PasswordRequestForm = Depends()
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, email=form_data.username, password=form_data.password
    )
    if not user:
        raise HTTPException(
            status_code=400, detail="Incorrect email or password")
    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    return {
        "access_token": security.create_access_token(
            user.id, expires_delta=access_token_expires
        ),
        "token_type": "bearer",
    }


@router.post("/login/test-token", response_model=schemas.User)
def test_token(current_user: models.User = Depends(deps.get_current_user)) -> Any:
    """
    Test access token
    """
    return current_user
