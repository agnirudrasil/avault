from fastapi import APIRouter, Depends, Response
from sqlalchemy.exc import IntegrityError
from sqlalchemy.orm import Session

from api.api import deps
from api.api.v1.endpoints import auth, channels, gifs, users, guilds, invites, default, oauth2, webhooks
from api.core import emitter
from api.core.events import Events, websocket_emitter
from api.models.guilds import Guild, GuildMembers
from api.models.invites import Invite
from api.models.user import User

api_router = APIRouter()


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
        # if invite.max_age != 0 and (invite.created_at + timedelta(seconds=invite.max_age)) >= datetime.now():
        #     db.delete(invite)
        #     db.commit()
        #     response.status_code = 403
        #     background_task.add_task(websocket_emitter, None, invite.channel.guild_id, Events.INVITE_DELETE,
        #                              {'guild_id': invite.channel.guild_id, 'code': invite.id,
        #                               'channel_id': invite.channel_id})
        #     return {"message": "Invite has expired"}
        if guild_id:
            guild_member = db.query(GuildMembers).filter_by(guild_id=guild_id).filter_by(
                user_id=current_user.id).first()
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
                                    {"guild": guild.serialize(), "member": guild_member.serialize()},
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
api_router.include_router(oauth2.router, prefix='/oauth2', tags=["oauth2"])
