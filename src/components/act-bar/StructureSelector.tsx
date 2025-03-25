
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';
import { FileText } from 'lucide-react';

interface StructureSelectorProps {
  availableStructures: Array<{ id: string; name: string }>;
  selectedStructureId?: string;
  onStructureChange: (structureId: string) => void;
}

const StructureSelector: React.FC<StructureSelectorProps> = ({
  availableStructures,
  selectedStructureId,
  onStructureChange
}) => {
  if (!availableStructures || availableStructures.length === 0) {
    return null;
  }
  
  return (
    <div className="flex items-center flex-grow max-w-[220px]">
      <Select 
        value={selectedStructureId} 
        onValueChange={onStructureChange}
      >
        <SelectTrigger className="h-7 text-xs bg-white dark:bg-gray-800 w-full">
          <div className="flex items-center">
            <FileText className="w-3 h-3 mr-1.5" />
            <SelectValue placeholder="Select structure" />
          </div>
        </SelectTrigger>
        <SelectContent>
          {availableStructures.map(structure => (
            <SelectItem 
              key={structure.id} 
              value={structure.id}
              className="text-xs"
            >
              {structure.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StructureSelector;
