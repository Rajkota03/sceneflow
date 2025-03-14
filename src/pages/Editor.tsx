
import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScriptEditor from '../components/ScriptEditor';
import { Project, ScriptContent, jsonToScriptContent, scriptContentToJson } from '../lib/types';
import { emptyProject } from '../lib/mockData';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, FileText, ChevronDown, Eye, Loader, Check } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import EditorMenuBar from '../components/EditorMenuBar';
import { FormatProvider } from '@/lib/formatContext';
import { useAuth } from '@/App';
import { supabase } from '@/integrations/supabase/client';

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
              authorId: session.user.id,
              title: 'Untitled Screenplay',
              createdAt: new Date(),
              updatedAt: new Date(),
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
            authorId: data.author_id,
            createdAt: new Date(data.created_at),
            updatedAt: new Date(data.updated_at),
            content: jsonToScriptContent(data.content),
          };
          
          setProject(formattedProject);
          setTitle(formattedProject.title);
          setContent(formattedProject.content);
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
  };

  useEffect(() => {
    if (!project || isLoading || !session) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 20000); // Changed from 10000 to 20000 (20 seconds)
    
    return () => clearTimeout(autoSaveTimer);
  }, [content, title, project, isLoading, session]);

  const handleSave = async (isAutoSave = false) => {
    if (!project || !session) return;
    
    setIsSaving(true);
    
    if (!isAutoSave) {
      setSaveButtonText("Saving");
      setSaveButtonIcon("save");
    }
    
    try {
      const { error } = await supabase
        .from('projects')
        .update({
          title,
          content: scriptContentToJson(content),
          updated_at: new Date().toISOString(),
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
        // Update button text to "Saved" temporarily
        setSaveButtonText("Saved");
        setSaveButtonIcon("saved");
        
        // Set a timeout to change it back to "Save" after 2 seconds
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
      <div className="h-screen flex flex-col bg-slate-100 overflow-hidden">
        <EditorMenuBar onSave={() => handleSave()} />
        
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
            <Button variant="outline" size="sm" className="bg-white border-[#DDDDDD] text-[#333333] hover:bg-[#F9F9F9]">
              <Eye size={16} className="mr-1" />
              <span className="text-xs">Preview</span>
            </Button>

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
          <div>Page 1</div>
          <div className="flex items-center space-x-4">
            <span>Scene: 1</span>
            <span>Elements: {content.elements.length}</span>
            <span>Characters: {content.elements.filter(e => e.type === 'character').length}</span>
            {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </div>
          <div>100%</div>
        </div>
        
        <main className="flex-grow overflow-auto py-4 px-4 bg-[#EEEEEE]">
          <ScriptEditor initialContent={content} onChange={handleContentChange} />
        </main>
      </div>
    </FormatProvider>
  );
};

export default Editor;
