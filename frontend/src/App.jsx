import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { MigrationsTable } from './components/dashboard/MigrationsTable';
import { MetricsModal } from './components/dashboard/MetricsModal';
import { ScheduleMigrationModal } from './components/migrations/ScheduleMigrationModal';
import { Button } from './components/ui/button';
import { Plus } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DatabasesPage } from './pages/DatabasesPage';

// Mock data - replace with real data from your API
const mockMigrations = [
  {
    id: 1,
    name: 'Production DB Sync',
    source: 'Supabase Production',
    destination: 'SingleStore Analytics',
    status: 'running',
    schedule: 'Daily at 00:00 UTC',
    lastRun: '2025-01-11 16:00 UTC',
    totalRecords: 1234567,
    dataSize: '2.3 GB',
    throughput: '1,200',
    duration: '45 minutes',
    logs: 'Migration started at 2025-01-11 16:00 UTC\nProcessing records...\nMigration completed successfully'
  },
  {
    id: 2,
    name: 'User Data Migration',
    source: 'Legacy MySQL',
    destination: 'Supabase Production',
    status: 'completed',
    schedule: null,
    lastRun: '2025-01-10 14:30 UTC',
  },
  {
    id: 3,
    name: 'Analytics Sync',
    source: 'Production DB',
    destination: 'Analytics DB',
    status: 'scheduled',
    schedule: 'Weekly on Sunday',
    lastRun: null,
  }
];

function MigrationsPage() {
  const [isMetricsOpen, setIsMetricsOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [selectedMigration, setSelectedMigration] = React.useState(null);
  const [migrations, setMigrations] = React.useState(mockMigrations);

  // For demo purposes - in real app, this would come from your database connections
  const mockConnections = [
    { id: 1, name: 'Production Postgres', type: 'postgres' },
    { id: 2, name: 'Analytics Warehouse', type: 'snowflake' },
    { id: 3, name: 'User Database', type: 'supabase' },
  ];

  const handleScheduleMigration = (migrationData) => {
    const newMigration = {
      id: migrations.length + 1,
      ...migrationData,
      lastRun: migrationData.status === 'running' ? new Date().toISOString() : null,
      schedule: migrationData.frequency === 'once' ? null : 
        `${migrationData.frequency === 'daily' ? 'Daily' : 'Weekly'} at ${migrationData.time}`,
    };
    
    setMigrations(prev => [...prev, newMigration]);
  };

  return (
    <>
      <div className="flex flex-col w-full gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Total Migrations</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">{migrations.length}</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Active Jobs</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {migrations.filter(m => m.status === 'running').length}
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Scheduled Jobs</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">
              {migrations.filter(m => m.status === 'scheduled').length}
            </p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Migration Jobs</h2>
            <Button 
              variant="default" 
              className="bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => setIsScheduleOpen(true)}
            >
              <Plus className="mr-2 h-4 w-4" />
              Schedule Migration
            </Button>
          </div>
          <MigrationsTable 
            migrations={migrations}
            onViewMetrics={(migration) => {
              setSelectedMigration(migration);
              setIsMetricsOpen(true);
            }}
          />
        </div>
      </div>

      <MetricsModal
        isOpen={isMetricsOpen}
        onClose={() => setIsMetricsOpen(false)}
        migrationData={selectedMigration}
      />

      <ScheduleMigrationModal
        isOpen={isScheduleOpen}
        onClose={() => setIsScheduleOpen(false)}
        onSchedule={handleScheduleMigration}
        connections={mockConnections}
      />
    </>
  );
}

function App() {
  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout><MigrationsPage /></DashboardLayout>} />
          <Route path="/databases" element={<DashboardLayout><DatabasesPage /></DashboardLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

export default App;
