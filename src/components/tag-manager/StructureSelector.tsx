
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
import { Compass, FileTextIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

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

  const getStructureType = (type?: string): string => {
    switch (type) {
      case 'save_the_cat': return 'Save the Cat';
      case 'hero_journey': return 'Hero\'s Journey';
      case 'story_circle': return 'Story Circle';
      default: return 'Three Act Structure';
    }
  };

  const getStructureColor = (type?: string): string => {
    switch (type) {
      case 'save_the_cat': return 'bg-blue-100 text-blue-800 border-blue-300';
      case 'hero_journey': return 'bg-green-100 text-green-800 border-green-300';
      case 'story_circle': return 'bg-purple-100 text-purple-800 border-purple-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  // Find the selected structure
  const selectedStructure = selectedStructureId 
    ? structures.find(s => s.id === selectedStructureId)
    : null;

  return (
    <div className="flex items-center space-x-2 mb-2">
      <div className="text-xs text-gray-500 font-medium flex items-center">
        <Compass size={14} className="mr-1" />
        <span>Story Structure:</span>
      </div>
      
      <Select 
        value={selectedStructureId || ''} 
        onValueChange={onStructureChange}
      >
        <SelectTrigger className="h-8 text-xs flex items-center gap-2">
          <SelectValue placeholder="Select a structure">
            {selectedStructure && (
              <div className="flex items-center gap-2">
                <span className="font-medium">{selectedStructure.name}</span>
                <Badge variant="outline" className={cn("font-normal text-xs", getStructureColor(selectedStructure.structure_type))}>
                  {getStructureType(selectedStructure.structure_type)}
                </Badge>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          <SelectGroup>
            {structures.map((structure) => (
              <SelectItem 
                key={structure.id} 
                value={structure.id}
                className="text-xs flex justify-between items-center py-2"
              >
                <div className="flex justify-between items-center w-full">
                  <span>{structure.name}</span>
                  <Badge variant="outline" className={cn("font-normal text-xs ml-2", getStructureColor(structure.structure_type))}>
                    {getStructureType(structure.structure_type)}
                  </Badge>
                </div>
              </SelectItem>
            ))}
          </SelectGroup>
        </SelectContent>
      </Select>
    </div>
  );
};

export default StructureSelector;
