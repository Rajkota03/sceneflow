
import React from 'react';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '../ui/select';

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
    <div className="relative flex-shrink-0 w-64">
      <Select 
        value={selectedStructureId} 
        onValueChange={onStructureChange}
      >
        <SelectTrigger className="h-8 text-xs bg-white dark:bg-gray-800">
          <SelectValue placeholder="Select structure" />
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
