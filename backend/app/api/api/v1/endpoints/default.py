from api.api import deps
from api.models.permissions import Permission
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session


router = APIRouter()


@router.get("/permissions")
def get_permissions(db: Session = Depends(deps.get_db)):
    permissions = db.query(Permission).all()
    return [permission.serialize() for permission in permissions]
