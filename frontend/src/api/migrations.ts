import { Migration, MigrationCreate, MigrationMetrics } from '../types/migration';

const API_BASE = 'http://localhost:8000/api/v1';

export const getMigrations = async (): Promise<Migration[]> => {
  const response = await fetch(`${API_BASE}/migrations`);
  if (!response.ok) throw new Error('Failed to fetch migrations');
  return response.json();
};

export const getMigration = async (id: string): Promise<Migration> => {
  const response = await fetch(`${API_BASE}/migrations/${id}`);
  if (!response.ok) throw new Error('Failed to fetch migration');
  return response.json();
};

export const createMigration = async (migration: MigrationCreate): Promise<Migration> => {
  const response = await fetch(`${API_BASE}/migrations`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(migration),
  });
  if (!response.ok) throw new Error('Failed to create migration');
  return response.json();
};

export const getMigrationMetrics = async (): Promise<MigrationMetrics> => {
  const response = await fetch(`${API_BASE}/migrations/metrics`);
  if (!response.ok) throw new Error('Failed to fetch metrics');
  return response.json();
};
