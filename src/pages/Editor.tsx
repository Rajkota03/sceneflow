
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScriptEditor from '../components/ScriptEditor';
import { Project, ScriptContent } from '../lib/types';
import { sampleProjects, emptyProject } from '../lib/mockData';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, FileText } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from '@/components/ui/use-toast';

const Editor = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  
  const [project, setProject] = useState<Project | null>(null);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState<ScriptContent>({ elements: [] });
  const [isSaving, setIsSaving] = useState(false);
  
  // Find the project or use a default one
  useEffect(() => {
    const foundProject = sampleProjects.find(p => p.id === projectId);
    
    if (foundProject) {
      setProject(foundProject);
      setTitle(foundProject.title);
      setContent(foundProject.content);
    } else if (projectId) {
      // This would be a new project with a generated ID
      const newProject = {
        ...emptyProject,
        id: projectId,
      };
      setProject(newProject);
      setTitle(newProject.title);
      setContent(newProject.content);
    }
  }, [projectId]);
  
  const handleContentChange = (newContent: ScriptContent) => {
    setContent(newContent);
  };
  
  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setTitle(e.target.value);
  };
  
  const handleSave = () => {
    if (!project) return;
    
    setIsSaving(true);
    
    // Simulate a save operation
    setTimeout(() => {
      setIsSaving(false);
      toast({
        title: "Script saved",
        description: "Your screenplay has been saved successfully.",
      });
    }, 800);
  };
  
  if (!project) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      <Navbar />
      
      <main className="flex-grow pt-16">
        <div className="editor-header fixed top-16 left-0 right-0 z-10 bg-white border-b border-slate-200 py-3">
          <div className="container mx-auto px-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button 
                        variant="ghost" 
                        size="icon"
                        onClick={() => navigate('/dashboard')}
                      >
                        <ArrowLeft size={20} />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>Back to Dashboard</TooltipContent>
                  </Tooltip>
                </TooltipProvider>
                
                <div className="flex items-center space-x-2">
                  <FileText size={18} className="text-primary" />
                  <Input
                    type="text"
                    value={title}
                    onChange={handleTitleChange}
                    className="w-64 font-medium border-none focus-visible:ring-0 p-0 text-slate-900 font-serif"
                  />
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center"
                >
                  {isSaving ? (
                    <div className="animate-spin mr-2 h-4 w-4 border-2 border-white border-t-transparent rounded-full"></div>
                  ) : (
                    <Save size={18} className="mr-2" />
                  )}
                  Save
                </Button>
              </div>
            </div>
          </div>
        </div>
        
        <div className="pt-20 pb-16 flex justify-center px-4">
          <ScriptEditor initialContent={content} onChange={handleContentChange} />
        </div>
      </main>
    </div>
  );
};

export default Editor;
