import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
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

const DATABASE_TYPES = {
  postgres: {
    name: "PostgreSQL",
    icon: "🐘",
    fields: [
      { key: "host", label: "Host", type: "text", required: true },
      { key: "port", label: "Port", type: "text", defaultValue: "5432" },
      { key: "database", label: "Database Name", type: "text", required: true },
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true },
      { key: "schema", label: "Schema", type: "text", defaultValue: "public" },
      { key: "ssl_mode", label: "SSL Mode", type: "text", defaultValue: "require" },
    ]
  },
  mysql: {
    name: "MySQL",
    icon: "🐬",
    fields: [
      { key: "host", label: "Host", type: "text", required: true },
      { key: "port", label: "Port", type: "text", defaultValue: "3306" },
      { key: "database", label: "Database Name", type: "text", required: true },
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true },
    ]
  },
  supabase: {
    name: "Supabase",
    icon: "⚡",
    fields: [
      { key: "project_url", label: "Project URL", type: "text", required: true },
      { key: "api_key", label: "API Key", type: "password", required: true },
      { key: "database", label: "Database Name", type: "text", required: true },
    ]
  },
  singlestore: {
    name: "SingleStore",
    icon: "💫",
    fields: [
      { key: "host", label: "Host", type: "text", required: true },
      { key: "port", label: "Port", type: "text", defaultValue: "3306" },
      { key: "database", label: "Database Name", type: "text", required: true },
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true },
      { key: "cluster_id", label: "Cluster ID", type: "text", required: true },
    ]
  },
  snowflake: {
    name: "Snowflake",
    icon: "❄️",
    fields: [
      { key: "account", label: "Account Identifier", type: "text", required: true },
      { key: "warehouse", label: "Warehouse", type: "text", required: true },
      { key: "database", label: "Database", type: "text", required: true },
      { key: "schema", label: "Schema", type: "text", required: true },
      { key: "username", label: "Username", type: "text", required: true },
      { key: "password", label: "Password", type: "password", required: true },
      { key: "role", label: "Role", type: "text", required: true },
    ]
  }
};

export function AddDatabaseModal({ isOpen, onClose, onAdd }) {
  const [selectedType, setSelectedType] = useState("");
  const [formData, setFormData] = useState({});
  const [connectionName, setConnectionName] = useState("");

  const handleTypeChange = (value) => {
    setSelectedType(value);
    setFormData({});
  };

  const handleInputChange = (key, value) => {
    setFormData(prev => ({ ...prev, [key]: value }));
  };

  const handleSubmit = () => {
    const dbConfig = {
      id: Date.now(),
      name: connectionName,
      type: selectedType,
      config: formData,
    };
    onAdd(dbConfig);
    onClose();
    setSelectedType("");
    setFormData({});
    setConnectionName("");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add Database Connection</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Connection Name</Label>
            <Input
              id="name"
              placeholder="My Production Database"
              value={connectionName}
              onChange={(e) => setConnectionName(e.target.value)}
            />
          </div>

          <div className="grid gap-2">
            <Label>Database Type</Label>
            <Select value={selectedType} onValueChange={handleTypeChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select database type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(DATABASE_TYPES).map(([key, { name, icon }]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center">
                      <span className="mr-2">{icon}</span>
                      {name}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {selectedType && (
            <div className="grid gap-4">
              <h3 className="font-medium">Connection Details</h3>
              {DATABASE_TYPES[selectedType].fields.map((field) => (
                <div key={field.key} className="grid gap-2">
                  <Label htmlFor={field.key}>
                    {field.label}
                    {field.required && <span className="text-red-500 ml-1">*</span>}
                  </Label>
                  <Input
                    id={field.key}
                    type={field.type}
                    placeholder={field.label}
                    defaultValue={field.defaultValue}
                    onChange={(e) => handleInputChange(field.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSubmit}
            disabled={!selectedType || !connectionName}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            Add Connection
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
