import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Structure, Act } from '@/lib/types';
import { v4 as uuidv4 } from 'uuid';
import { useAuth } from '@/App';
import { useNavigate } from 'react-router-dom';

export const useDashboardStructures = () => {
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const { session } = useAuth();
  const navigate = useNavigate();

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
          let actsData: Act[] = [];
          try {
            if (typeof structure.beats === 'string') {
              const parsed = JSON.parse(structure.beats);
              actsData = parsed.acts || [];
            } else if (structure.beats && typeof structure.beats === 'object') {
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
        name: 'Enhanced Three-Act Structure',
        description: 'A comprehensive structure with Acts 1, 2A, 2B, and 3 including detailed beats for modern screenwriting.',
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
                  description: 'Sets the tone and mood of the story with a powerful visual.',
                  timePosition: 0,
                  pageRange: "1-2",
                  complete: false,
                  notes: "Create a visual that captures the theme and essence of your entire story."
                },
                {
                  id: uuidv4(),
                  title: 'Ordinary World',
                  description: "Shows the protagonist's normal life before the journey begins.",
                  timePosition: 3,
                  pageRange: "3-7",
                  complete: false,
                  notes: "Establish what's missing in the protagonist's life and what needs to change."
                },
                {
                  id: uuidv4(),
                  title: 'Inciting Incident',
                  description: 'The event that disrupts the ordinary world and starts the story.',
                  timePosition: 10,
                  pageRange: "10-12",
                  complete: false,
                  notes: "This should be a significant event that forces the protagonist to react."
                },
                {
                  id: uuidv4(),
                  title: 'Debate/Refusal',
                  description: 'Protagonist resists the call to adventure.',
                  timePosition: 15,
                  pageRange: "15-20",
                  complete: false,
                  notes: "Show inner conflict and reasons why the protagonist hesitates to act."
                },
                {
                  id: uuidv4(),
                  title: 'Break Into Act 2',
                  description: 'Protagonist makes a decision that propels them into a new world.',
                  timePosition: 25,
                  pageRange: "25-30",
                  complete: false,
                  notes: "This is the point of no return. The protagonist commits to the journey."
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 2A: Obstacles & Complications',
              colorHex: '#f59e0b',
              startPosition: 25,
              endPosition: 50,
              beats: [
                {
                  id: uuidv4(),
                  title: 'B Story Introduction',
                  description: 'Introduction of a secondary plot, often a relationship.',
                  timePosition: 30,
                  pageRange: "30-35",
                  complete: false,
                  notes: "Usually introduces a love interest or mentor who helps with the protagonist's transformation."
                },
                {
                  id: uuidv4(),
                  title: 'Fun & Games',
                  description: 'The promise of the premise is explored.',
                  timePosition: 35,
                  pageRange: "35-45",
                  complete: false,
                  notes: "This is where the trailer moments come from - showing the concept in action."
                },
                {
                  id: uuidv4(),
                  title: 'First Pinch Point',
                  description: 'First encounter with the antagonistic force.',
                  timePosition: 40,
                  pageRange: "40-45",
                  complete: false,
                  notes: "A reminder of what's at stake and a glimpse of the antagonist's power."
                },
                {
                  id: uuidv4(),
                  title: 'Midpoint Approach',
                  description: 'Events build toward a significant turning point.',
                  timePosition: 45,
                  pageRange: "45-50",
                  complete: false,
                  notes: "Tension increases as the story approaches its midpoint turning point."
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
                  title: 'Midpoint Twist',
                  description: 'A significant revelation or reversal that changes everything.',
                  timePosition: 50,
                  pageRange: "50-55",
                  complete: false,
                  notes: "Often a false victory or false defeat. Raises stakes and changes the protagonist's goal."
                }
              ]
            },
            {
              id: uuidv4(),
              title: 'Act 2B: Escalation',
              colorHex: '#f97316',
              startPosition: 50,
              endPosition: 75,
              beats: [
                {
                  id: uuidv4(),
                  title: 'Bad Guys Close In',
                  description: 'External and internal pressures intensify.',
                  timePosition: 55,
                  pageRange: "55-60",
                  complete: false,
                  notes: "Antagonists gain strength while the protagonist faces mounting internal conflicts."
                },
                {
                  id: uuidv4(),
                  title: 'Second Pinch Point',
                  description: 'Another encounter with the antagonistic force.',
                  timePosition: 62,
                  pageRange: "62-65",
                  complete: false,
                  notes: "Stronger reminder of what's at stake, often with a character death or major setback."
                },
                {
                  id: uuidv4(),
                  title: 'All Hope Is Lost',
                  description: 'Protagonist reaches their lowest point.',
                  timePosition: 70,
                  pageRange: "70-75",
                  complete: false,
                  notes: "The darkest moment when it seems impossible to succeed. Often involves a death (literal or symbolic)."
                },
                {
                  id: uuidv4(),
                  title: 'Break Into Act 3',
                  description: 'A new determination or revelation that propels into the final act.',
                  timePosition: 75,
                  pageRange: "75-80",
                  complete: false,
                  notes: "The protagonist finds a new resolve, often connected to the B story or a revelation."
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
                  title: 'Renewed Push',
                  description: 'Armed with new resolve, protagonist prepares for the final battle.',
                  timePosition: 80,
                  pageRange: "80-85",
                  complete: false,
                  notes: "Show how the protagonist has changed and is now ready to face the challenge."
                },
                {
                  id: uuidv4(),
                  title: 'Climax',
                  description: 'The final confrontation with the main antagonistic force.',
                  timePosition: 85,
                  pageRange: "85-95",
                  complete: false,
                  notes: "The protagonist must use everything they've learned to overcome the antagonist."
                },
                {
                  id: uuidv4(),
                  title: 'Denouement',
                  description: 'Loose ends are tied up and we see the new normal.',
                  timePosition: 95,
                  pageRange: "95-110",
                  complete: false,
                  notes: "Show how the world and characters have changed as a result of the journey."
                },
                {
                  id: uuidv4(),
                  title: 'Final Image',
                  description: 'A closing image that contrasts with the opening image.',
                  timePosition: 99,
                  pageRange: "110-120",
                  complete: false,
                  notes: "Bookend the story with an image that shows transformation and theme resolution."
                }
              ]
            }
          ]
        }
      };
      
      const beatsData = JSON.stringify(defaultStructure.beats);
      
      const { error } = await supabase
        .from('structures')
        .insert({
          id: defaultStructure.id,
          name: defaultStructure.name,
          description: defaultStructure.description,
          beats: beatsData
        });
      
      if (error) throw error;
      
      toast({
        title: "Structure created",
        description: "Your enhanced three-act structure has been created successfully."
      });
      
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

  const handleUpdateStructure = async (updatedStructure: Structure) => {
    if (!session) {
      toast({
        title: 'Authentication required',
        description: 'Please sign in to update this structure',
        variant: 'destructive',
      });
      throw new Error('Authentication required');
    }
    
    try {
      const beatsData = JSON.stringify({ acts: updatedStructure.acts });
      
      const { error } = await supabase
        .from('structures')
        .update({
          name: updatedStructure.name,
          description: updatedStructure.description,
          beats: beatsData,
          updated_at: new Date().toISOString()
        })
        .eq('id', updatedStructure.id);
      
      if (error) throw error;
      
      setStructures(prev => 
        prev.map(structure => 
          structure.id === updatedStructure.id 
            ? { ...updatedStructure, updatedAt: new Date() } 
            : structure
        )
      );
      
      return;
    } catch (error) {
      console.error('Error updating structure:', error);
      throw error;
    }
  };

  const handleEditStructure = (structure: Structure) => {
    navigate(`/structure/${structure.id}`);
  };

  const handleDeleteStructure = async (id: string) => {
    try {
      const { error: linkError } = await supabase
        .from('project_structures')
        .delete()
        .eq('structure_id', id);
      
      if (linkError) throw linkError;
      
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
    handleDeleteStructure,
    handleUpdateStructure
  };
};

export default useDashboardStructures;
