# Epic Shelter - Data Migration Dashboard

A modern data migration tool built with FastAPI and React, designed to facilitate seamless data transfers between different data lakes and databases.

## Project Structure
```
epic-shelter/
├── backend/           # FastAPI backend
│   ├── app/
│   │   ├── api/      # API endpoints
│   │   ├── core/     # Core configuration
│   │   ├── schemas/  # Pydantic models
│   │   └── services/ # Business logic
│   ├── requirements.txt
│   └── run.py
└── frontend/         # React frontend
    ├── src/
    ├── package.json
    └── ...
```

## Setup Instructions

### Backend Setup

1. Create and activate a virtual environment:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Create a `.env` file in the `backend` directory with the following content:
```env
SINGLESTORE_HOST=your_host
SINGLESTORE_PORT=your_port
SINGLESTORE_USERNAME=your_username
SINGLESTORE_PASSWORD=your_password
SINGLESTORE_DATABASE=your_database
```

4. Run the backend server:
```bash
python run.py
```

The backend will be available at `http://localhost:8000` with:
- API documentation: `http://localhost:8000/docs`
- OpenAPI specification: `http://localhost:8000/api/v1/openapi.json`

### Frontend Setup

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Start the development server:
```bash
npm run dev
```

The frontend will be available at `http://localhost:5173`

## API Endpoints

### Health Check
- GET `/api/v1/health`: Check API health status

### Migrations
- GET `/api/v1/migrations`: List all migrations
- POST `/api/v1/migrations`: Create a new migration
- GET `/api/v1/migrations/{migration_id}`: Get migration details
- GET `/api/v1/migrations/{migration_id}/status`: Get migration status

## Development

- Backend uses FastAPI with Python 3.8+
- Frontend uses React 18+ with Vite and shadcn/ui
- Database: SingleStore
- API documentation is auto-generated using FastAPI's built-in Swagger UI

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
