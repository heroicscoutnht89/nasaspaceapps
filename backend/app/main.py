import os
from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .sync import make_router
from .rules import make_rules_router

load_dotenv()
MONGODB_USERNAME = os.environ.get("MONGODB_USERNAME", "").strip()
MONGODB_PASSWORD = os.environ.get("MONGODB_PASSWORD", "")
MONGODB_URI = os.environ.get("MONGODB_URI", "").strip()
DB_NAME = os.environ.get("MONGODB_DB", "astro_health")

if MONGODB_URI:
    from pymongo import MongoClient
    options = {"serverSelectionTimeoutMS": 3000}
    if MONGODB_USERNAME and "@" not in MONGODB_URI:
        options.update(username=MONGODB_USERNAME, password=MONGODB_PASSWORD)
    client = MongoClient(MONGODB_URI, **options)
    db_mode = "atlas"
else:
    import mongomock
    client = mongomock.MongoClient()
    db_mode = "placeholder (in-memory)"

db = client[DB_NAME]

app = FastAPI(title="Astronaut Health API")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:8081"],  # Expo web dev server
    allow_methods=["*"],
    allow_headers=["*"],
)
app.include_router(make_router(db))
app.include_router(make_rules_router())

@app.get("/health")
def health():
    if db_mode == "atlas":
        client.admin.command("ping")  # fails if Atlas is unreachable
    return {"status": "ok", "database": db_mode}