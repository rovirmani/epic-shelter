import React, { useState, useEffect } from 'react';
import { Schedule } from '../types/migration';
import cronstrue from 'cronstrue';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';

interface Props {
  value?: Schedule;
  onChange: (schedule: Schedule | undefined) => void;
}

interface TimeConfig {
  type: 'every' | 'specific';
  minutes: string;
  hours: string;
  daysOfWeek: string[];
  daysOfMonth: string[];
}

const WEEKDAYS = [
  { value: '0', label: 'Sunday' },
  { value: '1', label: 'Monday' },
  { value: '2', label: 'Tuesday' },
  { value: '3', label: 'Wednesday' },
  { value: '4', label: 'Thursday' },
  { value: '5', label: 'Friday' },
  { value: '6', label: 'Saturday' },
];

export const ScheduleBuilder: React.FC<Props> = ({ value, onChange }) => {
  const [enabled, setEnabled] = useState(!!value);
  const [timeConfig, setTimeConfig] = useState<TimeConfig>({
    type: 'specific',
    minutes: '0',
    hours: '0',
    daysOfWeek: [],
    daysOfMonth: [],
  });

  const buildCronExpression = (config: TimeConfig): string => {
    const minutes = config.type === 'every' ? '*/15' : config.minutes;
    const hours = config.type === 'every' ? '*' : config.hours;
    const daysOfMonth = config.daysOfMonth.length ? config.daysOfMonth.join(',') : '*';
    const daysOfWeek = config.daysOfWeek.length ? config.daysOfWeek.join(',') : '*';
    
    return `${minutes} ${hours} ${daysOfMonth} * ${daysOfWeek}`;
  };

  useEffect(() => {
    if (!enabled) {
      onChange(undefined);
      return;
    }

    const expression = buildCronExpression(timeConfig);
    try {
      const description = cronstrue.toString(expression);
      onChange({
        expression,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        description,
      });
    } catch (error) {
      console.error('Invalid cron expression:', error);
    }
  }, [enabled, timeConfig, onChange]);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-medium">Schedule Migration</CardTitle>
          <Switch
            checked={enabled}
            onCheckedChange={setEnabled}
          />
        </div>
      </CardHeader>
      {enabled && (
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label>Frequency Type</Label>
              <Select
                value={timeConfig.type}
                onValueChange={(value) => setTimeConfig({ ...timeConfig, type: value as 'every' | 'specific' })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="specific">At specific times</SelectItem>
                  <SelectItem value="every">Every X minutes</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {timeConfig.type === 'specific' ? (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Hour (0-23)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="23"
                    value={timeConfig.hours}
                    onChange={(e) => setTimeConfig({ ...timeConfig, hours: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Minute (0-59)</Label>
                  <Input
                    type="number"
                    min="0"
                    max="59"
                    value={timeConfig.minutes}
                    onChange={(e) => setTimeConfig({ ...timeConfig, minutes: e.target.value })}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Label>Run every X minutes</Label>
                <Select
                  value={timeConfig.minutes.replace('*/', '')}
                  onValueChange={(value) => setTimeConfig({ ...timeConfig, minutes: `*/${value}` })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select interval" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="15">15 minutes</SelectItem>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            )}

            <div className="space-y-2">
              <Label>Days of Week</Label>
              <div className="grid grid-cols-4 gap-2">
                {WEEKDAYS.map((day) => (
                  <Button
                    key={day.value}
                    variant={timeConfig.daysOfWeek.includes(day.value) ? "default" : "outline"}
                    className="w-full"
                    onClick={() => {
                      const newDays = timeConfig.daysOfWeek.includes(day.value)
                        ? timeConfig.daysOfWeek.filter((d) => d !== day.value)
                        : [...timeConfig.daysOfWeek, day.value];
                      setTimeConfig({ ...timeConfig, daysOfWeek: newDays });
                    }}
                  >
                    {day.label.slice(0, 3)}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Leave unselected to run every day</p>
            </div>

            <div className="space-y-2">
              <Label>Days of Month</Label>
              <div className="grid grid-cols-7 gap-1">
                {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => (
                  <Button
                    key={day}
                    variant={timeConfig.daysOfMonth.includes(day.toString()) ? "default" : "outline"}
                    className="w-full h-8 text-xs"
                    onClick={() => {
                      const newDays = timeConfig.daysOfMonth.includes(day.toString())
                        ? timeConfig.daysOfMonth.filter((d) => d !== day.toString())
                        : [...timeConfig.daysOfMonth, day.toString()].sort((a, b) => Number(a) - Number(b));
                      setTimeConfig({ ...timeConfig, daysOfMonth: newDays });
                    }}
                  >
                    {day}
                  </Button>
                ))}
              </div>
              <p className="text-sm text-muted-foreground">Leave unselected to run every day of the month</p>
            </div>
          </div>

          {value?.description && (
            <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-4">
              <h4 className="text-sm font-medium">Schedule Preview</h4>
              <p className="mt-1 text-sm text-muted-foreground">{value.description}</p>
              <p className="mt-1 text-xs text-muted-foreground">Timezone: {value.timezone}</p>
            </div>
          )}
        </CardContent>
      )}
    </Card>
  );
};
