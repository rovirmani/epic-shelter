import React, { useState } from 'react';
import { MigrationCreate, MigrationType, Schedule } from '../types/migration';
import { ScheduleBuilder } from './ScheduleBuilder';

interface Props {
  onSubmit: (migration: MigrationCreate) => void;
  onCancel: () => void;
}

export const CreateMigration: React.FC<Props> = ({ onSubmit, onCancel }) => {
  const [formData, setFormData] = useState<MigrationCreate>({
    name: '',
    sourceType: 'singlestore',
    sourceConfig: {},
    destinationType: 'hydrolix',
    destinationConfig: {},
    sourceQuery: '',
    destinationTable: '',
  });

  const [schedule, setSchedule] = useState<Schedule | undefined>();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      ...formData,
      schedule,
    });
  };

  return (
    <div className="bg-white shadow sm:rounded-lg p-6">
      <form onSubmit={handleSubmit} className="space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700">Name</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source Query</label>
          <textarea
            required
            rows={3}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.sourceQuery}
            onChange={(e) => setFormData({ ...formData, sourceQuery: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination Table</label>
          <input
            type="text"
            required
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
            value={formData.destinationTable}
            onChange={(e) => setFormData({ ...formData, destinationTable: e.target.value })}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Source Configuration</label>
          <textarea
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
            value={JSON.stringify(formData.sourceConfig, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                setFormData({ ...formData, sourceConfig: config });
              } catch {} // Allow invalid JSON while typing
            }}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Destination Configuration</label>
          <textarea
            required
            rows={4}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 font-mono text-sm"
            value={JSON.stringify(formData.destinationConfig, null, 2)}
            onChange={(e) => {
              try {
                const config = JSON.parse(e.target.value);
                setFormData({ ...formData, destinationConfig: config });
              } catch {} // Allow invalid JSON while typing
            }}
          />
        </div>

        <ScheduleBuilder value={schedule} onChange={setSchedule} />

        <div className="flex justify-end space-x-3">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            Create Migration
          </button>
        </div>
      </form>
    </div>
  );
};
