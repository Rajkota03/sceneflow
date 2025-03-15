
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const StructurePlaceholder: React.FC = () => {
  return (
    <div className="border rounded-lg p-4 hover:border-primary/70 transition-colors bg-white">
      <div className="flex justify-between items-start mb-2">
        <Skeleton className="h-6 w-40" />
        <Skeleton className="h-6 w-6 rounded" />
      </div>
      <Skeleton className="h-4 w-32 mb-3" />
      <div className="grid grid-cols-3 gap-1 mb-3">
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
        <Skeleton className="h-2 w-full" />
      </div>
      <Skeleton className="h-3 w-24" />
    </div>
  );
};

export default StructurePlaceholder;
