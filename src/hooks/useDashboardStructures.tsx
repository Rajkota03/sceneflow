
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
      // Create a comprehensive Three-Act Structure with detailed beats
      const defaultStructure = {
        id: `structure-${Date.now()}`,
        name: 'Enhanced Three-Act Structure',
        description: 'A comprehensive structure with Acts 1, 2A, 2B, and 3 including detailed beats.',
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
                  title: 'Hook',
                  description: 'The opening moment that sets the tone and grabs attention.',
                  timePosition: 0,
                  pageRange: "1-3",
                  complete: false,
                  notes: "Introduce protagonist, world, and theme with a powerful visual or character moment."
                },
                {
                  id: uuidv4(),
                  title: 'Set-Up',
                  description: "Establish protagonist's ordinary world and key relationships.",
                  timePosition: 5,
                  pageRange: "4-9",
                  complete: false,
                  notes: "Show character flaws and internal struggles that will need to be overcome."
                },
                {
                  id: uuidv4(),
                  title: 'Inciting Incident',
                  description: 'The "Call to Adventure" that disrupts the protagonist\'s world.',
                  timePosition: 10,
                  pageRange: "10-15",
                  complete: false,
                  notes: "This event introduces the main conflict and forces a crucial decision."
                },
                {
                  id: uuidv4(),
                  title: 'Build-Up',
                  description: 'Rising action leads to the First Plot Point.',
                  timePosition: 20,
                  pageRange: "16-24",
                  complete: false,
                  notes: "Protagonist hesitates but is pushed forward by events as antagonistic forces strengthen."
                },
                {
                  id: uuidv4(),
                  title: '1st Plot Point',
                  description: 'The point of no return. Protagonist commits to the journey.',
                  timePosition: 25,
                  pageRange: "25-30",
                  complete: false,
                  notes: "Marks the transition from Act 1 to Act 2. The protagonist actively decides to pursue the goal."
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 2A: Reaction',
              colorHex: '#f59e0b',
              startPosition: 25,
              endPosition: 50,
              beats: [
                {
                  id: uuidv4(),
                  title: 'Subplot Introduction',
                  description: 'Introduce B-story or supporting characters that enrich the main story.',
                  timePosition: 30,
                  pageRange: "31-37",
                  complete: false,
                  notes: "Often introduces a relationship or theme that will help protagonist's growth."
                },
                {
                  id: uuidv4(),
                  title: '1st Pinch Point',
                  description: 'A reminder of the antagonist\'s strength or new information that raises stakes.',
                  timePosition: 37.5,
                  pageRange: "38-45",
                  complete: false,
                  notes: "The protagonist struggles to react while developing subplots move forward."
                },
                {
                  id: uuidv4(),
                  title: 'Rising Obstacles',
                  description: 'Challenges intensify as protagonist attempts to adapt.',
                  timePosition: 45,
                  pageRange: "46-49",
                  complete: false,
                  notes: "Character flaws create complications. Protagonist struggles but gains skills."
                },
                {
                  id: uuidv4(),
                  title: 'Midpoint Preparation',
                  description: 'Events align for a major shift in perspective or approach.',
                  timePosition: 49,
                  pageRange: "50-59",
                  complete: false,
                  notes: "The stage is set for the crucial Midpoint turning point."
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Midpoint',
              colorHex: '#ef4444',
              startPosition: 50,
              endPosition: 50,
              beats: [
                {
                  id: uuidv4(),
                  title: 'Midpoint',
                  description: 'A game-changing revelation shifts the protagonist\'s perspective.',
                  timePosition: 50,
                  pageRange: "60",
                  complete: false,
                  notes: "The biggest shift in the protagonist's goal/motivation. Could be a false victory or devastating loss."
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 2B: Action',
              colorHex: '#f97316',
              startPosition: 50,
              endPosition: 75,
              beats: [
                {
                  id: uuidv4(),
                  title: 'Raised Stakes',
                  description: 'The situation intensifies following the Midpoint revelation.',
                  timePosition: 55,
                  pageRange: "61-65",
                  complete: false,
                  notes: "Protagonist takes more decisive action with a clearer purpose."
                },
                {
                  id: uuidv4(),
                  title: '2nd Pinch Point',
                  description: 'A foreshadowing event that reinforces what\'s at stake.',
                  timePosition: 62.5,
                  pageRange: "66-73",
                  complete: false,
                  notes: "Antagonist strengthens or executes a major move, protagonist must respond."
                },
                {
                  id: uuidv4(),
                  title: 'Renewed Push',
                  description: 'The protagonist starts taking charge and moving toward the final confrontation.',
                  timePosition: 70,
                  pageRange: "74-85",
                  complete: false,
                  notes: "Character shifts from reaction to action. Stakes reach their highest before Act 3."
                },
                {
                  id: uuidv4(),
                  title: 'Act 2 Climax',
                  description: 'Final moments before Act 3 - a major setback or complication.',
                  timePosition: 75,
                  pageRange: "86-90",
                  complete: false,
                  notes: "Often involves a betrayal, reversal, or major failure that tests the protagonist."
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 3: Resolution',
              colorHex: '#10b981',
              startPosition: 75,
              endPosition: 100,
              beats: [
                {
                  id: uuidv4(),
                  title: '3rd Plot Point',
                  description: 'A dark moment where the protagonist faces a major loss or setback.',
                  timePosition: 80,
                  pageRange: "91-99",
                  complete: false,
                  notes: "The antagonist gains the upper hand and the protagonist questions everything."
                },
                {
                  id: uuidv4(),
                  title: 'Preparation for Climax',
                  description: 'Protagonist rallies resources and determination for final battle.',
                  timePosition: 85,
                  pageRange: "100-105",
                  complete: false,
                  notes: "Character arc nears completion as protagonist overcomes internal obstacles."
                },
                {
                  id: uuidv4(),
                  title: 'Climax',
                  description: 'The final confrontation between protagonist and antagonist.',
                  timePosition: 90,
                  pageRange: "106-115",
                  complete: false,
                  notes: "The most intense moment of the story. Protagonist fully transforms and takes decisive action."
                },
                {
                  id: uuidv4(),
                  title: 'Resolution',
                  description: 'Tying up loose ends and showing the new world after the climax.',
                  timePosition: 95,
                  pageRange: "116-120",
                  complete: false,
                  notes: "Shows the protagonist's changed world and ends with a satisfying final image."
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
      
      // Add the new structure to the local state
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
