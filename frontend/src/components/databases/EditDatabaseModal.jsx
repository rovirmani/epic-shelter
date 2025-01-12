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
import { Card, CardContent } from "@/components/ui/card";

export function EditDatabaseModal({ isOpen, onClose, onSave, database }) {
  const [formData, setFormData] = useState({
    name: '',
    type: '',
    ...database?.db_variables,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (database) {
      setFormData({
        name: database.db_name,
        type: database.db_type,
        ...database.db_variables,
      });
    }
  }, [database]);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const getFieldsForType = (type) => {
    const commonFields = ['host', 'port', 'database', 'username', 'password'];
    
    switch (type?.toLowerCase()) {
      case 'snowflake':
        return [...commonFields, 'warehouse', 'schema', 'role'];
      case 'supabase':
        return ['project_url', 'api_key'];
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
        db_uuid: database.db_uuid,
        db_type: formData.type,
        db_name: formData.name,
        db_variables: filteredVariables
      };

      const response = await api.updateDatabase(transformedData);
      onSave(response);
      onClose();
    } catch (error) {
      console.error('Failed to update database:', error);
      setError('Failed to update database. Please check your connection details.');
    } finally {
      setIsLoading(false);
    }
  };

  const renderFields = () => {
    const fields = getFieldsForType(formData.type);
    
    return fields.map(field => (
      <div key={field} className="grid gap-2">
        <Label htmlFor={field}>
          {field.charAt(0).toUpperCase() + field.slice(1)}
        </Label>
        <Input
          id={field}
          type={field === 'password' ? 'password' : 'text'}
          value={formData[field] || ''}
          onChange={(e) => handleInputChange(field, e.target.value)}
        />
      </div>
    ));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Database Connection</DialogTitle>
          <DialogDescription>
            Update your database connection details. Click save when you're done.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <Card>
            <CardContent className="space-y-4 pt-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Display Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                />
              </div>
              {renderFields()}
              {error && (
                <div className="text-sm text-red-500 mt-2">
                  {error}
                </div>
              )}
              <div className="flex justify-end space-x-2 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={onClose}
                  disabled={isLoading}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? 'Saving...' : 'Save Changes'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </form>
      </DialogContent>
    </Dialog>
  );
}
