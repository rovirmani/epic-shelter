import React, { useState, useEffect } from 'react';
import { api } from '@/lib/api';
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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { DatePicker } from "@/components/ui/date-picker";

export function ScheduleMigrationModal({ isOpen, onClose, onSchedule }) {
  const [migrationData, setMigrationData] = useState({
    name: "",
    source: "",
    destination: "",
    schedule: "now",
    date: new Date(),
    isRecurring: false,
    interval: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  });

  const [databases, setDatabases] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDatabases = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const data = await api.fetchDatabases(); 
        setDatabases(data || []);
      } catch (err) {
        console.error('Failed to fetch databases:', err);
        setError('Failed to load available databases');
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchDatabases();
    }
  }, [isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setIsLoading(true);
      setError(null);
      
      if (!migrationData.name || !migrationData.source || !migrationData.destination) {
        throw new Error('Please fill in all required fields');
      }
      
      const migrationRequest = {
        migration_name: migrationData.name,
        source_uuid: migrationData.source,
        target_uuid: migrationData.destination,
        source_type: databases.find(db => db.db_uuid === migrationData.source)?.db_type,
        target_type: databases.find(db => db.db_uuid === migrationData.destination)?.db_type,
        scheduled_time: migrationData.schedule === 'later' ? migrationData.date.toISOString() : null,
        is_recurring: migrationData.isRecurring,
        interval: migrationData.isRecurring ? migrationData.interval : null
      };
      
      const response = await api.createMigration(migrationRequest);
      onSchedule(response);
      onClose();
      
      setMigrationData({
        name: "",
        source: "",
        destination: "",
        schedule: "now",
        date: new Date(),
        isRecurring: false,
        interval: {
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0
        }
      });
    } catch (err) {
      console.error('Failed to schedule migration:', err);
      setError(err.message || 'Failed to schedule migration');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Schedule Migration</DialogTitle>
          <DialogDescription>
            Create a new migration between two databases
          </DialogDescription>
        </DialogHeader>
        
        {error && (
          <div className="bg-red-50 text-red-500 p-2 rounded-md mb-4">
            {error}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Migration Name</Label>
            <Input
              id="name"
              value={migrationData.name}
              onChange={(e) => setMigrationData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter migration name"
              disabled={isLoading}
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="source">Source Database</Label>
            <Select
              value={migrationData.source}
              onValueChange={(value) => setMigrationData(prev => ({ ...prev, source: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select source database" />
              </SelectTrigger>
              <SelectContent>
                {databases.map((db) => (
                  <SelectItem key={db.db_uuid} value={db.db_uuid}>
                    {db.db_name} ({db.db_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="destination">Destination Database</Label>
            <Select
              value={migrationData.destination}
              onValueChange={(value) => setMigrationData(prev => ({ ...prev, destination: value }))}
              disabled={isLoading}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select destination database" />
              </SelectTrigger>
              <SelectContent>
                {databases.map((db) => (
                  <SelectItem key={db.db_uuid} value={db.db_uuid}>
                    {db.db_name} ({db.db_type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <Label>Schedule</Label>
            <Tabs
              value={migrationData.schedule}
              onValueChange={(value) => setMigrationData(prev => ({ ...prev, schedule: value }))}
              disabled={isLoading}
            >
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="now">Run Now</TabsTrigger>
                <TabsTrigger value="later">Schedule Later</TabsTrigger>
              </TabsList>
              
              <TabsContent value="later" className="space-y-4">
                <div className="space-y-2">
                  <Label>Start Date & Time</Label>
                  <DatePicker
                    date={migrationData.date}
                    setDate={(date) => setMigrationData(prev => ({ ...prev, date }))}
                    disabled={isLoading}
                  />
                </div>
                
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="recurring"
                    checked={migrationData.isRecurring}
                    onCheckedChange={(checked) => setMigrationData(prev => ({ ...prev, isRecurring: checked }))}
                    disabled={isLoading}
                  />
                  <Label htmlFor="recurring">Recurring Migration</Label>
                </div>
                
                {migrationData.isRecurring && (
                  <div className="grid grid-cols-4 gap-2">
                    <div>
                      <Label>Days</Label>
                      <Input
                        type="number"
                        min="0"
                        value={migrationData.interval.days}
                        onChange={(e) => setMigrationData(prev => ({
                          ...prev,
                          interval: { ...prev.interval, days: parseInt(e.target.value) || 0 }
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label>Hours</Label>
                      <Input
                        type="number"
                        min="0"
                        max="23"
                        value={migrationData.interval.hours}
                        onChange={(e) => setMigrationData(prev => ({
                          ...prev,
                          interval: { ...prev.interval, hours: parseInt(e.target.value) || 0 }
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label>Minutes</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={migrationData.interval.minutes}
                        onChange={(e) => setMigrationData(prev => ({
                          ...prev,
                          interval: { ...prev.interval, minutes: parseInt(e.target.value) || 0 }
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                    <div>
                      <Label>Seconds</Label>
                      <Input
                        type="number"
                        min="0"
                        max="59"
                        value={migrationData.interval.seconds}
                        onChange={(e) => setMigrationData(prev => ({
                          ...prev,
                          interval: { ...prev.interval, seconds: parseInt(e.target.value) || 0 }
                        }))}
                        disabled={isLoading}
                      />
                    </div>
                  </div>
                )}
              </TabsContent>
            </Tabs>
          </div>
          
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Scheduling...' : 'Schedule Migration'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
