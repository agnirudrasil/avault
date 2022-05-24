import os
from typing import Any, Dict, List, Optional, Union

from pydantic import AnyHttpUrl, BaseSettings, HttpUrl, PostgresDsn, validator


class Settings(BaseSettings):
    API_V1_STR: str = "/api/v1"
    SECRET_KEY: str = 'qLuRm_BFVNJ1AZZWDUd8xCiso2wzTYJz82qCKDgiAlU'
    # 60 minutes * 24 hours * 8 days = 8 days
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7
    OAUTH2_TOKEN_EXPIRES_IN: int = 60 * 60 * 24 * 7
    REFRESH_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 30
    SERVER_NAME: str = "localhost:5000"
    SERVER_HOST: AnyHttpUrl = os.getenv("HOST", "https://avault.agnirudra.me")
    RABBITMQ_HOST: str = os.getenv("RABBITMQ_HOST", "127.0.0.1")
    REDIS_HOST: str = os.getenv("REDIS_HOST", "127.0.0.1")
    BACKEND_CORS_ORIGINS: List[AnyHttpUrl] = ['http://localhost:3000', "http://127.0.0.1:5500", 'http://localhost:5000']
    TENOR_API_KEY: str = os.getenv("TENOR_API_KEY")
    AWS_ACCESS_KEY_ID: str = os.getenv("AWS_ACCESS_KEY_ID")
    AWS_SECRET_ACCESS_KEY: str = os.getenv("AWS_SECRET_ACCESS_KEY")
    TENOR_BASE_URL: str = "https://g.tenor.com/v1"
    FERNET_KEY: str = os.getenv("FERNET_KEY", "")
    CDN_URL: str = os.getenv("CDN_URL", "https://cdn.avault.agnirudra.me")
    FRONTEND_URL: str = os.getenv("FRONTEND_URL", "http://localhost:3000")

    @validator("BACKEND_CORS_ORIGINS", pre=True)
    def assemble_cors_origins(cls, v: Union[str, List[str]]) -> Union[List[str], str]:
        if isinstance(v, str) and not v.startswith("["):
            return [i.strip() for i in v.split(",")]
        elif isinstance(v, (list, str)):
            return v
        raise ValueError(v)

    PROJECT_NAME: str = "api"
    SENTRY_DSN: Optional[HttpUrl] = None

    @validator("SENTRY_DSN", pre=True)
    def sentry_dsn_can_be_blank(cls, v: str) -> Optional[str]:
        if v and len(v) == 0:
            return None
        return v

    POSTGRES_SERVER: str = f"{os.getenv('POSTGRES_HOST', 'localhost')}:5432"
    POSTGRES_USER: str = "postgres"
    POSTGRES_PASSWORD: str = "postgres"
    POSTGRES_DB: str = "avault"
    SQLALCHEMY_DATABASE_URI: Optional[PostgresDsn] = None

    @validator("SQLALCHEMY_DATABASE_URI", pre=True)
    def assemble_db_connection(cls, v: Optional[str], values: Dict[str, Any]) -> Any:
        if isinstance(v, str):
            return v
        return PostgresDsn.build(
            scheme="postgresql",
            user=values.get("POSTGRES_USER"),
            password=values.get("POSTGRES_PASSWORD"),
            host=values.get("POSTGRES_SERVER"),
            path=f"/{values.get('POSTGRES_DB') or ''}",
        )

    class Config:
        env_file = ".env"
        case_sensitive = True


settings = Settings()
