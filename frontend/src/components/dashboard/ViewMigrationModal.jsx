import React from 'react';
import {
  Dialog,
  DialogContent,
} from "../ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

export function ViewMigrationModal({ isOpen, onClose, migrationData }) {
  if (!migrationData) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[800px]">
        <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200 mb-6">
          Migration Details: {migrationData.name}
        </h2>

        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="w-full grid grid-cols-3 gap-4 bg-purple-50 dark:bg-gray-800 p-1 rounded-lg">
            <TabsTrigger 
              value="overview"
              className="bg-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors"
            >
              Overview
            </TabsTrigger>
            <TabsTrigger 
              value="performance"
              className="bg-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors"
            >
              Performance
            </TabsTrigger>
            <TabsTrigger 
              value="logs"
              className="bg-transparent data-[state=active]:bg-purple-600 data-[state=active]:text-white text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-gray-700 transition-colors"
            >
              Logs
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-300">Total Records</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {migrationData.totalRecords?.toLocaleString() || '—'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-300">Data Size</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {migrationData.dataSize || '—'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-300">Throughput</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {migrationData.throughput ? `${migrationData.throughput} records/sec` : '—'}
                  </p>
                </CardContent>
              </Card>
              <Card className="border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="text-gray-700 dark:text-gray-300">Duration</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                    {migrationData.duration || '—'}
                  </p>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="performance" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-700 dark:text-gray-300">Performance Metrics</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="h-[300px] flex items-center justify-center border rounded bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                  Performance Charts Coming Soon
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="logs" className="mt-6">
            <Card className="border-gray-200 dark:border-gray-700">
              <CardHeader>
                <CardTitle className="text-gray-700 dark:text-gray-300">Migration Logs</CardTitle>
              </CardHeader>
              <CardContent>
                <pre className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg overflow-auto max-h-[400px] text-sm font-mono text-gray-700 dark:text-gray-300">
                  {migrationData.logs || 'No logs available'}
                </pre>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
