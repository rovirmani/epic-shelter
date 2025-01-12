import React, { useState } from 'react';
import { Plus, Search, Database, Settings2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AddDatabaseModal } from '@/components/databases/AddDatabaseModal';

export function DatabasesPage() {
  const [connections, setConnections] = useState([]);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const handleAddConnection = (newConnection) => {
    setConnections(prev => [...prev, newConnection]);
  };

  const filteredConnections = connections.filter(conn => 
    conn.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-6 max-w-7xl">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">Database Connections</h1>
        <Button 
          className="bg-purple-600 hover:bg-purple-700 text-white"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Connection
        </Button>
      </div>

      <div className="space-y-6">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500 h-4 w-4" />
          <Input
            placeholder="Search connections..."
            className="pl-10"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {connections.length === 0 ? (
          <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-dashed border-gray-200 dark:border-gray-700 p-12">
            <div className="text-center">
              <Database className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-semibold text-gray-900 dark:text-white">No connections</h3>
              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Get started by adding a new database connection.
              </p>
              <div className="mt-6">
                <Button
                  className="bg-purple-600 hover:bg-purple-700 text-white"
                  onClick={() => setIsAddModalOpen(true)}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Connection
                </Button>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredConnections.map((conn) => (
              <div
                key={conn.id}
                className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-center space-x-3">
                    <span className="text-2xl">{DATABASE_TYPES[conn.type].icon}</span>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                        {conn.name}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400">
                        {DATABASE_TYPES[conn.type].name}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="bg-purple-50/40 text-purple-600 hover:bg-purple-50/80 hover:text-purple-700 dark:bg-purple-900/20 dark:text-purple-300 dark:hover:bg-purple-900/30"
                  >
                    <Settings2 className="h-4 w-4" />
                  </Button>
                </div>
                
                <div className="mt-4">
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    {conn.type === 'supabase' ? (
                      <span>Project: {conn.config.project_url}</span>
                    ) : (
                      <span>Host: {conn.config.host || conn.config.account}</span>
                    )}
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">
                    Database: {conn.config.database}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <AddDatabaseModal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        onAdd={handleAddConnection}
      />
    </div>
  );
}
