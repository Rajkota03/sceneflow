import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, jsonToScriptContent, scriptContentToJson } from '@/lib/types';
import { emptyProject } from '@/lib/mockData';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TitlePageData } from '@/components/TitlePageEditor';

export const useDashboardProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      fetchProjects();
    } else {
      setIsLoading(false);
    }
  }, [session]);

  const fetchProjects = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .select('*')
        .eq('author_id', session.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching projects:', error);
        toast({
          title: 'Error fetching projects',
          description: error.message,
          variant: 'destructive',
        });
        setProjects([]);
      } else if (data) {
        const formattedProjects = data.map(project => ({
          id: project.id,
          title: project.title,
          authorId: project.author_id,
          createdAt: new Date(project.created_at),
          updatedAt: new Date(project.updated_at),
          content: jsonToScriptContent(project.content),
        }));
        setProjects(formattedProjects);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const filteredProjects = projects.filter(project => 
    project.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateNewProject = async () => {
    if (!session) {
      navigate('/sign-in');
      return;
    }
    
    const newProject: Project = {
      ...emptyProject,
      id: `project-${Date.now()}`,
      authorId: session.user.id,
      title: `Untitled Screenplay ${projects.length + 1}`,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    const defaultTitlePageData: TitlePageData = {
      title: newProject.title,
      author: session.user.user_metadata?.full_name || session.user.email || '',
      basedOn: '',
      contact: session.user.email || ''
    };
    
    try {
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: newProject.id,
          title: newProject.title,
          author_id: newProject.authorId,
          content: scriptContentToJson(newProject.content),
          title_page: defaultTitlePageData
        })
        .select();
      
      if (error) {
        console.error('Error creating project:', error);
        toast({
          title: 'Error creating project',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      // Optimistically add to local state
      setProjects([newProject, ...projects]);
      navigate(`/editor/${newProject.id}`);
    } catch (error) {
      console.error('Error creating project:', error);
    }
  };

  const handleDeleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error deleting project:', error);
        toast({
          title: 'Error deleting project',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setProjects(projects.filter(project => project.id !== id));
      toast({
        title: 'Project deleted',
        description: 'The project has been deleted successfully.',
      });
    } catch (error) {
      console.error('Error deleting project:', error);
    }
  };

  return {
    projects: filteredProjects,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateNewProject,
    handleDeleteProject
  };
};
