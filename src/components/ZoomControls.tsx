
import React from 'react';
import { ZoomIn, ZoomOut } from 'lucide-react';
import { Slider } from '@/components/ui/slider';
import { useFormat } from '@/lib/formatContext';

interface ZoomControlsProps {
  zoomPercentage: number;
  onZoomChange: (value: number[]) => void;
}

const ZoomControls: React.FC<ZoomControlsProps> = ({ 
  zoomPercentage, 
  onZoomChange 
}) => {
  const { zoomIn, zoomOut } = useFormat();

  return (
    <div className="zoom-control flex items-center justify-center space-x-4 py-2 px-4 bg-gray-100 border-t border-gray-200 absolute bottom-0 left-0 right-0">
      <ZoomOut 
        size={18} 
        className="text-gray-600 cursor-pointer" 
        onClick={zoomOut}
      />
      <div className="w-64">
        <Slider
          defaultValue={[zoomPercentage]}
          min={50}
          max={150}
          step={5}
          value={[zoomPercentage]}
          onValueChange={onZoomChange}
          className="w-full"
        />
      </div>
      <ZoomIn 
        size={18} 
        className="text-gray-600 cursor-pointer" 
        onClick={zoomIn}
      />
      <span className="text-xs text-gray-600 min-w-[40px] text-center">
        {zoomPercentage}%
      </span>
    </div>
  );
};

export default ZoomControls;
