import { useQuery } from '@tanstack/react-query'
import { OverviewCards } from '@/components/dashboard/OverviewCards'
import { MigrationChart } from '@/components/dashboard/MigrationChart'
import { RecentMigrations } from '@/components/dashboard/RecentMigrations'
import { getMigrations, getMigrationMetrics } from '@/api/migrations'

export default function Dashboard() {
  const { data: metrics, isLoading: isLoadingMetrics } = useQuery({
    queryKey: ['migration-metrics'],
    queryFn: getMigrationMetrics,
    refetchInterval: 5000,
  })

  const { data: migrations = [], isLoading: isLoadingMigrations } = useQuery({
    queryKey: ['migrations'],
    queryFn: getMigrations,
    refetchInterval: 5000,
  })

  // Sample data for the chart - in production, this would come from an API
  const chartData = [
    {
      date: "Jan 22",
      "Successful Migrations": 12,
      "Failed Migrations": 2,
    },
    {
      date: "Feb 22",
      "Successful Migrations": 18,
      "Failed Migrations": 3,
    },
    {
      date: "Mar 22",
      "Successful Migrations": 25,
      "Failed Migrations": 1,
    },
    {
      date: "Apr 22",
      "Successful Migrations": 32,
      "Failed Migrations": 4,
    },
    {
      date: "May 22",
      "Successful Migrations": 38,
      "Failed Migrations": 2,
    },
  ]

  if (isLoadingMetrics || isLoadingMigrations) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!metrics) {
    return <div>Error loading metrics</div>
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Dashboard</h2>
      </div>
      <div className="space-y-4">
        <OverviewCards metrics={metrics} />
        
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
          <MigrationChart data={chartData} />
          <RecentMigrations migrations={migrations} />
        </div>
      </div>
    </div>
  )
}
