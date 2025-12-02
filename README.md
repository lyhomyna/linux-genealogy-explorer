# Linux Genealogy Explorer
React + Python Flask + Wikidata combo for exploring Linux distribution genealogy.

## Quick Start
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
