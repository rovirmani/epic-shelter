// API configuration
const API_BASE_URL = 'http://localhost:8000/api';  // FastAPI default port with /api prefix

// Helper functions for common operations
const handleResponse = async (response) => {
    if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        if (errorData?.detail) {
            throw new Error(Array.isArray(errorData.detail) 
                ? errorData.detail.map(err => err.msg).join(', ')
                : errorData.detail
            );
        }
        throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
};

export const api = {
    // Generic methods
    get: (endpoint) =>
        fetch(`${API_BASE_URL}${endpoint}`)
            .then(handleResponse),
    
    post: (endpoint, data) =>
        fetch(`${API_BASE_URL}${endpoint}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(handleResponse),

    // Databases
    fetchDatabases: () => 
        fetch(`${API_BASE_URL}/databases`)
            .then(handleResponse),

    createDatabase: (data) =>
        fetch(`${API_BASE_URL}/databases`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(handleResponse),
    
    // Migrations
    fetchMigrations: () => 
        fetch(`${API_BASE_URL}/migrations`)
            .then(handleResponse)
            .then(data => data || []), // Ensure we always return an array
    
    createMigration: (data) =>
        fetch(`${API_BASE_URL}/migrations`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data),
        }).then(handleResponse),
    
    fetchMigrationDetails: (migrationId) => 
        fetch(`${API_BASE_URL}/migrations/${migrationId}`)
            .then(handleResponse),

    fetchMigrationStatus: (migrationId) =>
        fetch(`${API_BASE_URL}/migrations/${migrationId}/status`)
            .then(handleResponse),
};
