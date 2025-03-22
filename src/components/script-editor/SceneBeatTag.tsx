
import React from 'react';
import { Beat, Act } from '@/lib/types';
import { Flame } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SceneBeatTagProps {
  beatId: string;
  structure: {
    acts: Act[];
  } | null;
  onClick?: () => void;
  className?: string;
}

const SceneBeatTag: React.FC<SceneBeatTagProps> = ({
  beatId,
  structure,
  onClick,
  className
}) => {
  if (!structure || !beatId) return null;
  
  // Find beat and act info
  let beatTitle = '';
  let actColor = '#888888';
  
  for (const act of structure.acts) {
    const beat = act.beats?.find(b => b.id === beatId);
    if (beat) {
      beatTitle = beat.title;
      actColor = act.colorHex || getDefaultActColor(act.id);
      break;
    }
  }
  
  if (!beatTitle) return null;
  
  // Default colors when not specified
  function getDefaultActColor(actId: string) {
    const actColors: Record<string, string> = {
      'act1': '#B0C4DE', // Light Steel Blue
      'act2a': '#F5DEB3', // Wheat
      'midpoint': '#D8BFD8', // Thistle
      'act2b': '#DEB887', // Burly Wood
      'act3': '#A2BBA3', // Sage Green
    };
    
    return actColors[actId] || '#888888';
  }
  
  return (
    <div 
      className={cn(
        "inline-flex items-center px-2 py-0.5 rounded-full text-xs cursor-pointer",
        "hover:opacity-90 active:opacity-80 transition-opacity",
        className
      )}
      style={{ 
        backgroundColor: actColor,
        color: '#333' 
      }}
      onClick={onClick}
    >
      <Flame size={12} className="mr-1" />
      {beatTitle}
    </div>
  );
};

export default SceneBeatTag;
