import { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ScriptEditor from '../components/script-editor/ScriptEditor';
import { Project, ScriptContent, jsonToScriptContent, scriptContentToJson, Note } from '../lib/types';
import { emptyProject } from '../lib/mockData';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, FileText, ChevronDown, Eye, Loader, Check, Edit, Pencil } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import EditorMenuBar from '../components/EditorMenuBar';
import { FormatProvider } from '@/lib/formatContext';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';
import TitlePageView from '@/components/TitlePageView';
import { TitlePageData } from '@/components/TitlePageEditor';
import { Json } from '@/integrations/supabase/types';
import NotesMenu from '@/components/notes/NotesMenu';
import NoteWindow from '@/components/notes/NoteWindow';
import CreateNoteDialog from '@/components/notes/CreateNoteDialog';
import NoteEditor from '@/components/notes/NoteEditor';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  
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
                author_id: newProject.authorId,
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
                processedNotes = notesRawData.map(note => ({
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="flex flex-col items-center">
          <Loader className="animate-spin h-8 w-8 text-primary mb-4" />
          <p className="text-slate-600">Loading your screenplay...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-100">
        <div className="text-center">
          <p className="text-xl font-medium text-slate-900 mb-4">Project not found</p>
          <Button onClick={() => navigate('/dashboard')}>Return to Dashboard</Button>
        </div>
      </div>
    );
  }

  return (
    <FormatProvider>
      <div className="h-screen flex flex-col bg-slate-100 overflow-hidden" ref={mainContainerRef}>
        <EditorMenuBar 
          onSave={() => handleSave()} 
          onSaveAs={handleSaveAs} 
          onTitlePage={() => toggleTitlePage()}
          onEditTitlePage={(data) => handleTitlePageUpdate(data)}
          titlePageData={titlePageData}
          showTitlePage={showTitlePage}
          onToggleTitlePage={toggleTitlePage}
          notes={notes}
          onCreateNote={handleCreateNoteClick}
          onOpenNote={handleOpenNote}
          onEditNote={handleEditNote}
        />
        
        <div className="bg-[#F1F1F1] border-b border-[#DDDDDD] py-1 px-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-[#333333] hover:bg-[#DDDDDD]" onClick={() => navigate('/dashboard')}>
                    <ArrowLeft size={16} />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>Back to Dashboard</TooltipContent>
              </Tooltip>
            </TooltipProvider>
            
            <div className="flex items-center space-x-2 bg-white px-2 py-1 rounded border border-[#DDDDDD]">
              <FileText size={16} className="text-[#666666]" />
              <Input 
                type="text" 
                value={title} 
                onChange={handleTitleChange} 
                className="w-48 font-medium border-none h-6 focus-visible:ring-0 p-0 text-[#333333] text-sm" 
                placeholder="Untitled Screenplay" 
              />
              <ChevronDown size={16} className="text-[#666666]" />
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <NotesMenu 
              notes={notes}
              onOpenNote={handleOpenNote}
              onCreateNote={handleCreateNote}
              onDeleteNote={handleDeleteNote}
              onEditNote={handleEditNote}
            />
            
            <Button
              onClick={() => handleSave()}
              disabled={isSaving}
              size="sm"
              className="bg-[#0FA0CE] hover:bg-[#0D8CAF] text-white min-w-[70px]"
            >
              {isSaving ? (
                <div className="animate-spin mr-1 h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
              ) : saveButtonIcon === "save" ? (
                <Save size={16} className="mr-1" />
              ) : (
                <Check size={16} className="mr-1" />
              )}
              <span className="text-xs">{saveButtonText}</span>
            </Button>
          </div>
        </div>
        
        <div className="fixed bottom-0 left-0 right-0 bg-[#F1F1F1] border-t border-[#DDDDDD] py-1 px-4 flex items-center justify-between text-xs text-[#555555] z-10">
          <div>{showTitlePage ? "Title Page" : "Page 1"}</div>
          <div className="flex items-center space-x-4">
            {!showTitlePage && (
              <>
                <span>Scene: 1</span>
                <span>Elements: {content.elements.length}</span>
                <span>Characters: {content.elements.filter(e => e.type === 'character').length}</span>
              </>
            )}
            {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </div>
          <div>100%</div>
        </div>
        
        <main className="flex-grow overflow-hidden py-4 px-4 bg-[#EEEEEE] relative">
          {splitScreenNote ? (
            <ResizablePanelGroup direction="horizontal" className="h-full">
              <ResizablePanel defaultSize={70} minSize={30}>
                <div className="h-full overflow-auto">
                  {showTitlePage ? (
                    <TitlePageView data={titlePageData} />
                  ) : (
                    <ScriptEditor 
                      initialContent={content} 
                      onChange={handleContentChange} 
                      className="overflow-auto"
                      projectName={title}
                      structureName="Three Act Structure"
                      projectId={projectId}
                    />
                  )}
                </div>
              </ResizablePanel>
              
              <ResizableHandle withHandle />
              
              <ResizablePanel defaultSize={30} minSize={20}>
                <div className="h-full flex flex-col">
                  <div className="bg-gray-50 px-3 py-2 flex justify-between items-center border-b">
                    <h3 className="text-sm font-medium">Notes</h3>
                    <div className="flex space-x-2">
                      {splitScreenNote && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => handleEditNote(splitScreenNote)}
                          className="text-xs h-7"
                        >
                          <Pencil size={14} className="mr-1" />
                          Edit
                        </Button>
                      )}
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={exitSplitScreen}
                        className="text-xs h-7"
                      >
                        Exit Split View
                      </Button>
                    </div>
                  </div>
                  <div className="flex-grow overflow-auto p-3">
                    {splitScreenNote && (
                      <NoteWindow 
                        note={splitScreenNote} 
                        onClose={() => handleCloseNote(splitScreenNote.id)} 
                        onSplitScreen={() => {}} 
                        isFloating={false}
                        onEditNote={handleEditNote}
                      />
                    )}
                  </div>
                </div>
              </ResizablePanel>
            </ResizablePanelGroup>
          ) : (
            <>
              {showTitlePage ? (
                <TitlePageView data={titlePageData} />
              ) : (
                <ScriptEditor 
                  initialContent={content} 
                  onChange={handleContentChange}
                  projectName={title}
                  structureName="Three Act Structure" 
                  projectId={projectId}
                />
              )}
            </>
          )}
          
          {openNotes.map(note => (
            <NoteWindow 
              key={note.id}
              note={note}
              onClose={() => handleCloseNote(note.id)}
              onSplitScreen={handleSplitScreen}
              isFloating={true}
              onEditNote={handleEditNote}
            />
          ))}
        </main>
        
        <NoteEditor 
          open={noteEditorOpen} 
          onOpenChange={setNoteEditorOpen} 
          note={currentEditNote}
          onSaveNote={handleSaveNote}
        />
      </div>
    </FormatProvider>
  );
};

export default Editor;
