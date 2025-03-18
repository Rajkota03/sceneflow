
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';
import { StructureType } from '@/types/scriptTypes';
import { Json } from '@/integrations/supabase/types';

interface UseProjectStructuresResult {
  structures: Structure[];
  selectedStructureId: string | null;
  selectedStructure: Structure | null;
  isLoading: boolean;
  handleStructureChange: (structureId: string) => void;
  updateBeatCompletion: (beatId: string, actId: string, isCompleted: boolean) => Structure | null;
  saveBeatCompletion: (structureId: string, updatedStructure: Structure) => Promise<boolean>;
  setSelectedStructure: React.Dispatch<React.SetStateAction<Structure | null>>;
}

const useProjectStructures = (projectId: string): UseProjectStructuresResult => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { session } = useAuth();

  useEffect(() => {
    const fetchStructures = async () => {
      if (!projectId) return;
      
      try {
        setIsLoading(true);
        
        const { data: structuresData, error } = await supabase
          .from('structures')
          .select('*')
          .eq('project_id', projectId);
        
        if (error) {
          console.error('Error fetching structures:', error);
          return;
        }
        
        // Transform to match Structure type
        const formattedStructures: Structure[] = structuresData.map(structure => {
          // Parse beats from JSON to convert to acts array
          const beatsData = structure.beats as Json;
          let acts: Act[] = [];
          
          // Try to convert the beats data to acts structure
          if (Array.isArray(beatsData)) {
            acts = beatsData as unknown as Act[];
          }
          
          return {
            id: structure.id,
            name: structure.name,
            description: structure.description || '',
            acts: acts,
            created_at: structure.created_at,
            updated_at: structure.updated_at,
            structure_type: structure.structure_type as StructureType
          };
        });
        
        setStructures(formattedStructures);
        
        if (formattedStructures.length > 0) {
          const defaultStructure = formattedStructures[0];
          setSelectedStructureId(defaultStructure.id);
          setSelectedStructure(defaultStructure);
        }
      } catch (error) {
        console.error('Error in fetchStructures:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (projectId) {
      fetchStructures();
    }
  }, [projectId]);

  const handleStructureChange = (structureId: string) => {
    const structure = structures.find(s => s.id === structureId);
    setSelectedStructureId(structureId);
    setSelectedStructure(structure || null);
  };
  
  // Fix updateBeatCompletion function
  const updateBeatCompletion = (beatId: string, actId: string, isCompleted: boolean): Structure | null => {
    if (!selectedStructure) return null;
    
    // Create a deep copy to avoid mutating state directly
    const updatedStructure = JSON.parse(JSON.stringify(selectedStructure)) as Structure;
    
    // Find the act and the beat
    const act = updatedStructure.acts.find(a => a.id === actId);
    if (!act) return null;
    
    const beat = act.beats.find(b => b.id === beatId);
    if (!beat) return null;
    
    // Update the completed status
    beat.completed = isCompleted;
    
    // Update the local state
    setSelectedStructure(updatedStructure);
    
    return updatedStructure;
  };

  const saveBeatCompletion = async (structureId: string, updatedStructure: Structure): Promise<boolean> => {
    try {
      const { data, error } = await supabase
        .from('structures')
        .update({ 
          beats: updatedStructure.acts as unknown as Json
        })
        .eq('id', structureId);
      
      if (error) {
        console.error("Error updating structure:", error);
        toast({
          title: "Error",
          description: "Failed to update structure. Please try again.",
          variant: "destructive",
        });
        return false;
      }
      
      return true;
    } catch (error) {
      console.error("Error updating structure:", error);
      toast({
        title: "Error",
        description: "Failed to update structure. Please try again.",
        variant: "destructive",
      });
      return false;
    }
  };

  return {
    structures,
    selectedStructureId,
    selectedStructure,
    isLoading,
    handleStructureChange,
    updateBeatCompletion,
    saveBeatCompletion,
    setSelectedStructure
  };
};

export default useProjectStructures;
