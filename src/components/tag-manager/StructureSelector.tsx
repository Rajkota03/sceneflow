
import React from 'react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StructureSelectorProps {
  structures: { id: string; name: string }[];
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
}

const StructureSelector: React.FC<StructureSelectorProps> = ({
  structures,
  selectedStructureId,
  onStructureChange
}) => {
  if (!onStructureChange || structures.length === 0) {
    return null;
  }

  return (
    <div className="flex items-center space-x-2 mr-4">
      <Label htmlFor="structure-select" className="text-sm font-medium">
        Structure:
      </Label>
      <Select 
        value={selectedStructureId} 
        onValueChange={onStructureChange}
      >
        <SelectTrigger id="structure-select" className="w-[180px]">
          <SelectValue placeholder="Select a structure" />
        </SelectTrigger>
        <SelectContent>
          {structures.map((structure) => (
            <SelectItem key={structure.id} value={structure.id}>
              {structure.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default StructureSelector;
