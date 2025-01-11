# Epic Shelter Architecture

Epic Shelter is a data migration tool designed to facilitate efficient data transfers between different data storage systems. The architecture follows a modular design pattern to enable easy extension and maintenance.

## System Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌──────────────────┐
│   Source DB     │     │  Epic Shelter    │     │   Destination    │
│  (SingleStore)  │────▶│    Pipeline      │────▶│    (Hydrolix)    │
└─────────────────┘     └──────────────────┘     └──────────────────┘
                               │
                        ┌──────┴───────┐
                        │  Parquet     │
                        │  Storage     │
                        └──────────────┘
```

## Core Components

### 1. Connector System
- **Base Classes**
  - `DataConnector`: Abstract base with connection management
  - `SourceConnector`: Adds data reading capabilities
  - `DestinationConnector`: Adds data writing capabilities

- **Implementations**
  - `SingleStoreConnector`: Handles SingleStore database operations
  - `HydrolixConnector`: Manages Hydrolix data platform interactions

### 2. Services

#### Migration Service
- Orchestrates the entire migration process
- Handles state management and progress tracking
- Provides asynchronous execution with status updates

#### Schema Service
- Manages schema translation between systems
- Handles data type mappings
- Configures primary keys and partitioning

#### Parquet Service
- Converts data to Parquet format
- Manages chunked processing for large datasets
- Configurable compression and optimization

### 3. API Layer
- FastAPI-based REST endpoints
- Swagger/OpenAPI documentation
- Real-time status updates via polling

## Data Flow

1. **Extraction** (SingleStore)
   ```
   Query ──▶ Fetch Data ──▶ Get Schema
   ```

2. **Processing**
   ```
   Raw Data ──▶ Schema Translation ──▶ Parquet Conversion
   ```

3. **Loading** (Hydrolix)
   ```
   Create Table ──▶ Upload Parquet ──▶ Trigger Ingestion
   ```

## Configuration

### Environment Variables
Required variables for system operation:

```bash
# SingleStore Configuration
SINGLESTORE_HOST
SINGLESTORE_PORT
SINGLESTORE_USERNAME
SINGLESTORE_PASSWORD
SINGLESTORE_DATABASE

# Hydrolix Configuration
HYDROLIX_API_URL
HYDROLIX_TOKEN
HYDROLIX_ORG_ID
HYDROLIX_PROJECT_ID
```

## Security Considerations

- Credentials managed via environment variables
- No sensitive data in logs or error messages
- Secure API endpoints with proper error handling

## Future Extensibility

The modular architecture allows easy addition of:
1. New source/destination connectors
2. Additional data formats
3. Enhanced transformation capabilities
4. Advanced monitoring and logging
