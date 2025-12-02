# Linux Genealogy Explorer

A TypeScript frontend with Python Flask backend for exploring Linux distribution genealogy using Wikidata.

## Quick Start

```bash
# Start backend
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
python app.py

# Start frontend (in another terminal)
cd frontend
npm install
npm run dev
```

Frontend: `http://localhost:3000`
Backend: `http://localhost:5000/api`

## Docker

```bash
docker-compose up --build
```

## API

- `GET /api/search?term=<search_term>` - Search distributions
- `GET /api/distro-details?uri=<uri>` - Get distribution details
- `GET /api/genealogy-graph?centerUri=<uri>` - Get graph data
