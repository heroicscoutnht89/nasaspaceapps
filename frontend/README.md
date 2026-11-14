**Astronaut Health Companion**

A visual, offline-first tool that helps astronauts assess their own health on long space missions and gives simple guidance on what to do next. It runs on phones and on astronaut laptops (Expo / React Native Web), syncs to a small Python backend and MongoDB Atlas when the link is available, and is designed for low bandwidth and delayed communication.

Not a medical device. This is a hackathon prototype for decision support only. Health limits are placeholders for review by medical experts, except the radiation career limit, which comes from NASA-STD-3001 (see Sources). Contact a flight surgeon for urgent symptoms.

**Why**

NASA's Human Research Program groups the risks of human spaceflight into five hazards: space radiation, isolation and confinement, distance from Earth, gravity fields, and hostile/closed environments. On long missions, crews must be able to notice problems early without waiting for a round trip to Mission Control. This app turns a three-minute daily check-in into clear status colors, trends against the astronaut's own baseline, and plain-language actions.

**Features**

Home: Overall status and score, the five NASA hazards, and solar event banner.

Daily check-in (5 steps, about 3 minutes): Vitals (heart rate, blood pressure, temperature, optional blood sugar), mood and crew tension, symptoms, sleep, exercise, food and fluids, then review and save.

Body view: Tap a body area to see its function, what spaceflight changes, and related status.

Trends: Line charts (sleep, mood, heart rate, radiation dose) with a personal normal-range band and a flag line.

Radiation center: Dose readings against the NASA career limit (600 mSv effective dose).

Flight surgeon report: Active flags, indicator summary, symptoms, recommended actions, optional crew note; queue it for the next link or save as a text file.

What to do: Guidance for every flagged indicator, loaded from the backend rules.json.

Offline-first: Everything is saved on the device first; entries queue and sync when the backend is reachable; only changed items are sent, never the full history.

Demo tools (optional): Load demo history, simulate a solar particle event, and reset data.

**Architecture**

Expo app (phone / laptop browser)
  AsyncStorage: checkins, readings, reportQueue, rulesCache, solarEvent
        |  POST /sync/{collection}  (every 60 s and on start; idempotent)
        |  GET  /rules              (cached for offline use)
        v
FastAPI (Python)  --->  MongoDB Atlas
                         Collections: checkins, readings, reports

Status, trends and the report are calculated on the device, so they work with no connection.

The backend owns the rules (thresholds and guidance text) and stores synced data for the flight surgeon side.

Items are stored under the ID astronautId:itemId, so a retry never creates duplicates.

**Tech stack**

Frontend: Expo (React Native, expo-router), React Native Web, react-native-svg, AsyncStorage, TypeScript.

Backend: Python 3.10+, FastAPI, uvicorn, pymongo, python-dotenv (mongomock as an in-memory fallback).

Database: MongoDB Atlas (use MongoDB Compass to inspect data).

**Repository layout**

backend/
  app/
    main.py        FastAPI app, CORS, /health, database connection
    sync.py        /sync/{collection}, /sync/{collection}/count, /demo/reset
    rules.py       GET /rules
    rules.json     thresholds and guidance (edit without touching the app)
  .env.example

frontend/
  app/             screens (index, checkin, body, radiation, trends, report) and _layout.tsx
  components/      Card, StatusBadge, TopStrip, Inputs, BodyFigure, LineChart, DemoTools, SolarBanner
  data/            check-in model, storage, report, live trends, rules, sync, demo helpers
  theme.ts         all colors and spacing in one place
  .env.example

If the Expo template on your device placed app inside src/, then components, data and theme.ts live in frontend/src/ next to it.

**Getting started**

**Prerequisites**

Node.js (LTS) and npm.

Python 3.10 or newer.

A MongoDB Atlas cluster (free tier is enough) with a database user and your IP in the Network Access list. Without Atlas, the backend falls back to an in-memory database that is cleared on restart.

**1. Backend**

cd backend
python -m venv .venv
.venv\Scripts\Activate.ps1
pip install fastapi "uvicorn[standard]" pymongo python-dotenv mongomock
copy .env.example .env      # then fill in the values
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000

macOS / Linux: source .venv/bin/activate and cp .env.example .env.

To check: open http://localhost:8000/health (should show "status":"ok") and http://localhost:8000/docs.

Backend environment variables (backend/.env):

MONGODB_URI: Atlas connection string (leave empty to use the in-memory fallback).

MONGODB_USERNAME / MONGODB_PASSWORD: Database user, if not embedded in the URI.

MONGODB_DB: Database name (default astro_health).

DEMO_MODE: Set to 1 to enable DELETE /demo/reset; keep it 0 otherwise.

**2. Frontend**

cd frontend
npm install
copy .env.example .env      # then fill in the values
npx expo start

Press w for the browser. On a phone, use Expo Go and set EXPO_PUBLIC_API_URL to your computer's LAN address (for example http://192.168.1.20:8000), because localhost on a phone means the phone itself. Restart Expo after changing .env.

Frontend environment variables (frontend/.env):

EXPO_PUBLIC_API_URL: Backend address, for example http://localhost:8000.

EXPO_PUBLIC_DEMO: Set to 1 to show the demo tools on Home.

**Backend API**

GET /health: Returns service and database status.

POST /sync/{collection}: Upserts a batch of items (checkins, readings, reports) and returns the accepted IDs.

GET /sync/{collection}/count: Returns the number of stored documents (handy for testing).

GET /rules: Returns the current thresholds and guidance text.

DELETE /demo/reset: Clears the three collections; only available when DEMO_MODE=1.

**Rules and guidance**

All limits and advice sentences live in backend/app/rules.json. The app downloads them at start, caches them, and falls back to built-in defaults when offline. Edit the file, reload the app, and flags and actions change with no code changes. The report shows which rules were used (built-in, cached or server, plus version).

**Demo walkthrough**

Save one reading in the Radiation tab (the demo loader copies its shape).

On Home, press Load demo history to create 30 days of data with a late decline in sleep and mood.

Press Simulate solar event to show the alert banner and a dose jump.

Open Trends and Report to show flags, recommended actions and the text export.

Press Reset demo data twice to clear the device and the database.

**Known limitations**

Health thresholds (except the radiation career limit) and guidance are placeholders and not clinically validated.

The radiation limit is the NASA career limit of 600 mSv; the Watch and Action levels (50% and 80%) are this app's own choice. Organ-specific and short-term limits are not included.

Mission name, mission day and the hazard overview on Home are sample data.

No login: everything is stored under one demo astronaut ID.

Several check-ins in one day count as separate entries in baselines and streaks.

**Sources**

NASA Human Research Program: Hazards, risks and ongoing research (nasa.gov/hrp).

Canadian Space Agency: Radiation monitoring on the ISS and why experiments are done in space.

NASA Office of the Chief Health and Medical Officer, radiation protection technical brief (NASA-STD-3001): 600 mSv career effective dose limit, 250 mSv per solar particle event.
