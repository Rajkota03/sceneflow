
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, Note, jsonToScriptContent, scriptContentToJson } from '@/lib/types';
import { emptyProject } from '@/lib/mockData';
import { useAuth } from '@/App';
import { supabase, generateUniqueNoteId } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { TitlePageData } from '@/components/TitlePageEditor';

export const useDashboardProjects = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const navigate = useNavigate();
  const { session } = useAuth();

  useEffect(() => {
    if (session) {
      fetchProjects();
      fetchNotes();
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
          author_id: project.author_id,
          created_at: project.created_at,
          updated_at: project.updated_at,
          content: jsonToScriptContent(project.content)
        })) as Project[];
        
        setProjects(formattedProjects);
        console.log('Loaded projects:', formattedProjects.length);
      }
    } catch (error) {
      console.error('Error fetching projects:', error);
      setProjects([]);
    } finally {
      setIsLoading(false);
    }
  };

  const fetchNotes = async () => {
    if (!session) return;
    
    try {
      const { data, error } = await supabase
        .from('standalone_notes')
        .select('*')
        .eq('author_id', session.user.id)
        .order('updated_at', { ascending: false });
      
      if (error) {
        console.error('Error fetching notes:', error);
        toast({
          title: 'Error fetching notes',
          description: error.message,
          variant: 'destructive',
        });
        setNotes([]);
      } else if (data) {
        const formattedNotes = data.map(note => ({
          id: note.id,
          title: note.title,
          content: note.content,
          createdAt: new Date(note.created_at || Date.now()),
          updatedAt: new Date(note.updated_at || Date.now())
        })) as Note[];
        
        setNotes(formattedNotes);
        console.log('Loaded standalone notes:', formattedNotes.length);
      }
    } catch (error) {
      console.error('Error fetching notes:', error);
      setNotes([]);
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
      author_id: session.user.id,
      title: `Untitled Screenplay ${projects.length + 1}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
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
          author_id: newProject.author_id,
          content: scriptContentToJson(newProject.content),
          title_page: defaultTitlePageData,
          notes: []
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

  const handleCreateNote = async (note: Note) => {
    if (!session) return;
    
    try {
      const uniqueNoteId = note.id || generateUniqueNoteId();
      
      const newNote: Note = {
        ...note,
        id: uniqueNoteId,
        createdAt: note.createdAt || new Date(),
        updatedAt: new Date()
      };
      
      const { error } = await supabase
        .from('standalone_notes')
        .insert({
          id: newNote.id,
          title: newNote.title,
          content: newNote.content,
          author_id: session.user.id,
          created_at: newNote.createdAt.toISOString(),
          updated_at: newNote.updatedAt.toISOString()
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
      
      setNotes(prevNotes => [newNote, ...prevNotes]);
      console.log('Note created successfully:', newNote.title);
      toast({
        title: "Note created",
        description: `"${newNote.title}" has been created successfully.`
      });
      return newNote;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the note. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
  };

  const handleUpdateNote = async (note: Note) => {
    if (!session || !note.id) return;
    
    try {
      const updatedNote: Note = {
        ...note,
        updatedAt: new Date()
      };
      
      const { error } = await supabase
        .from('standalone_notes')
        .update({
          title: updatedNote.title,
          content: updatedNote.content,
          updated_at: updatedNote.updatedAt.toISOString()
        })
        .eq('id', updatedNote.id)
        .eq('author_id', session.user.id);
      
      if (error) {
        console.error('Error updating note:', error);
        toast({
          title: 'Error updating note',
          description: error.message,
          variant: 'destructive',
        });
        return;
      }
      
      setNotes(prevNotes => prevNotes.map(n => 
        n.id === updatedNote.id ? updatedNote : n
      ));
      
      console.log('Note updated successfully:', updatedNote.title);
      toast({
        title: "Note updated",
        description: `"${updatedNote.title}" has been updated successfully.`
      });
      return updatedNote;
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to update the note. Please try again.',
        variant: 'destructive',
      });
      return null;
    }
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

  return {
    projects: filteredProjects,
    notes,
    searchQuery,
    setSearchQuery,
    isLoading,
    handleCreateNewProject,
    handleDeleteProject,
    handleCreateNote,
    handleUpdateNote,
    handleDeleteNote
  };
};
