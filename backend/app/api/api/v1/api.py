from datetime import datetime, timedelta
from api.api import deps
from api.models.invites import Invite
from api.models.guilds import Guild, GuildMembers
from api.models.user import User
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from fastapi import APIRouter, Depends

from api.api.v1.endpoints import auth, channels, gifs, users, guilds, invites, default

api_router = APIRouter()


@api_router.get('/join/{code}')
def join_guild(code: str,
               current_user: User = Depends(deps.get_current_user),
               db: Session = Depends(deps.get_db)):
    invite: Invite = db.query(Invite).filter_by(id=code).first()
    if invite:
        guild_id = invite.channel.guild_id
        if invite.max_uses != 0 and invite.max_uses == invite.count:
            db.session.delete(invite)
            db.session.commit()
            return {"message": "Invite has been used"}, 403
        if invite.max_age != 0 and (invite.created_at + timedelta(seconds=invite.max_age)) >= datetime.now():
            # db.session.delete(invite)
            # db.session.commit()
            return {"message": "Invite has expired"}, 403
        if guild_id:
            try:
                guild: Guild = Guild.query.filter_by(id=guild_id).first()
                user = User.query.filter_by(id=current_user.id).first()
                guild_member = GuildMembers()
                guild_member.member = user
                guild_member.guild = guild
                guild.members.append(guild_member)
                db.session.add(guild)
                invite.count += 1
                db.session.add(invite)
                db.session.commit()
                return {"message": "Joined guild"}, 200
            except IntegrityError:
                return {"message": "Already in guild"}, 403
        return "Sucess"
    return "", 404


api_router.include_router(default.router, tags=["default"])
api_router.include_router(auth.router, prefix='/auth', tags=["login"])
api_router.include_router(gifs.router, prefix='/gifs', tags=["gifs"])
api_router.include_router(
    channels.router, prefix="/channels", tags=["channels"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(guilds.router, prefix="/guilds", tags=["guilds"])
api_router.include_router(invites.router, prefix='/invites', tags=["invites"])
api_router.include_router(
    invites.router, prefix='/webhooks', tags=["webhooks"])
