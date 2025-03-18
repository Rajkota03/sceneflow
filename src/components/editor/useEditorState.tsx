
import { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Project, ScriptContent, jsonToScriptContent, scriptContentToJson, Note, TitlePageData } from '@/lib/types';
import { emptyProject } from '@/lib/mockData';
import { Json } from '@/integrations/supabase/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

interface UseEditorStateProps {
  projectId: string | undefined;
  session: any;
}

export const useEditorState = ({ projectId, session }: UseEditorStateProps) => {
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ScriptContent>({ elements: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [saveButtonText, setSaveButtonText] = useState("Save");
  const [saveButtonIcon, setSaveButtonIcon] = useState<"save" | "saved">("save");
  const [showTitlePage, setShowTitlePage] = useState(false);
  const [titlePageData, setTitlePageData] = useState<TitlePageData>({
    title: '',
    author: '',
    basedOn: '',
    contact: ''
  });
  
  const [notes, setNotes] = useState<Note[]>([]);
  const [openNotes, setOpenNotes] = useState<Note[]>([]);
  const [splitScreenNote, setSplitScreenNote] = useState<Note | null>(null);
  const [createNoteDialogOpen, setCreateNoteDialogOpen] = useState(false);
  const [noteEditorOpen, setNoteEditorOpen] = useState(false);
  const [currentEditNote, setCurrentEditNote] = useState<Note | null>(null);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(null);
  const mainContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!session || !projectId) return;
    
    const fetchProject = async () => {
      setIsLoading(true);
      
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('*')
          .eq('id', projectId)
          .eq('author_id', session.user.id)
          .single();
        
        if (error) {
          console.error('Error fetching project:', error);
          
          if (error.code === 'PGRST116') {
            const defaultContent: ScriptContent = {
              elements: [
                {
                  id: "default-element-1",
                  type: "scene-heading",
                  text: "INT. SOMEWHERE - DAY"
                },
                {
                  id: "default-element-2",
                  type: "action",
                  text: "Start writing your screenplay here..."
                }
              ]
            };
            
            const newProject: Project = {
              ...emptyProject,
              id: projectId,
              author_id: session.user.id,
              title: 'Untitled Screenplay',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
              content: defaultContent
            };
            
            const { error: insertError } = await supabase
              .from('projects')
              .insert({
                id: newProject.id,
                title: newProject.title,
                author_id: newProject.author_id,
                content: scriptContentToJson(newProject.content),
              });
            
            if (insertError) {
              console.error('Error creating project:', insertError);
              toast({
                title: 'Error creating project',
                description: insertError.message,
                variant: 'destructive',
              });
              navigate('/dashboard');
              return;
            }
            
            setProject(newProject);
            setTitle(newProject.title);
            setContent(newProject.content);
            setTitlePageData({
              title: newProject.title,
              author: session.user.user_metadata?.full_name || session.user.email || '',
              basedOn: '',
              contact: session.user.email || ''
            });
          } else {
            toast({
              title: 'Error loading project',
              description: error.message,
              variant: 'destructive',
            });
            navigate('/dashboard');
          }
        } else if (data) {
          const formattedProject: Project = {
            id: data.id,
            title: data.title,
            author_id: data.author_id,
            created_at: data.created_at,
            updated_at: data.updated_at,
            content: jsonToScriptContent(data.content),
          };
          
          setProject(formattedProject);
          setTitle(formattedProject.title);
          setContent(formattedProject.content);
          
          if (data.title_page) {
            const titleData = data.title_page as Json as unknown as TitlePageData;
            setTitlePageData(titleData);
          } else {
            setTitlePageData({
              title: formattedProject.title,
              author: session.user.user_metadata?.full_name || session.user.email || '',
              basedOn: '',
              contact: session.user.email || ''
            });
          }
          
          if (data.notes) {
            try {
              const notesRawData = data.notes as Json;
              let processedNotes: Note[] = [];
              
              if (Array.isArray(notesRawData)) {
                processedNotes = notesRawData.map((note: any) => ({
                  id: note.id || '',
                  title: note.title || '',
                  content: note.content || '',
                  createdAt: new Date(note.createdAt || note.created_at || Date.now()),
                  updatedAt: new Date(note.updatedAt || note.updated_at || Date.now())
                }));
              }
              
              console.log('Processed notes:', processedNotes.length);
              setNotes(processedNotes);
            } catch (noteError) {
              console.error('Error processing notes:', noteError);
              setNotes([]);
            }
          } else {
            setNotes([]);
          }
        }
      } catch (error) {
        console.error('Error:', error);
        toast({
          title: 'Error',
          description: 'Failed to load the project. Please try again.',
          variant: 'destructive',
        });
        navigate('/dashboard');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchProject();
  }, [projectId, session, navigate]);

  const handleContentChange = useCallback((newContent: ScriptContent) => {
    setContent(newContent);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
    
    setTitlePageData(prev => ({
      ...prev,
      title: e.target.value
    }));
  };

  useEffect(() => {
    if (!project || isLoading || !session) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 20000);
    
    return () => clearTimeout(autoSaveTimer);
  }, [content, title, project, isLoading, session, titlePageData, notes]);

  const handleSave = async (isAutoSave = false) => {
    if (!project || !session) return;
    
    setIsSaving(true);
    
    if (!isAutoSave) {
      setSaveButtonText("Saving");
      setSaveButtonIcon("save");
    }
    
    try {
      const notesForStorage = notes.map(note => ({
        ...note,
        createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
        updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt
      }));
      
      const { error } = await supabase
        .from('projects')
        .update({
          title,
          content: scriptContentToJson(content),
          updated_at: new Date().toISOString(),
          title_page: titlePageData as unknown as Json,
          notes: notesForStorage as unknown as Json
        })
        .eq('id', project.id);
      
      if (error) {
        console.error('Error saving project:', error);
        if (!isAutoSave) {
          toast({
            title: 'Error saving project',
            description: error.message,
            variant: 'destructive',
          });
          setSaveButtonText("Save");
          setSaveButtonIcon("save");
        }
        return;
      }
      
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        setSaveButtonText("Saved");
        setSaveButtonIcon("saved");
        
        setTimeout(() => {
          setSaveButtonText("Save");
          setSaveButtonIcon("save");
        }, 2000);
        
        toast({
          title: "Script saved",
          description: "Your screenplay has been saved successfully."
        });
      }
    } catch (error) {
      console.error('Error:', error);
      if (!isAutoSave) {
        toast({
          title: 'Error',
          description: 'Failed to save the project. Please try again.',
          variant: 'destructive',
        });
        setSaveButtonText("Save");
        setSaveButtonIcon("save");
      }
    } finally {
      setIsSaving(false);
    }
  };

  const handleSaveAs = async (newTitle: string) => {
    if (!project || !session) return;
    
    setIsSaving(true);
    setSaveButtonText("Saving");
    setSaveButtonIcon("save");
    
    try {
      const newProjectId = `project-${Date.now()}`;
      
      const updatedTitlePageData = {
        ...titlePageData,
        title: newTitle
      };
      
      const { data, error } = await supabase
        .from('projects')
        .insert({
          id: newProjectId,
          title: newTitle,
          author_id: session.user.id,
          content: scriptContentToJson(content),
          title_page: updatedTitlePageData as unknown as Json,
          notes: notes as unknown as Json
        })
        .select('id')
        .single();
      
      if (error) {
        console.error('Error creating new project:', error);
        toast({
          title: 'Error saving project',
          description: error.message,
          variant: 'destructive',
        });
        setSaveButtonText("Save");
        setSaveButtonIcon("save");
        return;
      }
      
      toast({
        title: "Script saved",
        description: `Your screenplay has been saved as "${newTitle}".`
      });
      
      navigate(`/editor/${data.id}`);
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: 'Error',
        description: 'Failed to save the project. Please try again.',
        variant: 'destructive',
      });
      setSaveButtonText("Save");
      setSaveButtonIcon("save");
    } finally {
      setIsSaving(false);
    }
  };

  const handleTitlePageUpdate = (data: TitlePageData) => {
    setTitlePageData(data);
    if (data.title !== title) {
      setTitle(data.title);
    }
  };

  const toggleTitlePage = () => {
    setShowTitlePage(!showTitlePage);
  };
  
  const handleCreateNoteClick = () => {
    setCurrentEditNote(null);
    setNoteEditorOpen(true);
  };
  
  const handleCreateNote = (note: Note) => {
    setNotes([...notes, note]);
    handleOpenNote(note);
  };
  
  const handleOpenNote = (note: Note) => {
    console.log('Opening note in Editor component:', note);
    if (!openNotes.some(n => n.id === note.id)) {
      setOpenNotes([...openNotes, note]);
    }
  };
  
  const handleCloseNote = (noteId: string) => {
    setOpenNotes(openNotes.filter(note => note.id !== noteId));
    
    if (splitScreenNote && splitScreenNote.id === noteId) {
      setSplitScreenNote(null);
    }
  };
  
  const handleDeleteNote = (noteId: string) => {
    setNotes(notes.filter(note => note.id !== noteId));
    handleCloseNote(noteId);
    
    toast({
      title: "Note deleted",
      description: "The note has been deleted successfully."
    });
  };
  
  const handleSplitScreen = (note: Note) => {
    setSplitScreenNote(note);
    setOpenNotes(openNotes.filter(n => n.id !== note.id));
  };
  
  const exitSplitScreen = () => {
    if (splitScreenNote) {
      setOpenNotes([...openNotes, splitScreenNote]);
      setSplitScreenNote(null);
    }
  };

  const handleEditNote = (note: Note) => {
    setCurrentEditNote(note);
    setNoteEditorOpen(true);
  };

  const handleSaveNote = (updatedNote: Note) => {
    if (currentEditNote) {
      setNotes(notes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      
      setOpenNotes(openNotes.map(note => 
        note.id === updatedNote.id ? updatedNote : note
      ));
      
      if (splitScreenNote && splitScreenNote.id === updatedNote.id) {
        setSplitScreenNote(updatedNote);
      }
      
      handleSave(false);
    } else {
      const newNotes = [...notes, updatedNote];
      setNotes(newNotes);
      handleOpenNote(updatedNote);
      
      handleSave(false);
    }
  };

  const handleStructureChange = (structureId: string) => {
    setSelectedStructureId(structureId);
    
    if (projectId) {
      const linkStructure = async () => {
        try {
          await supabase
            .from('project_structures')
            .delete()
            .eq('project_id', projectId);
          
          const { error } = await supabase
            .from('project_structures')
            .insert({
              project_id: projectId,
              structure_id: structureId
            });
          
          if (error) {
            console.error('Error linking structure:', error);
            toast({
              title: 'Error',
              description: 'Failed to link the structure to the screenplay.',
              variant: 'destructive',
            });
          } else {
            toast({
              title: 'Structure linked',
              description: 'The structure has been linked to the screenplay.',
            });
          }
        } catch (error) {
          console.error('Error linking structure:', error);
        }
      };
      
      linkStructure();
    }
  };

  return {
    project,
    title,
    content,
    isSaving,
    lastSaved,
    isLoading,
    saveButtonText,
    saveButtonIcon,
    showTitlePage,
    titlePageData,
    notes,
    openNotes,
    splitScreenNote,
    createNoteDialogOpen,
    noteEditorOpen,
    currentEditNote,
    selectedStructureId,
    mainContainerRef,
    setCreateNoteDialogOpen,
    setNoteEditorOpen,
    handleContentChange,
    handleTitleChange,
    handleSave,
    handleSaveAs,
    handleTitlePageUpdate,
    toggleTitlePage,
    handleCreateNoteClick,
    handleCreateNote,
    handleOpenNote,
    handleCloseNote,
    handleDeleteNote,
    handleSplitScreen,
    exitSplitScreen,
    handleEditNote,
    handleSaveNote,
    handleStructureChange,
  };
};
