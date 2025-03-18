
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act, Beat } from '@/lib/types';
import { useAuth } from '@/App';
import { Json } from '@/integrations/supabase/types';
import { StructureType } from '@/types/scriptTypes';

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
        const formattedStructures: Structure[] = structuresData.map(structure => {
          // Parse beats from JSON to convert to acts array
          const beatsData = structure.beats as Json;
          let acts: Act[] = [];
          
          // Try to convert the beats data to acts structure
          if (Array.isArray(beatsData)) {
            acts = beatsData as Act[];
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
      // Create default acts for a new structure
      const defaultActs: Act[] = [
        {
          id: 'act-1',
          title: 'Act 1',
          colorHex: '#4299e1',
          startPosition: 0,
          endPosition: 33,
          beats: [
            { id: 'beat-1', title: 'Opening Image', description: '', timePosition: 0, completed: false },
            { id: 'beat-2', title: 'Theme Stated', description: '', timePosition: 10, completed: false },
            { id: 'beat-3', title: 'Set-up', description: '', timePosition: 20, completed: false },
          ],
        },
        {
          id: 'act-2',
          title: 'Act 2',
          colorHex: '#48bb78',
          startPosition: 33,
          endPosition: 66,
          beats: [
            { id: 'beat-4', title: 'Catalyst', description: '', timePosition: 33, completed: false },
            { id: 'beat-5', title: 'Debate', description: '', timePosition: 45, completed: false },
            { id: 'beat-6', title: 'Break into Two', description: '', timePosition: 55, completed: false },
          ],
        },
        {
          id: 'act-3',
          title: 'Act 3',
          colorHex: '#ed8936',
          startPosition: 66,
          endPosition: 100,
          beats: [
            { id: 'beat-7', title: 'B Story', description: '', timePosition: 66, completed: false },
            { id: 'beat-8', title: 'Fun and Games', description: '', timePosition: 80, completed: false },
            { id: 'beat-9', title: 'Midpoint', description: '', timePosition: 90, completed: false },
          ],
        },
      ];

      const { data, error } = await supabase
        .from('structures')
        .insert([{
          name: 'Untitled Structure',
          description: 'A new story structure',
          user_id: session.user.id,
          structure_type: structureType,
          beats: defaultActs
        }])
        .select('*');

      if (error) {
        console.error('Error creating structure:', error);
        return;
      }

      if (data && data.length > 0) {
        const newStructureData = data[0];
        
        // Convert the database structure to the application structure
        const newStructure: Structure = {
          id: newStructureData.id,
          name: newStructureData.name,
          description: newStructureData.description || '',
          acts: Array.isArray(newStructureData.beats) ? newStructureData.beats as Act[] : [],
          created_at: newStructureData.created_at,
          updated_at: newStructureData.updated_at,
          structure_type: newStructureData.structure_type as StructureType
        };
        
        setStructures(prevStructures => [...prevStructures, newStructure]);
      }
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
      // Convert acts to beats format for database
      const { error } = await supabase
        .from('structures')
        .update({
          name: structure.name,
          description: structure.description,
          beats: structure.acts,
          updated_at: new Date().toISOString(),
          structure_type: structure.structure_type
        })
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
