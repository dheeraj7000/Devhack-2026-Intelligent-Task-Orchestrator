import os
from dotenv import load_dotenv

load_dotenv()


class Settings:
    NVIDIA_NIM_API_KEY: str = os.getenv("NVIDIA_NIM_API_KEY", "")
    NVIDIA_NIM_BASE_URL: str = os.getenv(
        "NVIDIA_NIM_BASE_URL", "https://integrate.api.nvidia.com/v1"
    )
    NVIDIA_NIM_MODEL: str = os.getenv(
        "NVIDIA_NIM_MODEL", "meta/llama-3.1-70b-instruct"
    )
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./orchestrator.db")
    MAX_REPLAN_RETRIES: int = int(os.getenv("MAX_REPLAN_RETRIES", "3"))
    VALIDATION_AVG_THRESHOLD: int = int(os.getenv("VALIDATION_AVG_THRESHOLD", "95"))
    VALIDATION_MIN_THRESHOLD: int = int(os.getenv("VALIDATION_MIN_THRESHOLD", "90"))


settings = Settings()
