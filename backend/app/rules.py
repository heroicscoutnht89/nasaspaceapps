import json
from pathlib import Path

from fastapi import APIRouter

RULES_PATH = Path(__file__).with_name("rules.json")


def make_rules_router():
    router = APIRouter()

    @router.get("/rules")
    def get_rules():
        return json.loads(RULES_PATH.read_text(encoding="utf-8"))

    return router