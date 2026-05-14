# GDPR Records Manager

Web application for managing personal data records in compliance with GDPR (Art. 15–20).

**Live demo:** https://vladyslavsemenov2007.github.io/Projekt-starzowy/

## Stack

- Frontend: HTML / CSS / JavaScript → GitHub Pages
- Backend: Node.js / Azure Functions
- Database: Azure SQL
- CI/CD: GitHub Actions

## Features

- CRUD operations on personal data records
- Server-side validation
- Search and pagination
- Export individual records as JSON or CSV (GDPR Art. 20)

## Architecture
frontend/          → GitHub Pages
backend/           → Azure Functions
src/functions/   → API endpoints
src/db.js        → database connection
.github/workflows/ → CI/CD pipelines

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | /records | List records (pagination + search) |
| POST | /records | Create record |
| GET | /records/{id} | Get single record |
| PUT | /records/{id} | Update record |
| DELETE | /records/{id} | Delete record |
| GET | /records/{id}/export | Export record (JSON/CSV) |
| GET | /health | Health check |

## Local Development

1. Clone repo
2. Create `frontend/js/config.js`:
```js
   window.APP_CONFIG = { API_URL: 'http://localhost:7071/api' };
```
3. Create `backend/local.settings.json` with DB_CONNECTION_STRING
4. Start backend:
```bash
   cd backend
   func start
```

4. Open frontend via Live Server(Jetbrains/VSCode) or:
```bash
   cd frontend
   python -m http.server 5500
```

## Internship

Dynatrace Gdańsk · April–May 2026  
Mentor: [Vitalii Vostotskyi](https://github.com/vostotskiy)  
Supervisor: [Michał Bojko](https://github.com/michalbojkogdansk)
