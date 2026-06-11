"""Rich-backed logging with a single shared handler."""

from __future__ import annotations

import logging

from rich.logging import RichHandler

_CONFIGURED = False


def _configure(level: str) -> None:
    global _CONFIGURED
    handler = RichHandler(rich_tracebacks=True, show_path=False, markup=True)
    logging.basicConfig(
        level=level.upper(),
        format="%(message)s",
        datefmt="[%X]",
        handlers=[handler],
    )
    _CONFIGURED = True


def get_logger(name: str = "curepay", level: str = "INFO") -> logging.Logger:
    """Return a namespaced logger, configuring the root handler once."""
    if not _CONFIGURED:
        _configure(level)
    logger = logging.getLogger(name)
    logger.setLevel(level.upper())
    return logger
