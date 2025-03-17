
import React from 'react';
import { Structure } from '@/lib/types';
import { 
  Select, 
  SelectContent, 
  SelectGroup, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { FileTextIcon } from 'lucide-react';

interface StructureSelectorProps {
  structures: Structure[];
  selectedStructureId?: string;
  onStructureChange: (structureId: string) => void;
}

const StructureSelector: React.FC<StructureSelectorProps> = ({
  structures,
  selectedStructureId,
  onStructureChange
}) => {
  if (!structures || structures.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="text-xs text-gray-500 font-medium flex items-center">
        <FileTextIcon size={14} className="mr-1" />
        <span>Story Structure:</span>
      </div>
      
      <Select 
        value={selectedStructureId || ''} 
        onValueChange={onStructureChange}
      >
        <SelectTrigger className="h-8 w-[180px] text-xs">
          <SelectValue placeholder="Select a structure" />
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {structures.map((structure) => (
              <SelectItem 
                key={structure.id} 
                value={structure.id}
                className="text-xs"
              >
                {structure.name}
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StructureSelector;
