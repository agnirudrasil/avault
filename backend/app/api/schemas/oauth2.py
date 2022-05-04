from typing import Optional

from fastapi import Form
from pydantic import BaseModel

OAUTH2_SCOPES = {
    "applications.commands": "allows use of commands in a guild",
    "bot": "for oauth2 bots this puts the bot in the user's selected guild by default",
    "email": "allows /users/@me to return an email",
    "identify": "allows /users/@me to return a user object without an email",
    "gdm.join": "allows your app to join users to a group dm",
    "guilds": "allows /users/@me/guilds to return basic information about all of a user's guilds",
    "guilds.join": "allows your app to join users to a guild",
    "guilds.members.read": "allows /users/@me/guilds/{guild.id}/member to return a user's member information in a "
                           "guild"
}


class OAuth2Params(BaseModel):
    scope: str
    client_id: int
    user_id: int


class OAuth2TokenBody:
    def __init__(self,
                 client_id: int = Form(...),
                 client_secret: str = Form(...),
                 code: Optional[str] = Form(...),
                 refresh_token: Optional[str] = Form(None),
                 grant_type: str = Form(..., regex="refresh_token|authorization_code"),
                 redirect_uri: Optional[str] = Form(None)):
        self.client_id = client_id
        self.client_secret = client_secret
        self.code = code
        self.grant_type = grant_type
        self.redirect_uri = redirect_uri
        self.refresh_token = refresh_token


class AuthorizeBody(BaseModel):
    authorized: bool
    guild_id: Optional[int] = None
    permissions: Optional[int] = None
