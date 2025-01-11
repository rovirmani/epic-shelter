# Epic Shelter

Epic Shelter is a powerful data migration tool that enables seamless data transfers between different storage systems. The current implementation supports migrating data from SingleStore to Hydrolix, with plans to support more data sources and destinations.

## Features

- **Source Systems**
  - SingleStore database
  - More coming soon...

- **Destination Systems**
  - Hydrolix data platform
  - More coming soon...

- **Data Processing**
  - Efficient Parquet conversion
  - Configurable chunking and compression
  - Schema translation
  - Support for partitioning

## Quick Start

### Prerequisites

- Python 3.8+
- Node.js 16+
- SingleStore database
- Hydrolix account

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/epic-shelter.git
cd epic-shelter
```

2. Set up the backend:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: .\venv\Scripts\activate
pip install -r requirements.txt
```

3. Set up the frontend:
```bash
cd frontend
npm install
```

4. Configure environment variables:
```bash
# Backend (.env)
SINGLESTORE_HOST=your_host
SINGLESTORE_PORT=your_port
SINGLESTORE_USERNAME=your_username
SINGLESTORE_PASSWORD=your_password
SINGLESTORE_DATABASE=your_database

HYDROLIX_API_URL=your_api_url
HYDROLIX_TOKEN=your_token
HYDROLIX_ORG_ID=your_org_id
HYDROLIX_PROJECT_ID=your_project_id
```

### Running the Application

1. Start the backend:
```bash
cd backend
uvicorn app.main:app --reload
```

2. Start the frontend:
```bash
cd frontend
npm run dev
```

3. Access the application at `http://localhost:5173`

## Usage

1. **Create a Migration**
   - Select source (SingleStore) and destination (Hydrolix)
   - Configure connection details
   - Specify query and table settings
   - Start migration

2. **Monitor Progress**
   - Track migration status
   - View detailed progress steps
   - Handle any errors

3. **Verify Data**
   - Check destination table
   - Validate data integrity
   - Review migration logs

## API Documentation

The API documentation is available at `http://localhost:8000/docs` when running the backend server.

## Architecture

See [ARCHITECTURE.md](ARCHITECTURE.md) for detailed information about the system design.

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
