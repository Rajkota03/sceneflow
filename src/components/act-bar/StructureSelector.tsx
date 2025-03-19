
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
    <div className="flex items-center w-full">
      <label className="text-sm font-medium text-gray-700 dark:text-gray-300 mr-2">
        Structure:
      </label>
      <Select 
        value={selectedStructureId} 
        onValueChange={onStructureChange}
      >
        <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800 w-72">
          <div className="flex items-center">
            <FileText className="w-3.5 h-3.5 mr-2" />
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
