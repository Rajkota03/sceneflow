import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure } from '@/lib/types';
import { useAuth } from '@/App';

export type StructureType = 'three_act' | 'save_the_cat' | 'hero_journey' | 'story_circle';

interface UseDashboardStructuresResult {
  structures: Structure[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  isLoading: boolean;
  handleCreateStructure: (structureType?: StructureType) => void;
  handleEditStructure: (structure: Structure) => void;
  handleDeleteStructure: (id: string) => Promise<void>;
}

export const useDashboardStructures = (): UseDashboardStructuresResult => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const { session } = useAuth();

  useEffect(() => {
    const fetchStructures = async () => {
      try {
        setIsLoading(true);
        
        const { data: structuresData, error } = await supabase
          .from('structures')
          .select('*')
          .eq('user_id', session?.user.id);
        
        if (error) {
          console.error('Error fetching structures:', error);
          return;
        }
        
        // Transform the data to match the Structure type
        const formattedStructures: Structure[] = structuresData.map(structure => ({
          id: structure.id,
          name: structure.name,
          description: structure.description,
          acts: structure.acts,
          created_at: structure.createdAt || new Date().toISOString(),
          updated_at: structure.updatedAt || new Date().toISOString(),
          structure_type: structure.structure_type as StructureType
        }));
        
        setStructures(formattedStructures);
      } catch (error) {
        console.error('Error in fetchStructures:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (session) {
      fetchStructures();
    }
  }, [session]);

  const handleCreateStructure = async (structureType: StructureType = 'three_act') => {
    if (!session) return;

    setIsLoading(true);
    try {
      const defaultStructure = {
        name: 'Untitled Structure',
        description: 'A new story structure',
        user_id: session.user.id,
        structure_type: structureType,
        acts: [
          {
            id: 'act-1',
            title: 'Act 1',
            beats: [
              { id: 'beat-1', title: 'Opening Image', completed: false },
              { id: 'beat-2', title: 'Theme Stated', completed: false },
              { id: 'beat-3', title: 'Set-up', completed: false },
            ],
          },
          {
            id: 'act-2',
            title: 'Act 2',
            beats: [
              { id: 'beat-4', title: 'Catalyst', completed: false },
              { id: 'beat-5', title: 'Debate', completed: false },
              { id: 'beat-6', title: 'Break into Two', completed: false },
            ],
          },
          {
            id: 'act-3',
            title: 'Act 3',
            beats: [
              { id: 'beat-7', title: 'B Story', completed: false },
              { id: 'beat-8', title: 'Fun and Games', completed: false },
              { id: 'beat-9', title: 'Midpoint', completed: false },
            ],
          },
        ],
      };

      const { data, error } = await supabase
        .from('structures')
        .insert([defaultStructure])
        .select('*');

      if (error) {
        console.error('Error creating structure:', error);
        return;
      }

      const newStructure = data[0] as Structure;
      setStructures(prevStructures => [...prevStructures, newStructure]);
    } catch (error) {
      console.error('Error creating structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleEditStructure = async (structure: Structure) => {
    if (!session) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('structures')
        .update(structure)
        .eq('id', structure.id);

      if (error) {
        console.error('Error updating structure:', error);
        return;
      }

      setStructures(prevStructures =>
        prevStructures.map(s => (s.id === structure.id ? structure : s))
      );
    } catch (error) {
      console.error('Error updating structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteStructure = async (id: string) => {
    if (!session) return;

    setIsLoading(true);
    try {
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting structure:', error);
        return;
      }

      setStructures(prevStructures => prevStructures.filter(s => s.id !== id));
    } catch (error) {
      console.error('Error deleting structure:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    structures,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateStructure,
    handleEditStructure,
    handleDeleteStructure,
  };
};
