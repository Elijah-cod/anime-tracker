from functools import lru_cache
from typing import List

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict


def normalize_database_url(raw_url: str) -> str:
    cleaned = raw_url.strip().strip("\"'")

    if cleaned.startswith("postgres://"):
        return cleaned.replace("postgres://", "postgresql+psycopg://", 1)

    if cleaned.startswith("postgresql://") and "+psycopg" not in cleaned:
        return cleaned.replace("postgresql://", "postgresql+psycopg://", 1)

    return cleaned


class Settings(BaseSettings):
    model_config = SettingsConfigDict(env_file=".env", extra="ignore")

    app_name: str = Field(default="Anime Tracker API", alias="APP_NAME")
    app_env: str = Field(default="development", alias="APP_ENV")
    api_v1_prefix: str = Field(default="/api/v1", alias="API_V1_PREFIX")
    database_url: str = Field(alias="DATABASE_URL")
    anilist_graphql_url: str = Field(default="https://graphql.anilist.co", alias="ANILIST_GRAPHQL_URL")
    jikan_base_url: str = Field(default="https://api.jikan.moe/v4", alias="JIKAN_BASE_URL")
    cache_ttl_seconds: int = Field(default=86400, alias="CACHE_TTL_SECONDS")
    allow_origins_raw: str = Field(default="http://localhost:3000", alias="ALLOW_ORIGINS")
    seed_demo_data: bool = Field(default=True, alias="SEED_DEMO_DATA")

    @property
    def allow_origins(self) -> List[str]:
        return [origin.strip() for origin in self.allow_origins_raw.split(",") if origin.strip()]

    @property
    def normalized_database_url(self) -> str:
        return normalize_database_url(self.database_url)


@lru_cache()
def get_settings() -> Settings:
    return Settings()
