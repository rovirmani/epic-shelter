# Epic Shelter: Data Migration Dashboard Technical Deep-Dive

## Overview
Epic Shelter is a modern data migration tool designed to facilitate seamless data transfers between different data storage systems. Built with FastAPI and React, it provides a user-friendly interface for managing and monitoring data migrations, with initial support for SingleStore to Hydrolix transfers.

## Architecture

### Tech Stack
- **Frontend**: React 18+ with Vite and shadcn/ui
- **Backend**: FastAPI with async Python
- **Source Database**: SingleStore
- **Destination**: Hydrolix Data Platform

### Key Components

#### 1. Connector System
We use an extensible connector architecture that makes it easy to add support for new data sources and destinations:

```python
class DataConnector(ABC):
    async def connect(self) -> None: ...
    async def disconnect(self) -> None: ...
    async def test_connection(self) -> bool: ...
    async def get_schema(self) -> Dict[str, Any]: ...

class SourceConnector(DataConnector):
    async def read_data(self, query: str) -> List[Dict[str, Any]]: ...
    async def get_tables(self) -> List[str]: ...

class DestinationConnector(DataConnector):
    async def write_data(self, data: List[Dict[str, Any]], table: str) -> int: ...
    async def create_table(self, table_name: str, schema: Dict[str, Any]) -> None: ...
```

This abstraction allows us to:
- Add new data sources by implementing `SourceConnector`
- Add new destinations by implementing `DestinationConnector`
- Ensure consistent behavior across different implementations

#### 2. Migration Workflow
The migration process follows a clear, asynchronous workflow:

1. **Initiation**:
   - User configures migration through the UI
   - Frontend sends a POST request with migration details
   - Backend creates a migration record and starts the process

2. **Execution**:
   - Connect to source and destination
   - Read schema from source
   - Create table in destination
   - Transfer data in chunks
   - Update progress in real-time

3. **Monitoring**:
   - Frontend polls status endpoint
   - Backend provides progress updates
   - UI updates to show current status

#### 3. Type-Safe API Contract
We use Pydantic models to ensure type safety and automatic validation:

```python
class MigrationCreate(BaseModel):
    name: str
    source_type: MigrationType
    source_config: dict
    destination_type: MigrationType
    destination_config: dict
    transform_query: Optional[str] = None

class Migration(BaseModel):
    id: str
    name: str
    status: str
    progress: float
    created_at: datetime
    # ... other fields
```

Benefits:
- Automatic request validation
- Generated API documentation
- Type hints for better development experience
- Clear contract between frontend and backend

## Implementation Details

### Backend Organization
```
backend/
├── app/
│   ├── api/          # API endpoints
│   ├── connectors/   # Data source/destination implementations
│   ├── core/         # Core configuration
│   ├── schemas/      # Pydantic models
│   └── services/     # Business logic
```

### Frontend Organization
```
frontend/
├── src/
│   ├── components/   # Reusable UI components
│   ├── pages/        # Page components
│   └── services/     # API integration
```

### Example Migration Flow

1. **User Initiates Migration**:
```typescript
const migrationData = {
  name: "Monthly Sales Migration",
  source_type: "SINGLESTORE",
  source_config: {
    table: "sales_data",
    query: "SELECT * FROM sales_data WHERE date >= '2024-01-01'"
  },
  destination_type: "HYDROLIX",
  destination_config: {
    table: "sales_history"
  }
};
```

2. **Backend Processes Request**:
```python
@router.post("", response_model=Migration)
async def create_migration(migration: MigrationCreate):
    return migration_service.create_migration(migration)
```

3. **Migration Service Handles Execution**:
```python
async def _run_migration(self, migration: Migration, config: MigrationCreate):
    source = SingleStoreConnector(config.source_config)
    destination = HydrolixConnector(config.destination_config)
    
    await source.connect()
    await destination.connect()
    
    # Transfer data and update status
    # ...
```

## Security Considerations

1. **Environment Variables**:
   - All sensitive credentials stored in `.env`
   - Different configurations for development/production

2. **API Security**:
   - CORS configuration for frontend access
   - Rate limiting on endpoints
   - Input validation via Pydantic

## Monitoring and Error Handling

1. **Migration Status Updates**:
   - Real-time progress tracking
   - Detailed error messages
   - Automatic cleanup on failure

2. **Logging**:
   - Comprehensive logging of migration steps
   - Error tracking for debugging
   - Performance metrics

## Future Improvements

1. **Additional Connectors**:
   - Support for more data sources (PostgreSQL, MongoDB)
   - Support for more destinations (Snowflake, BigQuery)

2. **Features**:
   - Data transformation capabilities
   - Schema mapping UI
   - Migration templates
   - Scheduled migrations

3. **Performance**:
   - Parallel data transfer
   - Incremental migrations
   - Resume failed migrations

## Getting Started

See `README.md` for setup instructions and basic usage. For development guidelines and contribution information, see `CONTRIBUTING.md`.
