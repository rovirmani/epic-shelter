import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import { DATABASE_TYPES, DATABASE_TYPE_LABELS, DATABASE_TYPE_PORTS } from '@/lib/constants';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export function AddDatabaseModal({ isOpen, onClose, onAdd }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    host: '',
    port: '',
    database: '',
    username: '',
    password: '',
    // Additional fields for specific database types
    schema: '',
    warehouse: '',
    role: '',
    project_url: '',
    api_key: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleTypeChange = (type) => {
    handleInputChange('type', type);
    handleInputChange('port', DATABASE_TYPE_PORTS[type]);
  };

  const getFieldsForType = (type) => {
    const commonFields = ['name', 'type', 'database', 'username', 'password'];
    
    switch (type) {
      case DATABASE_TYPES.POSTGRES:
        return [...commonFields, 'host', 'port', 'schema'];
      case DATABASE_TYPES.MYSQL:
        return [...commonFields, 'host', 'port'];
      case DATABASE_TYPES.SNOWFLAKE:
        return [...commonFields, 'host', 'warehouse', 'schema', 'role'];
      case DATABASE_TYPES.SINGLESTORE:
        return [...commonFields, 'host', 'port'];
      case DATABASE_TYPES.SUPABASE:
        return ['name', 'type', 'project_url', 'api_key', 'database'];
      default:
        return commonFields;
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      // Only include relevant fields for the selected database type
      const relevantFields = getFieldsForType(formData.type);
      const filteredVariables = Object.fromEntries(
        Object.entries(formData)
          .filter(([key]) => relevantFields.includes(key) && key !== 'name' && key !== 'type')
      );

      const transformedData = {
        db_type: formData.type,
        db_name: formData.name,
        db_variables: filteredVariables
      };

      const response = await api.createDatabase(transformedData);
      onAdd(response);
      onClose();
      setFormData({
        name: '',
        type: '',
        host: '',
        port: '',
        database: '',
        username: '',
        password: '',
        schema: '',
        warehouse: '',
        role: '',
        project_url: '',
        api_key: '',
      });
    } catch (error) {
      console.error('Failed to add database:', error);
      setError('Failed to add database. Please check your connection details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Database Connection</DialogTitle>
          <DialogDescription>
            Enter your database connection details below.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Connection Name</Label>
            <Input
              id="name"
              value={formData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
              placeholder="My Database"
              required
            />
          </div>

          <div>
            <Label htmlFor="type">Database Type</Label>
            <Select
              value={formData.type}
              onValueChange={handleTypeChange}
              required
            >
              <SelectTrigger>
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATABASE_TYPES).map(([key, value]) => (
                  <SelectItem key={value} value={value}>
                    {DATABASE_TYPE_LABELS[value]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {formData.type && (
            <>
              {formData.type === DATABASE_TYPES.SUPABASE ? (
                <>
                  <div>
                    <Label htmlFor="project_url">Project URL</Label>
                    <Input
                      id="project_url"
                      value={formData.project_url}
                      onChange={(e) => handleInputChange("project_url", e.target.value)}
                      placeholder="https://xxx.supabase.co"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="api_key">API Key</Label>
                    <Input
                      id="api_key"
                      type="password"
                      value={formData.api_key}
                      onChange={(e) => handleInputChange("api_key", e.target.value)}
                      placeholder="your-api-key"
                      required
                    />
                  </div>
                </>
              ) : (
                <>
                  <div>
                    <Label htmlFor="host">Host</Label>
                    <Input
                      id="host"
                      value={formData.host}
                      onChange={(e) => handleInputChange("host", e.target.value)}
                      placeholder="localhost"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="port">Port</Label>
                    <Input
                      id="port"
                      type="number"
                      value={formData.port}
                      onChange={(e) => handleInputChange("port", e.target.value)}
                      placeholder={DATABASE_TYPE_PORTS[formData.type]}
                      required
                    />
                  </div>
                </>
              )}

              <div>
                <Label htmlFor="database">Database Name</Label>
                <Input
                  id="database"
                  value={formData.database}
                  onChange={(e) => handleInputChange("database", e.target.value)}
                  placeholder="mydb"
                  required
                />
              </div>

              {formData.type !== DATABASE_TYPES.SUPABASE && (
                <>
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => handleInputChange("username", e.target.value)}
                      placeholder="user"
                      required
                    />
                  </div>

                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => handleInputChange("password", e.target.value)}
                      placeholder="••••••••"
                      required
                    />
                  </div>
                </>
              )}

              {formData.type === DATABASE_TYPES.POSTGRES && (
                <div>
                  <Label htmlFor="schema">Schema</Label>
                  <Input
                    id="schema"
                    value={formData.schema}
                    onChange={(e) => handleInputChange("schema", e.target.value)}
                    placeholder="public"
                  />
                </div>
              )}

              {formData.type === DATABASE_TYPES.SNOWFLAKE && (
                <>
                  <div>
                    <Label htmlFor="warehouse">Warehouse</Label>
                    <Input
                      id="warehouse"
                      value={formData.warehouse}
                      onChange={(e) => handleInputChange("warehouse", e.target.value)}
                      placeholder="COMPUTE_WH"
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="role">Role</Label>
                    <Input
                      id="role"
                      value={formData.role}
                      onChange={(e) => handleInputChange("role", e.target.value)}
                      placeholder="ACCOUNTADMIN"
                      required
                    />
                  </div>
                </>
              )}
            </>
          )}

          {error && (
            <div className="text-sm text-red-500">
              {error}
            </div>
          )}

          <div className="flex justify-end space-x-2">
            <Button variant="outline" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Adding...' : 'Add Connection'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
