import {
  Box,
  Card,
  CardContent,
  Grid,
  Typography,
  LinearProgress,
} from '@mui/material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface DashboardStats {
  activeMigrations: number
  completedMigrations: number
  failedMigrations: number
  totalDataMigrated: string
  currentThroughput: string
  activeConnections: number
}

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const { data } = await axios.get<DashboardStats>('/api/stats')
      return data
    },
  })

  if (isLoading) {
    return <LinearProgress />
  }

  const statCards = [
    {
      title: 'Active Migrations',
      value: stats?.activeMigrations || 0,
      color: '#1976d2',
    },
    {
      title: 'Completed Migrations',
      value: stats?.completedMigrations || 0,
      color: '#2e7d32',
    },
    {
      title: 'Failed Migrations',
      value: stats?.failedMigrations || 0,
      color: '#d32f2f',
    },
    {
      title: 'Total Data Migrated',
      value: stats?.totalDataMigrated || '0 GB',
      color: '#ed6c02',
    },
    {
      title: 'Current Throughput',
      value: stats?.currentThroughput || '0 MB/s',
      color: '#9c27b0',
    },
    {
      title: 'Active Connections',
      value: stats?.activeConnections || 0,
      color: '#0288d1',
    },
  ]

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={3}>
        {statCards.map((stat) => (
          <Grid item xs={12} sm={6} md={4} key={stat.title}>
            <Card
              sx={{
                height: '100%',
                borderTop: 3,
                borderColor: stat.color,
              }}
            >
              <CardContent>
                <Typography
                  color="textSecondary"
                  gutterBottom
                  variant="overline"
                >
                  {stat.title}
                </Typography>
                <Typography variant="h4" component="div">
                  {stat.value}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Box>
  )
}
