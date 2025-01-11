import React from 'react';
import { MigrationMetrics as Metrics } from '../types/migration';

interface Props {
  metrics: Metrics;
}

export const MigrationMetrics: React.FC<Props> = ({ metrics }) => {
  const stats = [
    {
      name: 'Total Migrations',
      value: metrics.totalMigrations,
    },
    {
      name: 'Successful',
      value: metrics.successfulMigrations,
      color: 'text-green-600',
    },
    {
      name: 'Failed',
      value: metrics.failedMigrations,
      color: 'text-red-600',
    },
    {
      name: 'Rows Processed',
      value: metrics.totalRowsProcessed.toLocaleString(),
    },
    {
      name: 'Avg. Throughput',
      value: `${Math.round(metrics.averageThroughput).toLocaleString()} rows/s`,
      color: 'text-blue-600',
    },
  ];

  return (
    <div className="bg-white shadow rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Migration Metrics</h3>
      <dl className="grid grid-cols-1 gap-5 sm:grid-cols-5">
        {stats.map((stat) => (
          <div
            key={stat.name}
            className="px-4 py-5 bg-gray-50 shadow rounded-lg overflow-hidden sm:p-6"
          >
            <dt className="text-sm font-medium text-gray-500 truncate">{stat.name}</dt>
            <dd className={`mt-1 text-3xl font-semibold ${stat.color || 'text-gray-900'}`}>
              {stat.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
};
