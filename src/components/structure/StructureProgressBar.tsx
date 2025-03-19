
import React from 'react';
import { Act } from '@/lib/types';
import { Progress } from '../ui/progress';

export interface StructureProgressBarProps {
  structure?: {
    id: string;
    name: string;
    acts: Act[];
  };
  acts?: Act[];
  progress?: number;
}

const StructureProgressBar: React.FC<StructureProgressBarProps> = ({ 
  structure, 
  acts = structure?.acts || [],
  progress = 0 
}) => {
  return (
    <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden relative mb-2">
      {acts.map((act, index) => (
        <div
          key={index}
          className="absolute h-full"
          style={{
            left: `${act.startPosition}%`,
            width: `${act.endPosition - act.startPosition}%`,
            backgroundColor: act.colorHex,
          }}
        />
      ))}
      
      <div 
        className="absolute h-full bg-green-500 opacity-30"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export default StructureProgressBar;
