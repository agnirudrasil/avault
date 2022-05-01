import base64
import io
from typing import List

import boto3
import requests
from fastapi import APIRouter, Depends, Response, Request, Body, File, UploadFile
from sqlalchemy.orm import Session
from starlette.responses import StreamingResponse

from api.api import deps
from api.api.v1.endpoints import auth, channels, gifs, users, guilds, invites, default, oauth2, webhooks, applications
from api.core import emitter
from api.core.events import Events, websocket_emitter
from api.models.guilds import Guild, GuildMembers, GuildBans
from api.models.invites import Invite
from api.models.user import User

api_router = APIRouter()


@api_router.post("/base64")
async def upload_base64(img: str = Body(...)):
    s3 = boto3.resource('s3',
                        endpoint_url="https://nyc3.digitaloceanspaces.com",
                        region_name="nyc3",
                        aws_access_key_id="3SPU74SXTFBWHTWDEFSZ",
                        aws_secret_access_key="Ts+g94ci+zeDoKqF0i1pz4UXGNa3Q+5UeM6BAsPI6o8")
    obj = s3.Object("avault", "attachments/hello.jpeg")
    obj.put(Body=base64.b64decode(img),
            ACL="public-read", ContentType="image/jpeg")
    return "Success"


@api_router.post('/form')
async def form(request: Request, files: List[UploadFile] = File(...)):
    session = boto3.session.Session()
    s3_client = session.client('s3',
                               endpoint_url="https://nyc3.digitaloceanspaces.com",
                               region_name="nyc3",
                               aws_access_key_id="3SPU74SXTFBWHTWDEFSZ",
                               aws_secret_access_key="Ts+g94ci+zeDoKqF0i1pz4UXGNa3Q+5UeM6BAsPI6o8")
    for file in files:
        print(file.filename)
        file.file.seek(0, 2)
        print(file.file.tell())
        file.file.seek(0)
        s3_client.upload_fileobj(file.file, "avault", "attachments/" + file.filename,
                                 ExtraArgs={'ACL': "public-read", "ContentType": file.content_type})
    return Response(status_code=200)


@api_router.get("/proxy")
async def proxy(path: str, response: Response):
    content = requests.get(path)
    return StreamingResponse(io.BytesIO(content.content), media_type=content.headers["content-type"])


@api_router.post('/join/{code}')
async def join_guild(code: str,
                     response: Response,
                     current_user: User = Depends(deps.get_current_user),
                     db: Session = Depends(deps.get_db)):
    invite: Invite = db.query(Invite).filter_by(id=code).first()
    if invite:
        guild_id = invite.channel.guild_id
        if invite.max_uses != 0 and invite.max_uses == invite.count:
            db.delete(invite)
            db.commit()
            response.status_code = 403
            return {"message": "Invite has been used"}
        if guild_id:
            guild_member = db.query(GuildMembers).filter_by(guild_id=guild_id).filter_by(
                user_id=current_user.id).first()
            guild_ban = db.query(GuildBans).filter_by(
                guild_id=guild_id).filter_by(user_id=current_user.id).first()
            if guild_ban:
                response.status_code = 403
                return {"error": "You are banned from this server"}
            if guild_member:
                response.status_code = 403
                return {"id": str(guild_id)}
            guild: Guild = db.query(Guild).filter_by(id=guild_id).first()
            user = db.query(User).filter_by(id=current_user.id).first()
            guild_member = GuildMembers()
            guild_member.member = user
            guild_member.guild = guild
            guild.members.append(guild_member)
            db.add(guild)
            invite.count += 1
            db.add(invite)
            db.commit()
            response.status_code = 200
            await emitter.in_room(str(current_user.id)).sockets_join(str(guild_id))
            await websocket_emitter(None, invite.channel.guild_id, Events.GUILD_MEMBER_ADD,
                                    guild_member.serialize())
            await websocket_emitter(None, invite.channel.guild_id, Events.GUILD_CREATE,
                                    {"guild": guild.serialize(
                                    ), "member": guild_member.serialize()},
                                    current_user.id)
            return guild.serialize()
        return "Success"
    response.status_code = 404
    return ""


api_router.include_router(default.router, tags=["default"])
api_router.include_router(auth.router, prefix='/auth', tags=["login"])
api_router.include_router(gifs.router, prefix='/gifs', tags=["gifs"])
api_router.include_router(
    channels.router, prefix="/channels", tags=["channels"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(guilds.router, prefix="/guilds", tags=["guilds"])
api_router.include_router(invites.router, prefix='/invites', tags=["invites"])
api_router.include_router(
    webhooks.router, prefix='/webhooks', tags=["webhooks"])
api_router.include_router(applications.router, prefix='/applications', tags=["applications"])
api_router.include_router(oauth2.router, prefix='/oauth2', tags=["oauth2"])
