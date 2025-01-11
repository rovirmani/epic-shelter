import { useNavigate } from 'react-router-dom'
import {
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  LinearProgress,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material'
import { Add as AddIcon } from '@mui/icons-material'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

interface Migration {
  id: string
  name: string
  status: 'running' | 'completed' | 'failed'
  progress: number
  source: string
  destination: string
  startTime: string
  endTime?: string
}

export default function Migrations() {
  const navigate = useNavigate()

  const { data: migrations = [], isLoading } = useQuery({
    queryKey: ['migrations'],
    queryFn: async () => {
      const { data } = await axios.get<Migration[]>('/api/migrations')
      return data
    },
  })

  const getStatusColor = (status: Migration['status']) => {
    switch (status) {
      case 'running':
        return 'primary'
      case 'completed':
        return 'success'
      case 'failed':
        return 'error'
      default:
        return 'default'
    }
  }

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4">Data Migrations</Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => navigate('/migrations/new')}
        >
          New Migration
        </Button>
      </Box>

      <Card>
        <CardContent>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Progress</TableCell>
                  <TableCell>Source</TableCell>
                  <TableCell>Destination</TableCell>
                  <TableCell>Start Time</TableCell>
                  <TableCell>End Time</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {isLoading ? (
                  <TableRow>
                    <TableCell colSpan={7}>
                      <LinearProgress />
                    </TableCell>
                  </TableRow>
                ) : (
                  migrations.map((migration) => (
                    <TableRow key={migration.id}>
                      <TableCell>{migration.name}</TableCell>
                      <TableCell>
                        <Chip
                          label={migration.status}
                          color={getStatusColor(migration.status)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center' }}>
                          <LinearProgress
                            variant="determinate"
                            value={migration.progress}
                            sx={{ flexGrow: 1, mr: 2 }}
                          />
                          <Typography variant="body2">
                            {migration.progress}%
                          </Typography>
                        </Box>
                      </TableCell>
                      <TableCell>{migration.source}</TableCell>
                      <TableCell>{migration.destination}</TableCell>
                      <TableCell>
                        {new Date(migration.startTime).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        {migration.endTime
                          ? new Date(migration.endTime).toLocaleString()
                          : '-'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    </Box>
  )
}
