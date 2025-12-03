# Linux Genealogy Explorer
React + Python Flask + Wikidata combo for exploring Linux distribution genealogy.

## Quick Start
### Docker
```bash
docker-compose up --build
```
Frontend: `http://localhost:3000`

Backend: `http://localhost:5000/api`


## API
- Search distributions: `GET /api/search?term=debi` 
    
    Possible response:
    ```
    [
        {
            "uri": "http://www.wikidata.org/entity/Q7719",
            "name": "Debian",
            "description": "free operating system"
        }
    ]

    ```
- Get distribution details: `GET /api/distro-details?uri=http://www.wikidata.org/entity/Q7719`
  
    Possible response:
    ```
    [
        {
            "uri": "http://www.wikidata.org/entity/Q7719",
            "name": "Debian",
            "description": "free operating system"
        }
    ]
    ```
- Get graph data: `GET /api/genealogy-graph?centerUri=http://www.wikidata.org/entity/Q7719`

    Possible response:
    ```
    {
        "uri": "http://www.wikidata.org/entity/Q7719",
        "name": "Debian",
        "logo": "https://...",
        "website": "https://www.debian.org",
        "packageManager": "dpkg",
        "basedOn": []
    }
    ```