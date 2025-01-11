import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { getMigration } from '../api/migrations';
import { formatDistanceToNow, format } from 'date-fns';

export const MigrationDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { data: migration, isLoading } = useQuery({
    queryKey: ['migration', id],
    queryFn: () => getMigration(id!),
    refetchInterval: (data) => (data?.status === 'running' ? 1000 : false),
  });

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (!migration) {
    return <div>Migration not found</div>;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'running':
        return 'bg-blue-100 text-blue-800';
      case 'failed':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="space-y-8">
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex justify-between items-start">
            <div>
              <h3 className="text-lg font-medium leading-6 text-gray-900">
                {migration.name}
              </h3>
              <p className="mt-1 max-w-2xl text-sm text-gray-500">
                Created {formatDistanceToNow(new Date(migration.createdAt), { addSuffix: true })}
              </p>
            </div>
            <span
              className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(
                migration.status
              )}`}
            >
              {migration.status}
            </span>
          </div>

          <div className="mt-6 border-t border-gray-200 pt-6">
            <dl className="grid grid-cols-1 gap-x-4 gap-y-6 sm:grid-cols-2">
              <div>
                <dt className="text-sm font-medium text-gray-500">Source Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{migration.sourceType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Destination Type</dt>
                <dd className="mt-1 text-sm text-gray-900">{migration.destinationType}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Current Step</dt>
                <dd className="mt-1 text-sm text-gray-900">{migration.currentStep}</dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-gray-500">Progress</dt>
                <dd className="mt-1">
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div
                      className="bg-blue-600 h-2.5 rounded-full"
                      style={{ width: `${migration.progress * 100}%` }}
                    ></div>
                  </div>
                  <span className="text-sm text-gray-500 mt-1">
                    {Math.round(migration.progress * 100)}%
                  </span>
                </dd>
              </div>
              {migration.schedule && (
                <div>
                  <dt className="text-sm font-medium text-gray-500">Schedule</dt>
                  <dd className="mt-1 text-sm text-gray-900">
                    {migration.schedule.frequency} at {migration.schedule.time}
                    {migration.schedule.nextRun && (
                      <div className="text-sm text-gray-500">
                        Next run: {format(new Date(migration.schedule.nextRun), 'PPpp')}
                      </div>
                    )}
                  </dd>
                </div>
              )}
              {migration.errorMessage && (
                <div className="sm:col-span-2">
                  <dt className="text-sm font-medium text-red-500">Error</dt>
                  <dd className="mt-1 text-sm text-red-700 bg-red-50 p-4 rounded-md">
                    {migration.errorMessage}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>
      </div>

      {/* Timeline */}
      <div className="bg-white shadow sm:rounded-lg">
        <div className="px-4 py-5 sm:p-6">
          <h3 className="text-lg font-medium leading-6 text-gray-900 mb-4">Timeline</h3>
          <div className="flow-root">
            <ul className="-mb-8">
              {[
                {
                  time: migration.createdAt,
                  title: 'Migration Created',
                  description: `Migration "${migration.name}" was created`,
                },
                ...(migration.startedAt
                  ? [
                      {
                        time: migration.startedAt,
                        title: 'Migration Started',
                        description: 'Started processing data',
                      },
                    ]
                  : []),
                ...(migration.completedAt
                  ? [
                      {
                        time: migration.completedAt,
                        title: `Migration ${migration.status === 'completed' ? 'Completed' : 'Failed'}`,
                        description:
                          migration.status === 'completed'
                            ? 'Successfully completed the migration'
                            : `Failed: ${migration.errorMessage}`,
                      },
                    ]
                  : []),
              ].map((event, eventIdx) => (
                <li key={event.time}>
                  <div className="relative pb-8">
                    {eventIdx !== 2 && (
                      <span
                        className="absolute top-4 left-4 -ml-px h-full w-0.5 bg-gray-200"
                        aria-hidden="true"
                      />
                    )}
                    <div className="relative flex space-x-3">
                      <div>
                        <span className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center ring-8 ring-white">
                          <svg
                            className="h-5 w-5 text-white"
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 20 20"
                            fill="currentColor"
                          >
                            <path
                              fillRule="evenodd"
                              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.857-9.809a.75.75 0 00-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 10-1.06 1.061l2.5 2.5a.75.75 0 001.137-.089l4-5.5z"
                              clipRule="evenodd"
                            />
                          </svg>
                        </span>
                      </div>
                      <div className="min-w-0 flex-1 pt-1.5">
                        <div>
                          <p className="text-sm text-gray-500">
                            {format(new Date(event.time), 'PPpp')}
                          </p>
                          <p className="mt-1 text-sm font-medium text-gray-900">{event.title}</p>
                          <p className="mt-1 text-sm text-gray-500">{event.description}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
