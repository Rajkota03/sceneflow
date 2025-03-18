
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { useFormat } from '@/lib/formatContext';
import { Button } from '@/components/ui/button';
import { type Theme } from '@/lib/themeContext';

interface ZoomControlsProps {
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
  theme?: Theme;
}

const ZoomControls = ({ zoomPercentage, onZoomChange, theme = 'light' }: ZoomControlsProps) => {
  const { zoomIn, zoomOut, resetZoom } = useFormat();

  const themeClasses = theme === 'dark' 
    ? 'bg-slate-800 border-slate-700 text-slate-300' 
    : 'bg-white border-gray-200 text-gray-700';
  
  return (
    <div className={`absolute z-30 bottom-10 right-10 flex items-center gap-2 p-2 rounded-lg border shadow-sm ${themeClasses} transition-colors duration-200`}>
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomOut}
        className="h-8 w-8 p-0 rounded-full"
      >
        <ZoomOut size={16} />
      </Button>
      
      <Slider
        value={[zoomPercentage]}
        onValueChange={onZoomChange}
        min={50}
        max={150}
        step={5}
        className="w-32 mx-1"
      />
      
      <Button
        variant="ghost"
        size="sm"
        onClick={zoomIn}
        className="h-8 w-8 p-0 rounded-full"
      >
        <ZoomIn size={16} />
      </Button>
      
      <div className="text-xs min-w-[40px] text-center font-medium">
        {zoomPercentage}%
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        onClick={resetZoom}
        className="text-xs h-6 px-2"
      >
        Reset
      </Button>
    </div>
  );
};

export default ZoomControls;
