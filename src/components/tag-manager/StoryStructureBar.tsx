
import React from 'react';
import { ActType, Structure } from '@/lib/types';
import { Button } from '../ui/button';

interface StoryStructureBarProps {
  acts: Array<{
    id: string;
    label: string;
    color: string;
    bgColor: string;
  }>;
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
}

const StoryStructureBar: React.FC<StoryStructureBarProps> = ({
  acts,
  activeAct,
  onSelectAct
}) => {
  return (
    <div className="mb-4">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <h3 className="text-sm font-medium mr-2 text-gray-700 dark:text-gray-300">
            Story Structure
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
      
      {/* Structure Bar */}
      <div className="flex rounded-lg overflow-hidden w-full border border-gray-200 dark:border-gray-700">
        {acts.map((act, index) => {
          const isActive = activeAct === act.id;
          const handleActClick = () => {
            onSelectAct(act.id as ActType);
          };
          
          return (
            <div 
              key={act.id}
              onClick={handleActClick}
              className={`${act.bgColor} ${isActive ? 'ring-2 ring-inset ring-blue-500' : ''} flex-grow text-center py-2 cursor-pointer transition-all hover:brightness-95 active:brightness-90`}
              style={{ flex: 1 }}
            >
              <span className={`text-sm font-medium ${act.color}`}>
                {act.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default StoryStructureBar;
