
import React, { useState, useEffect } from 'react';
import { ThreeActStructure, StoryBeat, ActType } from '@/lib/types';
import ThreeActStructureTimeline from './ThreeActStructureTimeline';
import StructureToolsSidebar from './StructureToolsSidebar';
import { Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';

interface StructureContentProps {
  structure: ThreeActStructure | null;
  isLoading: boolean;
  isSaving: boolean;
  onUpdateBeat: (beatId: string, updates: Partial<StoryBeat>) => void;
  onReorderBeats: (beats: StoryBeat[]) => void;
  onUpdateProjectTitle: (title: string) => void;
  onDeleteBeat: (beatId: string) => void;
  onAddBeat?: (actNumber: ActType) => void;
  onSave?: () => void;
  onChangeStructure?: (structureId: string) => void;
}

const StructureContent: React.FC<StructureContentProps> = ({
  structure,
  isLoading,
  isSaving,
  onUpdateBeat,
  onReorderBeats,
  onUpdateProjectTitle,
  onDeleteBeat,
  onAddBeat,
  onSave,
  onChangeStructure
}) => {
  const [availableStructures, setAvailableStructures] = useState<{id: string, name: string}[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string>('');

  useEffect(() => {
    // Fetch available structures when component mounts
    const fetchStructures = async () => {
      try {
        const { data, error } = await supabase
          .from('structures')
          .select('id, name');
          
        if (error) {
          console.error('Error fetching structures:', error);
          return;
        }
        
        if (data) {
          setAvailableStructures(data);
          if (structure?.id) {
            setSelectedStructureId(structure.id);
          } else if (data.length > 0) {
            setSelectedStructureId(data[0].id);
          }
        }
      } catch (error) {
        console.error('Error fetching structures:', error);
      }
    };
    
    fetchStructures();
  }, [structure]);

  const handleStructureChange = (value: string) => {
    setSelectedStructureId(value);
    if (onChangeStructure) {
      onChangeStructure(value);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="container mx-auto py-8 px-4 flex justify-center items-center min-h-[60vh]">
        <div className="flex flex-col items-center">
          <Loader className="h-8 w-8 animate-spin text-primary mb-4" />
          <p className="text-gray-500">Loading structure...</p>
        </div>
      </div>
    );
  }

  // Make sure we use the ActType for allActTypes array
  const allActTypes: ActType[] = [1, '2A', 'midpoint', '2B', 3];
  
  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4 flex items-center">
        <Label htmlFor="structure-select" className="text-sm font-medium mr-2">
          Structure:
        </Label>
        <Select value={selectedStructureId} onValueChange={handleStructureChange}>
          <SelectTrigger id="structure-select" className="w-[250px]">
            <SelectValue placeholder="Select a structure" />
          </SelectTrigger>
          <SelectContent>
            {availableStructures.map((structure) => (
              <SelectItem key={structure.id} value={structure.id}>
                {structure.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <StructureToolsSidebar />
        
        <div className="flex-1">
          <ThreeActStructureTimeline 
            structure={structure}
            isLoading={isLoading}
            isSaving={isSaving}
            onUpdateBeat={onUpdateBeat}
            onReorderBeats={onReorderBeats}
            onUpdateProjectTitle={onUpdateProjectTitle}
            onDeleteBeat={onDeleteBeat}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default StructureContent;
