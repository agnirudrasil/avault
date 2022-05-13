import json
import secrets
import time
from typing import Optional

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from starlette import status

from api import models
from api.api import deps
from api.core import redis, settings, security, permissions
from api.schemas.oauth2 import OAUTH2_SCOPES, AuthorizeBody, OAuth2TokenBody, OAuth2Params

router = APIRouter()


@router.post("/authorize")
async def authorize(
        client_id: int, scope: str, body: AuthorizeBody, redirect_uri: Optional[str] = None,
        state: Optional[str] = None,
        user: models.User = Depends(deps.get_current_user),
        db: Session = Depends(deps.get_db)
):
    application: models.Application = db.query(models.Application).filter(models.Application.id == client_id).first()

    if not application:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if redirect_uri is not None and redirect_uri not in application.redirect_uris:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth2 redirect_uri")

    require_code = True

    scopes = set(scope.split(" "))

    if not scopes.issubset(set(OAUTH2_SCOPES.keys())):
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth2 scope")
    if scopes.issubset({"bot", "applications.commands"}):
        require_code = False

    if not body.authorized:
        if require_code:
            location = f"{redirect_uri}/?error=access_denied&error_description=The+resource+owner+or+authorization" \
                       f"+server+denied+the+request "
        else:
            location = f"{redirect_uri or 'http://localhost:3000/oauth2/error/'}?error=access_denied",
    elif require_code:
        if not redirect_uri:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth2 redirect_uri")
        code = secrets.token_urlsafe(32)

        await redis.set(f"oauth2:{code}", json.dumps({
            "client_id": client_id,
            "scope": scope,
            "user_id": user.id
        }), ex=60)

        location = f"{redirect_uri}/?code={code}{'&state=' + state if state is not None else ''}"
    else:
        guild_member: models.GuildMembers = db.query(models.GuildMembers).filter_by(user_id=user.id).filter_by(
            guild_id=body.guild_id).first()
        if guild_member and \
                (guild_member.is_owner or
                 guild_member.permissions &
                 permissions.Permissions.ADMINISTRATOR == permissions.Permissions.ADMINISTRATOR or
                 guild_member.permissions &
                 permissions.Permissions.MANAGE_GUILD == permissions.Permissions.MANAGE_GUILD):
            await application.add_bot_to_guild(db, guild_member.guild, body.permissions)
            location = f"{redirect_uri or 'http://localhost:3000/oauth2/authorized'}",
        else:
            location = f"{redirect_uri or 'http://localhost:3000/oauth2/error/'}?error=access_denied"

    return {"location": location}


@router.get("/authorize")
async def get_authorize(client_id: int, scope: str, redirect_uri: Optional[str] = Query(None),
                        prompt: Optional[str] = Query(None, regex="none|consent"),
                        user: models.User = Depends(deps.get_current_user),
                        db: Session = Depends(deps.get_db)):
    if user.bot:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is a bot")

    application: models.Application = db.query(models.Application).filter(models.Application.id == client_id).first()
    if application is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Application not found")
    if redirect_uri is not None and redirect_uri not in application.redirect_uris:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth2 redirect_uri")

    scopes = set(scope.split(" "))

    serialized_application = application.serialize()

    del serialized_application["owner"]

    response = {
        "application": serialized_application,
        "authorized": False,
        "redirect_uri": redirect_uri,
        "user": user.serialize(),
    }

    is_guild_required = False

    for scope in scopes:
        if scope not in OAUTH2_SCOPES.keys():
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth2 scope")
        elif scope == "bot" or scope == "application.commands":
            is_guild_required = True

    if is_guild_required:
        response["guilds"] = [{**guild.guild.preview(),
                               "permissions": str(guild.permissions if not guild.is_owner else guild.permissions | 8)}
                              for guild in user.guilds]

    if prompt and prompt == "none":
        existing_token: models.Token = db.query(models.Token).filter_by(user_id=user.id).filter_by(
            application_id=client_id).first()
        if existing_token and not existing_token.is_expired():
            existing_scopes = set(existing_token.scope.split(" "))
            if existing_scopes == scopes:
                response["authorized"] = True

    return response


@router.delete("/tokens/{application_id}", status_code=204)
async def delete_token(application_id: int, user: models.User = Depends(deps.get_current_user),
                       db: Session = Depends(deps.get_db)):
    if user.bot:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="User is a bot")

    token: models.Token = db.query(models.Token).filter_by(user_id=user.id).filter_by(
        application_id=application_id).first()
    if token is None:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Token not found")

    db.delete(token)
    db.commit()
    return


@router.get("/tokens")
async def get_tokens(user: models.User = Depends(deps.get_current_user), db: Session = Depends(deps.get_db)):
    tokens = db.query(models.Token).filter_by(user_id=user.id).all()
    return [token.user_serialize() for token in tokens]


@router.post("/token", dependencies=[Depends(deps.ensure_header)])
async def create_token(body: OAuth2TokenBody = Depends(), db: Session = Depends(deps.get_db)):
    match body.grant_type:
        case "authorization_code":
            if not body.code:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid OAuth2 code")

            params: Optional[bytes] = await redis.get(f"oauth2:{body.code}")

            if not params:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Invalid OAuth2 code")

            oauth2_params = OAuth2Params(**json.loads(params))

            if oauth2_params.client_id != body.client_id:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

            application: models.Application = db.query(models.Application).filter(
                models.Application.id == oauth2_params.client_id).first()

            if application is None:
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

            if not security.verify_password(body.client_secret, application.secret):
                raise HTTPException(status_code=status.HTTP_403_FORBIDDEN)

            scopes_set = set(oauth2_params.scope.split(" "))

            if {"email"}.issubset(scopes_set) and "indentify" not in scopes_set:
                scopes_set.add("identify")
                oauth2_params.scope = " ".join(scopes_set)

            existing_access_token: models.Token = db.query(models.Token).filter_by(
                user_id=oauth2_params.user_id).filter_by(application_id=oauth2_params.client_id).first()

            if existing_access_token and not existing_access_token.is_expired() and existing_access_token.is_scope_same(
                    oauth2_params.scope):
                access_token = existing_access_token
            else:
                if existing_access_token:
                    db.delete(existing_access_token)
                access_token = models.Token(user_id=oauth2_params.user_id, application_id=application.id,
                                            access_token=secrets.token_urlsafe(32),
                                            refresh_token=secrets.token_urlsafe(32),
                                            issued_at=int(time.time()), expires_in=settings.OAUTH2_TOKEN_EXPIRES_IN,
                                            scope=oauth2_params.scope)

                db.add(access_token)
                db.commit()

            await redis.delete(f"oauth2:{body.code}")

            return {
                "access_token": access_token.access_token,
                "token_type": "Bearer",
                "expires_in": access_token.expires_in,
                "refresh_token": access_token.refresh_token,
                "scope": access_token.scope
            }

        case "refresh_token":
            pass

    return


@router.post("/token/revoke")
async def revoke(client_id: int, scopes: str, redirect_uri: Optional[str], body: AuthorizeBody):
    pass
