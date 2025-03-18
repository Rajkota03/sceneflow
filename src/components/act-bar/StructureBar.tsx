
import React from 'react';
import { ActType } from '@/lib/types';
import { cn } from '@/lib/utils';

interface StructureBarButtonProps {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  onClick: () => void;
  beats?: Array<{id: string; title: string; description?: string; complete?: boolean;}>;
}

interface StructureBarProps {
  visibleActs: Array<StructureBarButtonProps>;
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
  className?: string;
}

const StructureBar: React.FC<StructureBarProps> = ({ 
  visibleActs,
  activeAct,
  onSelectAct,
  className
}) => {
  return (
    <div className={cn("rounded-lg overflow-hidden w-full border border-gray-200 dark:border-gray-700 flex shadow-sm", className)}>
      {visibleActs.map((actBtn) => (
        <div 
          key={actBtn.id}
          onClick={actBtn.onClick}
          className={cn(
            actBtn.bgColor, 
            actBtn.isActive ? 'ring-2 ring-inset ring-blue-500' : '',
            "flex-grow text-center py-2 cursor-pointer transition-all hover:brightness-95 active:brightness-90"
          )}
          style={{ flex: 1 }}
        >
          <span className={cn("text-sm font-medium", actBtn.color)}>
            {actBtn.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StructureBar;
