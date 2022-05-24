from typing import Optional

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from api.api import deps
from api.core.events import Events, websocket_emitter
from api.core.permissions import Permissions
from api.models import User
from api.models.invites import Invite

router = APIRouter()


@router.get('/{code}')
def get_invite(code: str,
               current_user: User = Depends(deps.get_current_user),
               db: Session = Depends(deps.get_db)):
    invite: Optional[Invite] = db.query(Invite).filter_by(id=code).first()
    if invite:
        return {**invite.serialize(current_user.id)}
    raise HTTPException(detail='Invite not found', status_code=404)


@router.delete('/{code}')
async def delete_invite(code: str, invite: Invite = Depends(
    deps.InvitePerms(Permissions.MANAGE_CHANNELS)),
                        db: Session = Depends(deps.get_db)):
    db.delete(invite)
    db.commit()
    await websocket_emitter(channel_id=invite.channel_id, guild_id=invite.channel.guild_id, event=Events.INVITE_DELETE,
                            args={
                                'channel_id': str(invite.channel_id),
                                'guild': str(invite.channel.guild_id),
                                'code': code
                            }, db=db)
    return {'success': True}
