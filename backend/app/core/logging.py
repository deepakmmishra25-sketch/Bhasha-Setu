"""
Structured logging configuration using Loguru.
"""

import sys
from loguru import logger


def setup_logging() -> None:
    """Configure application-wide structured logging."""
    logger.remove()

    logger.add(
        sys.stdout,
        format=(
            "<green>{time:YYYY-MM-DD HH:mm:ss}</green> | "
            "<level>{level: <8}</level> | "
            "<cyan>{name}</cyan>:<cyan>{function}</cyan>:<cyan>{line}</cyan> | "
            "<level>{message}</level>"
        ),
        level="INFO",
        colorize=True,
        backtrace=True,
        diagnose=True,
    )

    logger.add(
        "logs/app.log",
        format="{time} | {level} | {name}:{function}:{line} | {message}",
        level="DEBUG",
        rotation="10 MB",
        retention="30 days",
        compression="zip",
        backtrace=True,
        diagnose=True,
    )
