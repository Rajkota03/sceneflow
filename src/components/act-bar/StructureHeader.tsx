
import React from 'react';
import { Button } from '../ui/button';

interface StructureHeaderProps {
  title?: string;
}

const StructureHeader: React.FC<StructureHeaderProps> = ({ title = "Story Structure" }) => {
  return (
    <div className="flex items-center justify-between mb-2">
      <div className="flex items-center">
        <h3 className="text-sm font-medium mr-2 text-gray-700 dark:text-gray-300">
          {title}
        </h3>
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-7 px-2 text-xs text-gray-600 dark:text-gray-400"
      >
        Free Mode
      </Button>
    </div>
  );
};

export default StructureHeader;
