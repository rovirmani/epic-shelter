# CLAUDE.md

This file provides guidance to Claude Code when working with code in this repository.

## Project Overview

Epic Shelter (formerly precode-sb) is a data migration tool for seamless transfers between storage systems. Currently supports SingleStore to Hydrolix migrations. Handles Parquet file conversion, schema translation, and data partitioning. Full-stack application with a React frontend and FastAPI backend.

## Tech Stack

### Frontend
- **Language**: TypeScript
- **Framework**: React 18.3.1 + Vite
- **Styling**: Tailwind CSS
- **Linting**: ESLint with React plugins

### Backend
- **Language**: Python 3
- **Framework**: FastAPI + SQLAlchemy
- **Data Processing**: pandas, pyarrow (Parquet), scikit-learn
- **Database**: SQLAlchemy ORM

## Project Structure

```
epic-shelter/
├── frontend/
│   ├── package.json          # Vite + React dependencies
│   ├── vite.config.js        # Vite configuration
│   ├── src/                  # React source code
│   │   ├── components/       # React components
│   │   ├── pages/            # Page components
│   │   └── App.tsx           # Root component
│   └── public/               # Static assets
├── backend/
│   ├── requirements.txt      # Python dependencies
│   ├── app/
│   │   ├── main.py           # FastAPI entry point
│   │   ├── models/           # SQLAlchemy models
│   │   ├── routes/           # API route handlers
│   │   └── services/         # Business logic (migration, conversion)
│   └── tests/                # Backend tests
├── ARCHITECTURE.md           # Detailed system design document
└── .github/workflows/
    └── claude.yml            # Claude Code Actions workflow
```

## Development Commands

### Frontend
```bash
cd frontend
npm install                  # Install dependencies
npm run dev                  # Vite dev server (http://localhost:5173)
npm run build                # Production build
npm run lint                 # ESLint check
npm run preview              # Preview production build
```

### Backend
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload    # FastAPI dev server (http://localhost:8000)
```

### Both Together
```bash
npm run dev:all              # Runs frontend + backend concurrently
```

## Environment & Config

- `.env` file for database credentials and API keys (gitignored)
- Frontend Vite config in `frontend/vite.config.js`
- Backend config via environment variables or config module
- Never commit database credentials or API keys

## Code Style & Standards

### Frontend
- TypeScript with strict mode
- ESLint with React and Vite plugins
- Tailwind CSS for styling (utility-first)
- Component-based architecture

### Backend
- Python type hints where helpful
- FastAPI dependency injection patterns
- SQLAlchemy ORM for database access
- Separation of routes, models, and services

## Architecture Notes

- See `ARCHITECTURE.md` for detailed system design
- Frontend communicates with backend via REST API
- Backend handles data migration pipeline: connect to source -> read schema -> convert data -> write to target
- Parquet format used as intermediate representation for data transfer
- Schema translation layer maps between SingleStore and Hydrolix types

## Troubleshooting

- Frontend build errors: Delete `node_modules/` and run `npm install`
- Backend import errors: Ensure venv is activated
- Parquet conversion issues: Check pyarrow version compatibility
- Database connection errors: Verify credentials in `.env`
