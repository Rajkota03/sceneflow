
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useDashboardProjects } from '@/hooks/useDashboardProjects';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import ProjectGrid from '@/components/dashboard/ProjectGrid';
import EmptyState from '@/components/dashboard/EmptyState';
import LoadingState from '@/components/dashboard/LoadingState';

const Dashboard = () => {
  const {
    projects,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateNewProject,
    handleDeleteProject
  } = useDashboardProjects();

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <DashboardHeader 
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            onCreateNewProject={handleCreateNewProject}
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
            />
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
