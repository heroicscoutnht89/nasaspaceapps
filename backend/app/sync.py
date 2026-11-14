from datetime import datetime, timezone
from typing import Any

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel

ALLOWED = {"checkins", "readings", "reports"}


class Batch(BaseModel):
    astronaut_id: str = "demo"
    items: list[dict[str, Any]]


def make_router(db):
    router = APIRouter()

    @router.post("/sync/{collection}")
    def sync(collection: str, batch: Batch):
        if collection not in ALLOWED:
            raise HTTPException(status_code=404, detail="Unknown collection")
        if len(batch.items) > 200:
            raise HTTPException(status_code=413, detail="Batch too large")
        accepted = []
        for item in batch.items:
            item_id = item.get("id")
            if not item_id:
                continue
            doc = {k: v for k, v in item.items() if k != "_id"}
            doc["astronaut_id"] = batch.astronaut_id
            doc["received_at"] = datetime.now(timezone.utc)
            db[collection].update_one(
                {"_id": f"{batch.astronaut_id}:{item_id}"},
                {"$set": doc},
                upsert=True,
            )
            accepted.append(item_id)
        return {"accepted": accepted}

    @router.get("/sync/{collection}/count")
    def count(collection: str):
        if collection not in ALLOWED:
            raise HTTPException(status_code=404, detail="Unknown collection")
        return {"collection": collection, "count": db[collection].count_documents({})}

    return router