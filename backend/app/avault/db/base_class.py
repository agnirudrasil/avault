from importlib import metadata
from typing import Any
import sqlalchemy

from sqlalchemy.ext.declarative import as_declarative, declared_attr


@as_declarative()
class Base:
    id: Any
    __tablename__: str
    # Generate __tablename__ automatically
    metadata = sqlalchemy.MetaData()

    @declared_attr
    def __tablename__(cls) -> str:
        return cls.__tablename__.lower()
