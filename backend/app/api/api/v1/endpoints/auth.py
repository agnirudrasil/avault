from datetime import timedelta, datetime
from typing import Any

from fastapi import APIRouter, Cookie, Form, Depends, Response, HTTPException, status
from jose import jwt
from pydantic import EmailStr, ValidationError
from sqlalchemy.orm import Session

from api import crud, models, schemas
from api.api import deps
from api.core import security
from api.core.config import settings

router = APIRouter()


@router.post('/register')
def register(
        response: Response,
        email: EmailStr = Form(...),
        username: str = Form(..., min_length=3, max_length=80),
        password: str = Form(..., min_length=8, max_length=25,
                             regex='^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{8,}$'),
        db: Session = Depends(deps.get_db)):
    email = email.lower().strip()
    username = username.strip()
    user = db.query(models.User).filter_by(email=email).first()
    if user:
        response.status_code = 409
        return {"error": "User Already Exists"}
    user = models.User(db, username=username, password=password, email=email)
    db.add(user)
    db.commit()
    response.status_code = 201
    return {'success': True}


@router.post("/login")
def login(
        form_data: schemas.Login,
        response: Response,
        db: Session = Depends(deps.get_db),
) -> Any:
    """
    OAuth2 compatible token login, get an access token for future requests
    """
    user = crud.user.authenticate(
        db, email=form_data.email, password=form_data.password, code=form_data.code
    )

    if user.mfa_enabled:
        if not form_data.code:
            return {
                "mfa": True,
            }
        mfa = db.query(models.MFA).filter_by(user_id=user.id).first()
        if not security.verify_otp(form_data.code, mfa):
            raise HTTPException(status_code=401, detail="Invalid MFA Code")

    access_token_expires = timedelta(
        minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    refresh_token_expires = timedelta(
        minutes=settings.REFRESH_TOKEN_EXPIRE_MINUTES)
    iat = datetime.utcnow()
    return {
        "access_token": security.create_access_token(db, user.id, expires_delta=access_token_expires, iat=iat,
                                                     mfa_enabled=user.mfa_enabled),
        "refresh_token": security.create_refresh_token(db, response, user.id, iat=iat,
                                                       expires_delta=refresh_token_expires,
                                                       mfa_enabled=user.mfa_enabled),
    }


@router.post("/logout", status_code=204)
def logout(response: Response, user: models.User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    user.last_login = None
    response.delete_cookie(key="jid")
    db.commit()
    return


@router.post("/refresh-token", response_model=schemas.Token)
def refresh_token(response: Response, jid: str = Cookie(None), db: Session = Depends(deps.get_db)):
    """
    OAuth2 compatible token refresh, get an access token for future requests
    """
    try:
        payload = jwt.decode(
            jid if jid is not None else "", settings.SECRET_KEY, algorithms=[security.ALGORITHM]
        )
        token_data = schemas.TokenPayload(**payload)
    except (jwt.JWTError, ValidationError) as e:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    user: models.User = db.query(models.User).filter_by(
        id=token_data.sub).first()

    if not user:
        response.delete_cookie(key="jid")
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Could not validate credentials",
        )

    if user.last_login is None:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token has expired",
        )
    if user.mfa_enabled != token_data.mfa:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token has expired",
        )
    if user.last_login >= datetime.fromtimestamp(token_data.iat):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Token has expired",
        )

    iat = datetime.utcnow()

    return {
        "access_token": security.create_access_token(db, token_data.sub, iat=iat, mfa_enabled=user.mfa_enabled),
        "refresh_token": security.create_refresh_token(db, response, token_data.sub, iat=iat,
                                                       mfa_enabled=user.mfa_enabled),
    }
