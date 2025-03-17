
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { Project, Note, Structure } from '@/lib/types';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuidv4 } from 'uuid';
import ScreenplaysTab from '@/components/dashboard/ScreenplaysTab';
import NotesTab from '@/components/dashboard/NotesTab';
import StructuresTab from '@/components/dashboard/StructuresTab';
import { Json } from '@/integrations/supabase/types'; 

const Dashboard = () => {
  const navigate = useNavigate();
  const { session } = useAuth();
  const [activeTab, setActiveTab] = useState("screenplays");
  
  // Screenplay state
  const [projects, setProjects] = useState<Project[]>([]);
  const [isProjectsLoading, setIsProjectsLoading] = useState(true);
  const [projectsSearchQuery, setProjectsSearchQuery] = useState("");
  
  // Notes state
  const [notes, setNotes] = useState<Note[]>([]);
  const [isNotesLoading, setIsNotesLoading] = useState(true);
  const [notesSearchQuery, setNotesSearchQuery] = useState("");
  const [isNoteEditorOpen, setIsNoteEditorOpen] = useState(false);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  
  // Structures state
  const [structures, setStructures] = useState<Structure[]>([]);
  const [isStructuresLoading, setIsStructuresLoading] = useState(true);
  const [structuresSearchQuery, setStructuresSearchQuery] = useState("");

  useEffect(() => {
    if (!session) return;
    
    const fetchProjects = async () => {
      setIsProjectsLoading(true);
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('author_id', session.user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your projects. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsProjectsLoading(false);
      }
    };
    
    const fetchNotes = async () => {
      setIsNotesLoading(true);
      try {
        const { data, error } = await supabase
          .from('standalone_notes')
          .select('*')
          .eq('author_id', session.user.id)
          .order('updated_at', { ascending: false });
        
        if (error) throw error;
        
        if (data) {
          const formattedNotes: Note[] = data.map(note => ({
            id: note.id,
            title: note.title,
            content: note.content,
            createdAt: new Date(note.created_at),
            updatedAt: new Date(note.updated_at)
          }));
          
          setNotes(formattedNotes);
        }
      } catch (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: 'Error',
          description: 'Failed to load your notes. Please try again.',
          variant: 'destructive',
        });
      } finally {
        setIsNotesLoading(false);
      }
    };
    
    const fetchStructures = async () => {
      setIsStructuresLoading(true);
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
      } finally {
        setIsStructuresLoading(false);
      }
    };
    
    fetchProjects();
    fetchNotes();
    fetchStructures();
  }, [session]);

  if (!session) {
    navigate('/signin');
    return null;
  }

  const handleCreateNewProject = async () => {
    if (!session) {
      navigate('/signin');
      return;
    }
    
    try {
      const newId = `project-${Date.now()}`;
      
      const { error } = await supabase
        .from('projects')
        .insert({
          id: newId,
          title: 'Untitled Screenplay',
          author_id: session.user.id,
          content: JSON.stringify({ elements: [] }),
        });
      
      if (error) throw error;
      
      toast({
        title: "Project created",
        description: "Your new screenplay has been created successfully."
      });
      
      navigate(`/editor/${newId}`);
    } catch (error) {
      console.error('Error creating project:', error);
      toast({
        title: 'Error',
        description: 'Failed to create a new project. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setProjects(prevProjects => prevProjects.filter(project => project.id !== id));
      
      toast({
        title: "Project deleted",
        description: "Your screenplay has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting project:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the project. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCreateNote = () => {
    setCurrentNote(null);
    setIsNoteEditorOpen(true);
  };

  const handleViewNote = (note: Note) => {
    setCurrentNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleEditNote = (note: Note) => {
    setCurrentNote(note);
    setIsNoteEditorOpen(true);
  };

  const handleSaveNote = async (note: Note) => {
    if (!session) return;
    
    try {
      const isNewNote = !notes.some(n => n.id === note.id);
      
      if (isNewNote) {
        // Create new note
        const { error } = await supabase
          .from('standalone_notes')
          .insert({
            id: note.id,
            title: note.title,
            content: note.content,
            author_id: session.user.id,
          });
        
        if (error) throw error;
        
        setNotes(prevNotes => [note, ...prevNotes]);
        
        toast({
          title: "Note created",
          description: "Your note has been created successfully."
        });
      } else {
        // Update existing note
        const { error } = await supabase
          .from('standalone_notes')
          .update({
            title: note.title,
            content: note.content,
            updated_at: new Date().toISOString(),
          })
          .eq('id', note.id);
        
        if (error) throw error;
        
        setNotes(prevNotes => prevNotes.map(n => n.id === note.id ? note : n));
        
        toast({
          title: "Note updated",
          description: "Your note has been updated successfully."
        });
      }
    } catch (error) {
      console.error('Error saving note:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteNote = async (id: string) => {
    try {
      const { error } = await supabase
        .from('standalone_notes')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      
      setNotes(prevNotes => prevNotes.filter(note => note.id !== id));
      
      toast({
        title: "Note deleted",
        description: "Your note has been deleted successfully."
      });
    } catch (error) {
      console.error('Error deleting note:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the note. Please try again.',
        variant: 'destructive',
      });
      throw error;
    }
  };

  const handleCreateStructure = async () => {
    if (!session) {
      navigate('/signin');
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

  // Filter projects based on search query
  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(projectsSearchQuery.toLowerCase())
  );

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(notesSearchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(notesSearchQuery.toLowerCase())
  );

  // Filter structures based on search query
  const filteredStructures = structures.filter(structure =>
    structure.name.toLowerCase().includes(structuresSearchQuery.toLowerCase()) ||
    (structure.description && structure.description.toLowerCase().includes(structuresSearchQuery.toLowerCase()))
  );

  if (!session) {
    navigate('/signin');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="mx-auto max-w-7xl py-6 sm:px-6 lg:px-8">
        <Tabs 
          defaultValue="screenplays" 
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid w-full grid-cols-3 mb-8">
            <TabsTrigger value="screenplays">Screenplays</TabsTrigger>
            <TabsTrigger value="notes">Notes</TabsTrigger>
            <TabsTrigger value="structures">Structures</TabsTrigger>
          </TabsList>
          
          <TabsContent value="screenplays">
            <ScreenplaysTab 
              projects={filteredProjects}
              searchQuery={projectsSearchQuery}
              setSearchQuery={setProjectsSearchQuery}
              isLoading={isProjectsLoading}
              handleCreateNewProject={handleCreateNewProject}
              handleDeleteProject={handleDeleteProject}
            />
          </TabsContent>
          
          <TabsContent value="notes">
            <NotesTab 
              notes={filteredNotes}
              searchQuery={notesSearchQuery}
              setSearchQuery={setNotesSearchQuery}
              isLoading={isNotesLoading}
              handleCreateNote={handleCreateNote}
              handleDeleteNote={handleDeleteNote}
              handleViewNote={handleViewNote}
              handleEditNote={handleEditNote}
              isNoteEditorOpen={isNoteEditorOpen}
              setIsNoteEditorOpen={setIsNoteEditorOpen}
              currentNote={currentNote}
              handleSaveNote={handleSaveNote}
            />
          </TabsContent>
          
          <TabsContent value="structures">
            <StructuresTab 
              structures={filteredStructures}
              searchQuery={structuresSearchQuery}
              setSearchQuery={setStructuresSearchQuery}
              isLoading={isStructuresLoading}
              handleCreateStructure={handleCreateStructure}
              handleEditStructure={handleEditStructure}
              handleDeleteStructure={handleDeleteStructure}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
