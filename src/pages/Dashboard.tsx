
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useDashboardProjects } from '@/hooks/useDashboardProjects';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingState from '@/components/dashboard/LoadingState';
import NotesGrid from '@/components/dashboard/NotesGrid';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, NotebookPen, Network } from 'lucide-react';
import { useState, useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { Note } from '@/lib/types';
import CreateNoteDialog from '@/components/notes/CreateNoteDialog';

const Dashboard = () => {
  const {
    projects,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateNewProject,
    handleDeleteProject
  } = useDashboardProjects();
  
  const [activeTab, setActiveTab] = useState("screenplays");
  const [notesSearchQuery, setNotesSearchQuery] = useState("");
  const [structuresSearchQuery, setStructuresSearchQuery] = useState("");
  const [notes, setNotes] = useState<Note[]>([]);
  const [isLoadingNotes, setIsLoadingNotes] = useState(false);
  const [createNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const { session } = useAuth();

  // Fetch standalone notes (not connected to a project)
  useEffect(() => {
    if (!session) return;

    const fetchNotes = async () => {
      setIsLoadingNotes(true);
      try {
        const { data, error } = await supabase
          .from('standalone_notes')
          .select('*')
          .eq('author_id', session.user.id);

        if (error) {
          console.error('Error fetching notes:', error);
          toast({
            title: 'Error loading notes',
            description: error.message,
            variant: 'destructive',
          });
        } else if (data) {
          // Convert the data to the Note type
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
        console.error('Error:', error);
      } finally {
        setIsLoadingNotes(false);
      }
    };

    if (activeTab === "notes") {
      fetchNotes();
    }
  }, [session, activeTab]);

  const handleCreateNote = (note: Note) => {
    const saveNote = async () => {
      if (!session) return;
      
      try {
        const { error } = await supabase
          .from('standalone_notes')
          .insert({
            id: note.id,
            title: note.title,
            content: note.content,
            author_id: session.user.id,
            created_at: note.createdAt.toISOString(),
            updated_at: note.updatedAt.toISOString()
          });
        
        if (error) {
          console.error('Error saving note:', error);
          toast({
            title: 'Error creating note',
            description: error.message,
            variant: 'destructive',
          });
          return;
        }
        
        setNotes([...notes, note]);
        toast({
          title: "Note created",
          description: `"${note.title}" has been created successfully.`
        });
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to save the note. Please try again.',
          variant: 'destructive',
        });
      }
    };
    
    saveNote();
  };

  const handleDeleteNote = async (noteId: string) => {
    if (!session) return;
    
    try {
      const { error } = await supabase
        .from('standalone_notes')
        .delete()
        .eq('id', noteId)
        .eq('author_id', session.user.id);
      
      if (error) {
        console.error('Error deleting note:', error);
        toast({
          title: 'Error deleting note',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setNotes(notes.filter(note => note.id !== noteId));
      toast({
        title: "Note deleted",
        description: "The note has been deleted successfully."
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete the note. Please try again.',
        variant: 'destructive',
      });
    }
  };

  // Filter notes based on search query
  const filteredNotes = notes.filter(note => 
    note.title.toLowerCase().includes(notesSearchQuery.toLowerCase()) || 
    note.content.toLowerCase().includes(notesSearchQuery.toLowerCase())
  );

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-8 text-left font-serif">My Projects</h1>
          
          <Tabs defaultValue="screenplays" value={activeTab} onValueChange={setActiveTab} className="mb-8">
            <TabsList className="grid grid-cols-3 mb-8 w-full max-w-md mx-auto">
              <TabsTrigger value="screenplays" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                <span>Screenplays</span>
              </TabsTrigger>
              <TabsTrigger value="notes" className="flex items-center gap-2">
                <NotebookPen className="h-4 w-4" />
                <span>Notes</span>
              </TabsTrigger>
              <TabsTrigger value="structures" className="flex items-center gap-2">
                <Network className="h-4 w-4" />
                <span>Structures</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="screenplays" className="mt-6">
              <DashboardHeader 
                searchQuery={searchQuery}
                setSearchQuery={setSearchQuery}
                onCreateNewProject={handleCreateNewProject}
                projectType="screenplay"
              />
              
              {isLoading ? (
                <LoadingState />
              ) : projects.length > 0 ? (
                <ProjectGrid 
                  projects={projects} 
                  onDeleteProject={handleDeleteProject} 
                />
              ) : (
                <EmptyState 
                  searchQuery={searchQuery}
                  clearSearch={() => setSearchQuery('')}
                  createNewProject={handleCreateNewProject}
                  emptyMessage="No screenplays yet"
                  createMessage="Create your first screenplay"
                />
              )}
            </TabsContent>
            
            <TabsContent value="notes" className="mt-6">
              <DashboardHeader 
                searchQuery={notesSearchQuery} 
                setSearchQuery={setNotesSearchQuery}
                onCreateNewProject={() => setCreateNoteDialogOpen(true)}
                projectType="note"
              />
              
              {isLoadingNotes ? (
                <LoadingState />
              ) : filteredNotes.length > 0 ? (
                <NotesGrid 
                  notes={filteredNotes} 
                  onDeleteNote={handleDeleteNote} 
                />
              ) : (
                <EmptyState 
                  searchQuery={notesSearchQuery}
                  clearSearch={() => setNotesSearchQuery('')}
                  createNewProject={() => setCreateNoteDialogOpen(true)}
                  emptyMessage="No notes yet"
                  createMessage="Create your first note"
                />
              )}
            </TabsContent>
            
            <TabsContent value="structures" className="mt-6">
              <DashboardHeader 
                searchQuery={structuresSearchQuery} 
                setSearchQuery={setStructuresSearchQuery}
                onCreateNewProject={() => {
                  toast({
                    title: "Creating a new structure",
                    description: "This functionality will be available soon!",
                  });
                }}
                projectType="structure"
              />
              <div className="border border-border rounded-lg p-8 mt-4 bg-card">
                <div className="text-center max-w-md mx-auto">
                  <Network className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-2xl font-medium mb-2">Story Structure Tools</h3>
                  <p className="text-muted-foreground mb-6">
                    Break down your screenplay using classic story structures or create your own custom
                    templates with interactive scene cards and direct script linking.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <Network className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Story Templates</p>
                        <p className="text-muted-foreground">3-Act, Hero's Journey, Save the Cat</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Scene Cards</p>
                        <p className="text-muted-foreground">Visualize and reorganize your story</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={() => {
                      toast({
                        title: "Creating a new structure",
                        description: "This functionality will be available soon!",
                      });
                    }}
                    className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
      
      <CreateNoteDialog 
        open={createNoteDialogOpen} 
        onOpenChange={setCreateNoteDialogOpen} 
        onCreateNote={handleCreateNote} 
      />
    </div>
  );
};

export default Dashboard;
