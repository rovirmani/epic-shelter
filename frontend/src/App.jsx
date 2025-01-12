import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { DashboardLayout } from './components/dashboard/DashboardLayout';
import { MigrationsTable } from './components/dashboard/MigrationsTable';
import { MetricsModal } from './components/dashboard/MetricsModal';
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
  const [selectedMigration, setSelectedMigration] = React.useState(null);

  return (
    <>
      <div className="flex flex-col w-full gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Total Migrations</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">24</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Active Jobs</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">3</p>
          </div>
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow">
            <h3 className="text-lg font-semibold mb-2 text-gray-700 dark:text-gray-300">Scheduled Jobs</h3>
            <p className="text-3xl font-bold text-purple-600 dark:text-purple-400">5</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 w-full">
          <div className="flex justify-between items-center p-6 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-xl font-bold text-gray-800 dark:text-white">Migration Jobs</h2>
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700 text-white">
              <Plus className="mr-2 h-4 w-4" />
              Schedule Migration
            </Button>
          </div>
          <MigrationsTable 
            migrations={mockMigrations}
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
