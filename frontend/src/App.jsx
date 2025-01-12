import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { MigrationsTable } from './components/dashboard/MigrationsTable';
import { MetricsModal } from './components/dashboard/MetricsModal';
import { ScheduleMigrationModal } from './components/dashboard/ScheduleMigrationModal';
import { Button } from './components/ui/button';
import { Plus } from 'lucide-react';
import { ThemeProvider } from './contexts/ThemeContext';
import { DatabasesPage } from './pages/DatabasesPage';
import { api } from '@/lib/api';

function App() {
  const [migrations, setMigrations] = useState([]);
  const [connections, setConnections] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        const [migrationsData, connectionsData] = await Promise.all([
          api.fetchMigrations(),
          api.fetchDatabases()
        ]);
        
        // Transform migrations data to match our UI needs
        const transformedMigrations = migrationsData.map(migration => ({
          id: migration.migration_uuid,
          name: migration.migration_name,
          source: connectionsData.find(db => db.db_uuid === migration.source_uuid)?.db_name || 'Unknown',
          destination: connectionsData.find(db => db.db_uuid === migration.target_uuid)?.db_name || 'Unknown',
          status: migration.status,
          lastRun: migration.last_run,
          schedule: migration.is_recurring ? 'Recurring' : null,
          timeStart: migration.time_start,
          timeFinish: migration.time_finish
        }));

        setMigrations(transformedMigrations);
        setConnections(connectionsData);
        setError(null);
      } catch (err) {
        console.error('Failed to fetch data:', err);
        setError(err.message || 'Failed to load data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <ThemeProvider>
      <Router>
        <Routes>
          <Route path="/" element={<DashboardLayout><MigrationsPage migrations={migrations} connections={connections} /></DashboardLayout>} />
          <Route path="/databases" element={<DashboardLayout><DatabasesPage /></DashboardLayout>} />
        </Routes>
      </Router>
    </ThemeProvider>
  );
}

function MigrationsPage({ migrations, connections }) {
  const [isMetricsOpen, setIsMetricsOpen] = React.useState(false);
  const [isScheduleOpen, setIsScheduleOpen] = React.useState(false);
  const [selectedMigration, setSelectedMigration] = React.useState(null);

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
        connections={connections}
      />
    </>
  );
}

export default App;
