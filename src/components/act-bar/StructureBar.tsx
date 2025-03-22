
import React from 'react';

interface StructureBarButtonProps {
  id: string;
  label: string;
  color: string;
  bgColor: string;
  isActive: boolean;
  onClick: () => void;
}

interface StructureBarProps {
  buttons: StructureBarButtonProps[];
}

const StructureBar: React.FC<StructureBarProps> = ({
  buttons
}) => {
  return (
    <div className="flex rounded-lg overflow-hidden w-full mb-2 border border-gray-200 dark:border-gray-700">
      {buttons.map((button, index) => (
        <div 
          key={button.id}
          onClick={button.onClick}
          className={`${button.bgColor} ${button.isActive ? 'ring-2 ring-inset ring-blue-500' : ''} flex-grow text-center py-2 cursor-pointer transition-all hover:brightness-95 active:brightness-90`}
          style={{ flex: 1 }}
        >
          <span className={`text-sm font-medium ${button.color}`}>
            {button.label}
          </span>
        </div>
      ))}
    </div>
  );
};

export default StructureBar;
