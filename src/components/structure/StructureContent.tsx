
import React, { useState, useEffect } from 'react';
import { ThreeActStructure, StoryBeat, ActType } from '@/lib/types';
import ThreeActStructureTimeline from './ThreeActStructureTimeline';
import StructureToolsSidebar from './StructureToolsSidebar';
import { PlusCircle, Loader } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';

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
  const [newProjectName, setNewProjectName] = useState<string>('');
  const [showNewProjectInput, setShowNewProjectInput] = useState<boolean>(false);

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
  
  const handleNewProject = () => {
    setShowNewProjectInput(true);
    setNewProjectName('');
  };
  
  const createNewProject = async () => {
    if (!newProjectName.trim()) {
      toast({
        title: "Error",
        description: "Project name cannot be empty",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const newProject = {
        id: `structure-${uuidv4()}`,
        name: newProjectName,
        projectId: structure?.projectId || '',
        createdAt: new Date().toISOString()
      };
      
      // Add your code to save to Supabase here
      const { data, error } = await supabase
        .from('structures')
        .insert(newProject)
        .select()
        .single();
        
      if (error) throw error;
      
      setAvailableStructures(prev => [...prev, { id: data.id, name: data.name }]);
      setSelectedStructureId(data.id);
      if (onChangeStructure) onChangeStructure(data.id);
      
      setShowNewProjectInput(false);
      toast({
        title: "Success",
        description: "New project created"
      });
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: "Error",
        description: "Failed to create new project",
        variant: "destructive"
      });
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Label htmlFor="structure-select" className="text-sm font-medium">
          Project:
        </Label>
        
        {showNewProjectInput ? (
          <div className="flex items-center gap-2">
            <input
              type="text"
              value={newProjectName}
              onChange={(e) => setNewProjectName(e.target.value)}
              className="px-3 py-1 border rounded-md text-sm"
              placeholder="New project name"
              autoFocus
            />
            <Button size="sm" onClick={createNewProject}>Create</Button>
            <Button 
              size="sm" 
              variant="outline" 
              onClick={() => setShowNewProjectInput(false)}
            >
              Cancel
            </Button>
          </div>
        ) : (
          <>
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
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleNewProject}
              className="flex items-center"
            >
              <PlusCircle size={16} className="mr-1" />
              New Project
            </Button>
          </>
        )}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        <div className="w-full lg:w-64 flex-shrink-0">
          <StructureToolsSidebar />
        </div>
        
        <div className="flex-1">
          <ThreeActStructureTimeline 
            structure={structure}
            isLoading={isLoading}
            isSaving={isSaving}
            onUpdateBeat={onUpdateBeat}
            onReorderBeats={onReorderBeats}
            onUpdateProjectTitle={onUpdateProjectTitle}
            onDeleteBeat={onDeleteBeat}
            onAddBeat={onAddBeat}
            onSave={onSave}
          />
        </div>
      </div>
    </div>
  );
};

export default StructureContent;
