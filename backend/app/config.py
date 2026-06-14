from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):
    """Application settings loaded from environment variables / .env file."""

    app_name: str = "QG Exchange API"
    debug: bool = True

    # Comma-separated list of allowed CORS origins (the frontend dev server).
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"

    host: str = "0.0.0.0"
    port: int = 8000

    # Database. SQLite by default (zero-setup local dev). Switch to PostgreSQL
    # by setting DATABASE_URL, e.g.
    #   postgresql+psycopg://user:pass@localhost:5432/qgexchange
    database_url: str = "sqlite:///./qgexchange.db"

    # JWT auth
    jwt_secret_key: str = "change-me-in-production-please-use-a-long-random-string"
    jwt_algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24  # 24 hours

    # AI / OpenAI (optional; matching falls back to the rule-based engine).
    openai_api_key: str = ""

    # Auto-seed categories + sample data on startup when the DB is empty.
    # Enabled by default so a freshly-provisioned production DB is usable.
    seed_on_startup: bool = True

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8")

    @property
    def cors_origins_list(self) -> list[str]:
        return [
            origin.strip() for origin in self.cors_origins.split(",") if origin.strip()
        ]

    @property
    def sqlalchemy_database_url(self) -> str:
        """Return a SQLAlchemy-compatible database URL.

        Managed Postgres providers (Railway, Heroku, etc.) expose URLs starting
        with ``postgres://`` or ``postgresql://``. SQLAlchemy + psycopg 3 needs
        the explicit ``postgresql+psycopg://`` driver prefix, so normalize here.
        """
        url = self.database_url
        if url.startswith("postgres://"):
            url = "postgresql://" + url[len("postgres://") :]
        if url.startswith("postgresql://"):
            url = "postgresql+psycopg://" + url[len("postgresql://") :]
        return url


settings = Settings()
