import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScriptEditor from '../components/ScriptEditor';
import { Project, ScriptContent } from '../lib/types';
import { emptyProject } from '../lib/mockData';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, FileText, ChevronDown, Eye, Loader } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';
import EditorMenuBar from '../components/EditorMenuBar';
import { FormatProvider } from '@/lib/formatContext';
import { useUser } from '@clerk/clerk-react';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { user } = useUser();
  
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ScriptContent>({ elements: [] });
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load project data
  useEffect(() => {
    console.log("Loading project data...");
    setIsLoading(true);
    
    setTimeout(() => {
      if (projectId) {
        // Create a default element if none exists
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
          authorId: user?.id || 'anonymous',
          title: 'Untitled Screenplay',
          createdAt: new Date(),
          updatedAt: new Date(),
          content: defaultContent
        };
        
        console.log("Created new project:", newProject);
        setProject(newProject);
        setTitle(newProject.title);
        setContent(newProject.content);
      }
      setIsLoading(false);
    }, 800);
  }, [projectId, user?.id]);

  const handleContentChange = useCallback((newContent: ScriptContent) => {
    setContent(newContent);
  }, []);

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };

  // Auto-save functionality
  useEffect(() => {
    if (!project || isLoading) return;
    
    const autoSaveTimer = setTimeout(() => {
      handleSave(true);
    }, 10000); // Auto-save after 10 seconds of inactivity
    
    return () => clearTimeout(autoSaveTimer);
  }, [content, title, project, isLoading]);

  const handleSave = (isAutoSave = false) => {
    if (!project) return;
    
    setIsSaving(true);
    
    // In a real app, this would save to a database
    setTimeout(() => {
      setIsSaving(false);
      setLastSaved(new Date());
      
      if (!isAutoSave) {
        toast({
          title: "Script saved",
          description: "Your screenplay has been saved successfully."
        });
      }
    }, 800);
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
      <div className="min-h-screen flex flex-col bg-slate-100">
        {/* Main menu bar */}
        <EditorMenuBar onSave={() => handleSave()} />
        
        {/* Toolbar */}
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

            <Button onClick={() => handleSave()} disabled={isSaving} size="sm" className="bg-[#0FA0CE] hover:bg-[#0D8CAF] text-white">
              {isSaving ? 
                <div className="animate-spin mr-1 h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div> 
                : <Save size={16} className="mr-1" />
              }
              <span className="text-xs">Save</span>
            </Button>
          </div>
        </div>
        
        {/* Status bar */}
        <div className="fixed bottom-0 left-0 right-0 bg-[#F1F1F1] border-t border-[#DDDDDD] py-1 px-4 flex items-center justify-between text-xs text-[#555555]">
          <div>Page 1</div>
          <div className="flex items-center space-x-4">
            <span>Scene: 1</span>
            <span>Elements: {content.elements.length}</span>
            <span>Characters: {content.elements.filter(e => e.type === 'character').length}</span>
            {lastSaved && <span>Last saved: {lastSaved.toLocaleTimeString()}</span>}
          </div>
          <div>100%</div>
        </div>
        
        <main className="flex-grow pt-4 pb-10 flex justify-center px-4 bg-[#EEEEEE] overflow-auto">
          <ScriptEditor initialContent={content} onChange={handleContentChange} />
        </main>
      </div>
    </FormatProvider>
  );
};

export default Editor;
