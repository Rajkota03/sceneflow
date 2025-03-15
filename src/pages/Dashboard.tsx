
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useDashboardProjects } from '@/hooks/useDashboardProjects';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingState from '@/components/dashboard/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, NotebookPen, Network } from 'lucide-react';
import { useState } from 'react';
import { toast } from '@/components/ui/use-toast';

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

  const handleCreateNote = () => {
    toast({
      title: "Creating a new note",
      description: "This functionality will be available soon!",
    });
  };

  const handleCreateStructure = () => {
    toast({
      title: "Creating a new structure",
      description: "This functionality will be available soon!",
    });
  };

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
                onCreateNewProject={handleCreateNote}
                projectType="note"
              />
              <div className="border border-border rounded-lg p-8 mt-4 bg-card">
                <div className="text-center max-w-md mx-auto">
                  <NotebookPen className="h-16 w-16 text-muted-foreground mb-4 mx-auto" />
                  <h3 className="text-2xl font-medium mb-2">Screenplay Notes</h3>
                  <p className="text-muted-foreground mb-6">
                    Organize your thoughts, research, and character details with rich text formatting, 
                    tagging, and direct links to your screenplay.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-left text-sm">
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <FileText className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Rich Text Editor</p>
                        <p className="text-muted-foreground">Format with headings, lists, and more</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-2">
                      <div className="bg-primary/10 p-2 rounded-full">
                        <NotebookPen className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="font-medium">Tagging System</p>
                        <p className="text-muted-foreground">Organize by character, plot, theme, etc.</p>
                      </div>
                    </div>
                  </div>
                  <button 
                    onClick={handleCreateNote}
                    className="mt-6 inline-flex items-center justify-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow hover:bg-primary/90 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50"
                  >
                    Coming Soon
                  </button>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="structures" className="mt-6">
              <DashboardHeader 
                searchQuery={structuresSearchQuery} 
                setSearchQuery={setStructuresSearchQuery}
                onCreateNewProject={handleCreateStructure}
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
                    onClick={handleCreateStructure}
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
    </div>
  );
};

export default Dashboard;
