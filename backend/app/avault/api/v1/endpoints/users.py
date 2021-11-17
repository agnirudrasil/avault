from avault.api import deps
from avault.models.user import User
from avault.crud import user
from avault.models.guilds import GuildMembers
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

router = APIRouter()


@router.get("/@me")
def get_me(db: Session = Depends(deps.get_db),
           user: User = Depends(deps.get_current_user)):
    return user.serialize()


@router.get('/{user_id}')
def get_user(user_id: int, db: Session = Depends(deps.get_db)):
    return user.get(db, user_id).serialize()


@router.get('/@me/guilds')
def get_guilds(db: Session = Depends(deps.get_db),
               current_user: User = Depends(deps.get_current_user)):
    user = db.query(User).filter_by(id=current_user.id).first()
    if user:
        guilds = user.guilds
        if guilds:
            return {'guilds': [guild.guild.preview() for guild in guilds]}
        return {'guilds': []}
    return {'guilds': []}, 401


@router.delete('/@me/guilds/{guild_id}')
def leave_guild(guild_id: int, current_user: User = Depends(deps.get_current_user),
                db: Session = Depends(deps.get_db)):
    guild_memeber = db.query(GuildMembers).filter_by(
        user_id=current_user.id, guild_id=guild_id).first()
    if guild_memeber:
        db.session.delete(guild_memeber)
        db.session.commit()
        return '', 204
    return {'success': False}, 404
