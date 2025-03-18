
import React from 'react';
import { ActType } from '@/lib/types';

interface StructureBarButtonProps {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  onClick: () => void;
}

interface StructureBarProps {
  visibleActs: Array<StructureBarButtonProps>;
  activeAct: ActType | null;
  onSelectAct: (act: ActType | null) => void;
}

const StructureBar: React.FC<StructureBarProps> = ({ 
  visibleActs,
  activeAct,
  onSelectAct
}) => {
  return (
    <div className="rounded-lg overflow-hidden w-full border border-gray-200 dark:border-gray-700 flex">
      {visibleActs.map((actBtn, index) => {
        return (
          <div 
            key={actBtn.id}
            onClick={actBtn.onClick}
            className={`${actBtn.bgColor} ${actBtn.isActive ? 'ring-2 ring-inset ring-blue-500' : ''} flex-grow text-center py-2 cursor-pointer transition-all hover:brightness-95 active:brightness-90`}
            style={{ flex: 1 }}
          >
            <span className={`text-sm font-medium ${actBtn.color}`}>
              {actBtn.label}
            </span>
          </div>
        );
      })}
    </div>
  );
};

export default StructureBar;
