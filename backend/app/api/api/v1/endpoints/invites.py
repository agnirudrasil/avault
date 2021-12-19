from typing import Optional

from fastapi import APIRouter, Depends, BackgroundTasks
from sqlalchemy.orm import Session

from api.api import deps
from api.core.events import Events, websocket_emitter
from api.core.permissions import Permissions
from api.models.invites import Invite

router = APIRouter()


@router.get('/{code}', dependencies=[Depends(deps.get_current_user)])
def get_invite(code: str,
               db: Session = Depends(deps.get_db)):
    invite: Optional[Invite] = db.query(Invite).filter_by(code=code).first()
    if invite:
        return {**invite.serialize()}
    return {'error': 'Invite not found'}, 404


@router.delete('/{code}')
def delete_invite(code: str, background_tasks: BackgroundTasks, invite: Invite = Depends(
    deps.InvitePerms(Permissions.MANAGE_CHANNELS)),
                  db: Session = Depends(deps.get_db)):
    db.delete(invite)
    db.commit()
    background_tasks.add_task(websocket_emitter, invite.channel_id, invite.channel.guild_id, Events.INVITE_DELETE, {
        'channel_id': invite.channel_id,
        'guild': invite.channel.guild_id,
        'code': code
    })
    return {'success': True}
