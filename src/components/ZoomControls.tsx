
import React from 'react';
import { Slider } from '@/components/ui/slider';
import { Button } from '@/components/ui/button';
import { Minus, Plus, Maximize2 } from 'lucide-react';

interface ZoomControlsProps {
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({
  zoomPercentage,
  onZoomChange
}) => {
  const handleZoomOut = () => {
    onZoomChange([Math.max(zoomPercentage - 10, 50)]);
  };

  const handleZoomIn = () => {
    onZoomChange([Math.min(zoomPercentage + 10, 150)]);
  };

  const handleReset = () => {
    onZoomChange([100]);
  };

  return (
    <div className="fixed bottom-4 right-4 bg-white border border-gray-200 rounded-md shadow-md p-2 flex items-center space-x-2 z-10">
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleZoomOut}
        disabled={zoomPercentage <= 50}
      >
        <Minus size={16} />
      </Button>
      
      <div className="w-40">
        <Slider
          value={[zoomPercentage]}
          min={50}
          max={150}
          step={5}
          onValueChange={onZoomChange}
        />
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleZoomIn}
        disabled={zoomPercentage >= 150}
      >
        <Plus size={16} />
      </Button>
      
      <div className="text-sm font-medium w-14 text-center">
        {zoomPercentage}%
      </div>
      
      <Button
        variant="ghost"
        size="sm"
        className="h-8 w-8 p-0"
        onClick={handleReset}
        title="Reset to 100%"
      >
        <Maximize2 size={16} />
      </Button>
    </div>
  );
};

export default ZoomControls;
