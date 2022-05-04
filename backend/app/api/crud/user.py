from typing import Any, Dict, Optional, Union

from sqlalchemy.orm import Session

from api.core.security import get_password_hash, verify_password
from api.crud.base import CRUDBase
from api.models.guilds import GuildMembers
from api.models.roles import Role
from api.models.user import User
from api.schemas.user import UserCreate, UserUpdate


class CRUDUser(CRUDBase[User, UserCreate, UserUpdate]):
    def get_by_email(self, db: Session, *, email: str) -> Optional[User]:
        return db.query(User).filter(User.email == email).first()

    def create(self, db: Session, *, obj_in: UserCreate) -> User:
        db_obj = User(
            db,
            email=obj_in.email,
            password=obj_in.password,
            username=obj_in.username,
        )
        db.add(db_obj)
        db.commit()
        db.refresh(db_obj)
        return db_obj

    @staticmethod
    def get_permissions(db: Session, *,
                        user_id: int,
                        guild_id: int,
                        channel_id: Optional[int] = None) -> Optional[Union[int, str]]:
        guild_member: GuildMembers = db.query(GuildMembers).filter_by(
            user_id=user_id, guild_id=guild_id).first()
        if not guild_member:
            return None
        if guild_member.guild.is_owner(user_id):
            return 'ALL'

        role_everyone: Role = db.query(Role).filter_by(id=guild_id).first()
        permissions = role_everyone.permissions

        roles = guild_member.roles

        for role in roles:
            permissions |= role.permissions

        if permissions & 0x8:
            return 'ALL'

        return permissions

    def update(
            self, db: Session, *, db_obj: User, obj_in: Union[UserUpdate, Dict[str, Any]]
    ) -> User:
        if isinstance(obj_in, dict):
            update_data = obj_in
        else:
            update_data = obj_in.dict(exclude_unset=True)
        if update_data["password"]:
            hashed_password = get_password_hash(update_data["password"])
            del update_data["password"]
            update_data["hashed_password"] = hashed_password
        return super().update(db, db_obj=db_obj, obj_in=update_data)

    def authenticate(self, db: Session, *, email: str, password: str) -> Optional[User]:
        my_user = self.get_by_email(db, email=email)
        if not my_user:
            return None
        if my_user.bot:
            return None
        if not verify_password(password, my_user.password):
            return None
        return my_user


user = CRUDUser(User)
