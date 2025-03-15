
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useDashboardProjects } from '@/hooks/useDashboardProjects';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingState from '@/components/dashboard/LoadingState';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { FileText, NotebookPen, DiagramTree } from 'lucide-react';
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
                <DiagramTree className="h-4 w-4" />
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
                searchQuery="" 
                setSearchQuery={() => {}}
                onCreateNewProject={handleCreateNote}
                projectType="note"
              />
              <EmptyState 
                searchQuery=""
                clearSearch={() => {}}
                createNewProject={handleCreateNote}
                emptyMessage="No notes yet"
                createMessage="Create your first note"
                icon={<NotebookPen className="h-16 w-16 text-muted-foreground mb-4" />}
              />
            </TabsContent>
            
            <TabsContent value="structures" className="mt-6">
              <DashboardHeader 
                searchQuery="" 
                setSearchQuery={() => {}}
                onCreateNewProject={handleCreateStructure}
                projectType="structure"
              />
              <EmptyState 
                searchQuery=""
                clearSearch={() => {}}
                createNewProject={handleCreateStructure}
                emptyMessage="No structures yet"
                createMessage="Create your first structure"
                icon={<DiagramTree className="h-16 w-16 text-muted-foreground mb-4" />}
              />
            </TabsContent>
          </Tabs>
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
