import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { MigrationList } from '../components/MigrationList';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@radix-ui/react-icons';
import { getMigrations } from '@/api/migrations';

export default function Migrations() {
  const navigate = useNavigate();
  
  const { data: migrations = [], isLoading } = useQuery({
    queryKey: ['migrations'],
    queryFn: getMigrations,
    refetchInterval: 5000,
  });

  if (isLoading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Migrations</h2>
        <Button onClick={() => navigate('/migrations/new')}>
          <PlusIcon className="mr-2 h-4 w-4" /> New Migration
        </Button>
      </div>
      
      <MigrationList 
        migrations={migrations}
        onStart={(id) => console.log('Start migration', id)}
        onStop={(id) => console.log('Stop migration', id)}
        onRetry={(id) => console.log('Retry migration', id)}
      />
    </div>
  );
}
