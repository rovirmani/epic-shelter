export type MigrationType = 'singlestore' | 'hydrolix';

export interface Schedule {
  expression: string;  // Cron expression
  timezone: string;   // e.g., 'America/Los_Angeles'
  nextRuns?: string[];  // Next 5 scheduled run times
  description?: string; // Human readable description
}

export interface Migration {
  id: string;
  name: string;
  sourceType: MigrationType;
  destinationType: MigrationType;
  status: 'pending' | 'running' | 'completed' | 'failed';
  progress: number;
  currentStep: string;
  createdAt: string;
  startedAt?: string;
  completedAt?: string;
  errorMessage?: string;
  schedule?: Schedule;
}

export interface MigrationMetrics {
  totalMigrations: number;
  successfulMigrations: number;
  failedMigrations: number;
  totalRowsProcessed: number;
  averageThroughput: number;
}

export interface MigrationCreate {
  name: string;
  sourceType: MigrationType;
  sourceConfig: Record<string, any>;
  destinationType: MigrationType;
  destinationConfig: Record<string, any>;
  sourceQuery: string;
  destinationTable: string;
  primaryKey?: string[];
  partitionCols?: string[];
  chunkSize?: number;
  schedule?: Schedule;
}
