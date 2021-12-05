from typing import Optional
from api.api import deps
from api.core.permissions import Permissions
from sqlalchemy.orm import Session
from api.models.invites import Invite
from api.models.user import User
from fastapi import APIRouter, Depends


router = APIRouter()


@router.get('/{code}')
def get_invite(code: str,
               db: Session = Depends(deps.get_db)):
    invite: Optional[Invite] = db.query(Invite).filter_by(code=code).first()
    if invite:
        return {**invite.serialize()}
    return {'error': 'Invite not found'}, 404


@router.delete('/{code}')
def delete_invite(code: str,
                  invite: Invite = Depends(
                      deps.InvitePerms(Permissions.MANAGE_CHANNELS)),
                  db: Session = Depends(deps.get_db)):
    db.delete(invite)
    db.commit()
    return {'success': True}
