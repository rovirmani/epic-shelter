import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";
import { Eye, BarChart2 } from "lucide-react";
import { MetricsModal } from "./MetricsModal";
import { ViewMigrationModal } from "./ViewMigrationModal";

export function MigrationsTable({ migrations }) {
  const [selectedMigration, setSelectedMigration] = useState(null);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);
  const [isMetricsModalOpen, setIsMetricsModalOpen] = useState(false);

  const getStatusColor = (status) => {
    switch (status) {
      case 'running':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  return (
    <>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Source</TableHead>
            <TableHead>Destination</TableHead>
            <TableHead>Last Run</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {migrations.map((migration) => (
            <TableRow key={migration.id}>
              <TableCell>{migration.name}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(migration.status)}>
                  {migration.status}
                </Badge>
              </TableCell>
              <TableCell>{migration.source}</TableCell>
              <TableCell>{migration.destination}</TableCell>
              <TableCell>{migration.lastRun || '—'}</TableCell>
              <TableCell className="text-right space-x-2">
                <Button
                  variant="ghost"
                  size="sm"
                  className="bg-purple-50/40 text-purple-600 hover:bg-purple-50/80 hover:text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
                  onClick={() => {
                    setSelectedMigration(migration);
                    setIsViewModalOpen(true);
                  }}
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="bg-purple-50/40 text-purple-600 hover:bg-purple-50/80 hover:text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
                  onClick={() => {
                    setSelectedMigration(migration);
                    setIsMetricsModalOpen(true);
                  }}
                >
                  <BarChart2 className="h-4 w-4 mr-1" />
                  Stats
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <ViewMigrationModal
        isOpen={isViewModalOpen}
        onClose={() => setIsViewModalOpen(false)}
        migrationData={selectedMigration}
      />

      <MetricsModal
        isOpen={isMetricsModalOpen}
        onClose={() => setIsMetricsModalOpen(false)}
        migration={selectedMigration}
      />
    </>
  );
}
