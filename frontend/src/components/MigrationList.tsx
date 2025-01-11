import React from 'react';
import { Migration } from '../types/migration';
import { formatDistanceToNow } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from './ui/table';
import { 
  PlayIcon, 
  StopIcon, 
  ReloadIcon,
  ChevronRightIcon 
} from '@radix-ui/react-icons';

interface Props {
  migrations: Migration[];
  onStart?: (id: string) => void;
  onStop?: (id: string) => void;
  onRetry?: (id: string) => void;
  onSelect?: (migration: Migration) => void;
}

export const MigrationList: React.FC<Props> = ({
  migrations,
  onStart,
  onStop,
  onRetry,
  onSelect,
}) => {
  const navigate = useNavigate();

  const handleRowClick = (migration: Migration) => {
    if (onSelect) {
      onSelect(migration);
    } else {
      navigate(`/migrations/${migration.id}`);
    }
  };

  const getStatusColor = (status: Migration['status']) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'running':
        return 'bg-blue-500';
      case 'failed':
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Migrations</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Progress</TableHead>
              <TableHead>Created</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {migrations.map((migration) => (
              <TableRow 
                key={migration.id}
                className="cursor-pointer"
                onClick={() => handleRowClick(migration)}
              >
                <TableCell className="font-medium">
                  <div className="flex flex-col">
                    <span>{migration.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {migration.currentStep}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="secondary" className={getStatusColor(migration.status)}>
                    {migration.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="w-[200px] space-y-1">
                    <Progress value={migration.progress * 100} />
                    <p className="text-xs text-muted-foreground">
                      {(migration.progress * 100).toFixed(1)}%
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {formatDistanceToNow(new Date(migration.createdAt), { addSuffix: true })}
                </TableCell>
                <TableCell>
                  <div className="flex space-x-2" onClick={(e) => e.stopPropagation()}>
                    {migration.status === 'pending' && onStart && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStart(migration.id)}
                      >
                        <PlayIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {migration.status === 'running' && onStop && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onStop(migration.id)}
                      >
                        <StopIcon className="h-4 w-4" />
                      </Button>
                    )}
                    {migration.status === 'failed' && onRetry && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onRetry(migration.id)}
                      >
                        <ReloadIcon className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleRowClick(migration);
                      }}
                    >
                      <ChevronRightIcon className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
