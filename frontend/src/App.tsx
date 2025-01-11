import { BrowserRouter, Routes, Route, Link, useNavigate } from 'react-router-dom'
import { QueryClient, QueryClientProvider, useQuery, useMutation } from '@tanstack/react-query'
import { MigrationList } from './components/MigrationList'
import { MigrationMetrics } from './components/MigrationMetrics'
import { CreateMigration } from './components/CreateMigration'
import { MigrationDetail } from './components/MigrationDetail'
import { getMigrations, getMigrationMetrics, createMigration } from './api/migrations'
import { useState } from 'react'

const queryClient = new QueryClient()

function Dashboard() {
  const navigate = useNavigate()
  const [showCreate, setShowCreate] = useState(false)
  
  const { data: migrations = [], isLoading: isLoadingMigrations } = useQuery({
    queryKey: ['migrations'],
    queryFn: getMigrations,
    refetchInterval: 5000, // Refresh every 5 seconds
  })

  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['metrics'],
    queryFn: getMigrationMetrics,
    refetchInterval: 5000,
  })

  const createMigrationMutation = useMutation({
    mutationFn: createMigration,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['migrations'] })
      setShowCreate(false)
    },
  })

  if (isLoadingMigrations || isLoadingMetrics) {
    return <div className="flex justify-center items-center h-64">Loading...</div>
  }

  return (
    <div className="space-y-8">
      {metrics && <MigrationMetrics metrics={metrics} />}
      
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Migrations</h2>
        <button
          onClick={() => setShowCreate(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
        >
          New Migration
        </button>
      </div>

      {showCreate ? (
        <CreateMigration
          onSubmit={(data) => createMigrationMutation.mutate(data)}
          onCancel={() => setShowCreate(false)}
        />
      ) : (
        <MigrationList
          migrations={migrations}
          onSelect={(migration) => navigate(`/migrations/${migration.id}`)}
        />
      )}
    </div>
  )
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <div className="min-h-screen bg-gray-100">
          <nav className="bg-white shadow-sm">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex justify-between h-16">
                <div className="flex">
                  <div className="flex-shrink-0 flex items-center">
                    <Link to="/" className="text-xl font-bold text-gray-900">
                      Epic Shelter
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </nav>
          
          <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/migrations/:id" element={<MigrationDetail />} />
            </Routes>
          </main>
        </div>
      </BrowserRouter>
    </QueryClientProvider>
  )
}
