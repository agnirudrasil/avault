from typing import Optional
from avault.api import deps
from sqlalchemy.orm import Session
from avault.models.invites import Invite
from avault.models.user import User
from fastapi import APIRouter, Depends


router = APIRouter()


@router.get('/{code}')
def get_invite(code: str,
               current_user: User = Depends(deps.get_current_user),
               db: Session = Depends(deps.get_db)):
    invite: Optional[Invite] = db.query(Invite).filter_by(code=code).first()
    if invite:
        return {**invite.serialize()}
    return {'error': 'Invite not found'}, 404
