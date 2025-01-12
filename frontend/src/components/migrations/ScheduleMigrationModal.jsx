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
import { format } from "date-fns";

export function ScheduleMigrationModal({ isOpen, onClose, onSchedule, connections }) {
  const [migrationData, setMigrationData] = useState({
    name: "",
    source: "",
    destination: "",
    schedule: "now", // "now" or "scheduled"
    date: new Date(),
    isRecurring: false,
    interval: {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0
    }
  });

  const handleInputChange = (field, value) => {
    setMigrationData(prev => ({ ...prev, [field]: value }));
  };

  const handleIntervalChange = (field, value) => {
    const numValue = parseInt(value) || 0;
    setMigrationData(prev => ({
      ...prev,
      interval: {
        ...prev.interval,
        [field]: numValue
      }
    }));
  };

  const handleSchedule = () => {
    const sourceDb = connections.find(c => c.id === migrationData.source);
    const destDb = connections.find(c => c.id === migrationData.destination);
    
    let scheduleDetails = null;
    if (migrationData.schedule === "scheduled") {
      const scheduledDateTime = new Date(migrationData.date);
      
      // Only include interval if it's recurring
      const intervalMs = migrationData.isRecurring ? 
        (migrationData.interval.days * 24 * 60 * 60 * 1000) +
        (migrationData.interval.hours * 60 * 60 * 1000) +
        (migrationData.interval.minutes * 60 * 1000) +
        (migrationData.interval.seconds * 1000)
        : 0;

      scheduleDetails = {
        startTime: scheduledDateTime.toISOString(),
        intervalMs: intervalMs,
        isRecurring: migrationData.isRecurring
      };
    }
    
    const scheduleData = {
      ...migrationData,
      source: sourceDb?.name,
      sourceType: sourceDb?.type,
      destination: destDb?.name,
      destinationType: destDb?.type,
      status: migrationData.schedule === "now" ? "running" : "scheduled",
      scheduleDetails
    };

    onSchedule(scheduleData);
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
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Schedule Migration</DialogTitle>
        </DialogHeader>

        <div className="grid gap-6 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Migration Name</Label>
            <Input
              id="name"
              placeholder="Production DB Sync"
              value={migrationData.name}
              onChange={(e) => handleInputChange("name", e.target.value)}
            />
          </div>

          <div className="grid gap-4">
            <div className="grid gap-2">
              <Label>Source Database</Label>
              <Select 
                value={migrationData.source}
                onValueChange={(value) => handleInputChange("source", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select source database" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn) => (
                    <SelectItem key={conn.id} value={conn.id}>
                      <span className="flex items-center">
                        <span className="mr-2">{conn.type === 'supabase' ? '⚡' : '🗄️'}</span>
                        {conn.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label>Destination Database</Label>
              <Select
                value={migrationData.destination}
                onValueChange={(value) => handleInputChange("destination", value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select destination database" />
                </SelectTrigger>
                <SelectContent>
                  {connections.map((conn) => (
                    <SelectItem 
                      key={conn.id} 
                      value={conn.id}
                      disabled={conn.id === migrationData.source}
                    >
                      <span className="flex items-center">
                        <span className="mr-2">{conn.type === 'supabase' ? '⚡' : '🗄️'}</span>
                        {conn.name}
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label>Schedule</Label>
            <Tabs 
              value={migrationData.schedule}
              onValueChange={(value) => handleInputChange("schedule", value)}
              className="w-full"
            >
              <TabsList>
                <TabsTrigger value="now">Run Now</TabsTrigger>
                <TabsTrigger value="scheduled">Schedule</TabsTrigger>
              </TabsList>
              <TabsContent value="scheduled" className="mt-4">
                <div className="grid gap-4">
                  <div className="mt-4">
                    <DatePicker
                      value={migrationData.date}
                      onChange={(date) => handleInputChange("date", date || new Date())}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="recurring"
                      checked={migrationData.isRecurring}
                      onCheckedChange={(checked) => handleInputChange("isRecurring", checked)}
                    />
                    <Label htmlFor="recurring" className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70">
                      Repeat this migration
                    </Label>
                  </div>

                  {migrationData.isRecurring && (
                    <div className="grid gap-2">
                      <Label>Repeat every</Label>
                      <div className="grid grid-cols-4 gap-4">
                        <div className="space-y-2">
                          <Label className="text-sm">Days</Label>
                          <Input
                            type="number"
                            min="0"
                            value={migrationData.interval.days}
                            onChange={(e) => handleIntervalChange("days", e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Hours</Label>
                          <Input
                            type="number"
                            min="0"
                            max="23"
                            value={migrationData.interval.hours}
                            onChange={(e) => handleIntervalChange("hours", e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Minutes</Label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={migrationData.interval.minutes}
                            onChange={(e) => handleIntervalChange("minutes", e.target.value)}
                            className="w-full"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-sm">Seconds</Label>
                          <Input
                            type="number"
                            min="0"
                            max="59"
                            value={migrationData.interval.seconds}
                            onChange={(e) => handleIntervalChange("seconds", e.target.value)}
                            className="w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        <div className="flex justify-end space-x-4">
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button 
            onClick={handleSchedule}
            disabled={!migrationData.name || !migrationData.source || !migrationData.destination}
            className="bg-purple-600 hover:bg-purple-700 text-white"
          >
            {migrationData.schedule === "now" ? "Start Migration" : "Schedule Migration"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
