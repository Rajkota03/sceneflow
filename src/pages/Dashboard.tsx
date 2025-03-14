
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProjectCard from '../components/ProjectCard';
import { emptyProject } from '../lib/mockData';
import { Project } from '../lib/types';
import { Plus, Search, Loader } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useUser } from '@clerk/clerk-react';

const Dashboard = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { user } = useUser();

  useEffect(() => {
    // In a real app, you would fetch user's projects from a database
    // For now, simulate loading and show empty state
    setTimeout(() => {
      setIsLoading(false);
    }, 1000);
  }, []);

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewProject = () => {
    const newProject = {
      ...emptyProject,
      id: `project-${Date.now()}`,
      authorId: user?.id || 'anonymous',
      title: `Untitled Screenplay ${projects.length + 1}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setProjects([newProject, ...projects]);
    navigate(`/editor/${newProject.id}`);
  };

  const handleDeleteProject = (id: string) => {
    setProjects(projects.filter(project => project.id !== id));
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-grow pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-serif font-bold text-slate-900 mb-2">My Projects</h1>
              <p className="text-slate-600">Manage your screenplays and scripts</p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-4 w-full md:w-auto">
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" size={18} />
                <Input 
                  type="text" 
                  placeholder="Search projects" 
                  className="w-full pl-10"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              
              <Button onClick={handleCreateNewProject} className="flex items-center">
                <Plus size={18} className="mr-2" />
                New Project
              </Button>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex flex-col items-center justify-center py-16">
              <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
              <p className="text-slate-600">Loading your projects...</p>
            </div>
          ) : filteredProjects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProjects.map(project => (
                <ProjectCard 
                  key={project.id} 
                  project={project} 
                  onDelete={handleDeleteProject} 
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              {searchQuery ? (
                <div>
                  <p className="text-xl font-medium text-slate-900 mb-3">No projects match your search</p>
                  <p className="text-slate-600 mb-6">Try adjusting your search terms</p>
                  <Button variant="outline" onClick={() => setSearchQuery('')}>Clear Search</Button>
                </div>
              ) : (
                <div>
                  <p className="text-xl font-medium text-slate-900 mb-3">You don't have any projects yet</p>
                  <p className="text-slate-600 mb-6">Create your first screenplay</p>
                  <Button onClick={handleCreateNewProject}>Create New Project</Button>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
      
      <Footer />
    </div>
  );
};

export default Dashboard;
