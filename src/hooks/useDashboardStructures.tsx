
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Structure, Act } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/App';

export const useDashboardStructures = () => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      fetchStructures();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchStructures = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('structures')
        .select('*')
        .order('updated_at', { ascending: false });
      
      if (error) throw error;
      
      if (data) {
        const formattedStructures: Structure[] = data.map(structure => {
          // Safely parse the beats data
          let actsData: Act[] = [];
          try {
            if (typeof structure.beats === 'string') {
              const parsed = JSON.parse(structure.beats);
              actsData = parsed.acts || [];
            } else if (structure.beats && typeof structure.beats === 'object') {
              // If it's already an object, try to access acts
              const beatsObj = structure.beats as any;
              actsData = beatsObj.acts || [];
            }
          } catch (e) {
            console.error('Error parsing beats data:', e);
            actsData = [];
          }
          
          return {
            id: structure.id,
            name: structure.name,
            description: structure.description || undefined,
            acts: actsData,
            createdAt: new Date(structure.created_at),
            updatedAt: new Date(structure.updated_at)
          };
        });
        
        setStructures(formattedStructures);
      }
    } catch (error) {
      console.error('Error fetching structures:', error);
      toast({
        title: 'Error',
        description: 'Failed to load structures. Please try again.',
        variant: 'destructive',
      });
      setStructures([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateStructure = async () => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to create a new structure',
        variant: 'destructive',
      });
      return;
    }
    
    try {
      const defaultStructure = {
        id: `structure-${Date.now()}`,
        name: 'Three Act Structure',
        description: 'The classic three-act structure for screenplays.',
        beats: {
          acts: [
            {
              id: uuidv4(),
              title: 'Act 1: Setup',
              colorHex: '#4f46e5',
              startPosition: 0,
              endPosition: 25,
              beats: [
                {
                  id: uuidv4(),
                  title: 'Opening Image',
                  description: 'Sets the tone and mood of the story.',
                  timePosition: 0
                },
                {
                  id: uuidv4(),
                  title: 'Inciting Incident',
                  description: 'The event that sets the story in motion.',
                  timePosition: 10
                },
                {
                  id: uuidv4(),
                  title: 'First Plot Point',
                  description: 'The protagonist commits to the journey.',
                  timePosition: 25
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 2: Confrontation',
              colorHex: '#10b981',
              startPosition: 25,
              endPosition: 75,
              beats: [
                {
                  id: uuidv4(),
                  title: 'First Pinch Point',
                  description: 'A reminder of the antagonistic force.',
                  timePosition: 37.5
                },
                {
                  id: uuidv4(),
                  title: 'Midpoint',
                  description: 'The protagonist makes a critical choice.',
                  timePosition: 50
                },
                {
                  id: uuidv4(),
                  title: 'Second Pinch Point',
                  description: 'The antagonistic force applies pressure.',
                  timePosition: 62.5
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 3: Resolution',
              colorHex: '#ef4444',
              startPosition: 75,
              endPosition: 100,
              beats: [
                {
                  id: uuidv4(),
                  title: 'Crisis',
                  description: 'The darkest moment for the protagonist.',
                  timePosition: 75
                },
                {
                  id: uuidv4(),
                  title: 'Climax',
                  description: 'The final confrontation.',
                  timePosition: 90
                },
                {
                  id: uuidv4(),
                  title: 'Resolution',
                  description: 'The new status quo is established.',
                  timePosition: 100
                }
              ]
            }
          ]
        }
      };
      
      const { error } = await supabase
        .from('structures')
        .insert({
          id: defaultStructure.id,
          name: defaultStructure.name,
          description: defaultStructure.description,
          beats: defaultStructure.beats
        });
      
      if (error) throw error;
      
      toast({
        title: "Structure created",
        description: "Your new structure has been created successfully."
      });
      
      // Since we don't have a structure editor page yet, we'll just update the local state
      const newStructure: Structure = {
        id: defaultStructure.id,
        name: defaultStructure.name,
        description: defaultStructure.description,
        acts: defaultStructure.beats.acts,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setStructures(prev => [newStructure, ...prev]);
    } catch (error) {
      console.error('Error creating structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to create a new structure. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleEditStructure = (id: string) => {
    toast({
      title: "Feature in development",
      description: "The structure editor is coming soon."
    });
  };

  const handleDeleteStructure = async (id: string) => {
    try {
      // First delete any project_structures references
      const { error: linkError } = await supabase
        .from('project_structures')
        .delete()
        .eq('structure_id', id);
      
      if (linkError) throw linkError;
      
      // Then delete the structure itself
      const { error } = await supabase
        .from('structures')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setStructures(prev => prev.filter(structure => structure.id !== id));
      
      toast({
        title: "Structure deleted",
        description: "The structure has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting structure:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the structure. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter structures based on search query
  const filteredStructures = structures.filter(structure =>
    structure.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (structure.description && structure.description.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return {
    structures: filteredStructures,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateStructure,
    handleEditStructure,
    handleDeleteStructure
  };
};

export default useDashboardStructures;
