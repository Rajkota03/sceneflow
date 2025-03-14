
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import ScriptEditor from '../components/ScriptEditor';
import { Project, ScriptContent } from '../lib/types';
import { sampleProjects, emptyProject } from '../lib/mockData';
import { Button } from '@/components/ui/button';
import { Save, ArrowLeft, FileText, ChevronDown, Eye, Table, SplitSquareVertical, LayoutGrid } from 'lucide-react';
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
      {/* Main menu bar */}
      <div className="bg-[#222222] text-white py-1 px-4 flex items-center text-sm border-b border-[#333333]">
        <div className="font-bold mr-6">Scene Flow</div>
        <div className="flex space-x-4">
          <span className="cursor-pointer hover:text-blue-300">File</span>
          <span className="cursor-pointer hover:text-blue-300">Edit</span>
          <span className="cursor-pointer hover:text-blue-300">View</span>
          <span className="cursor-pointer hover:text-blue-300">Format</span>
          <span className="cursor-pointer hover:text-blue-300">Tools</span>
          <span className="cursor-pointer hover:text-blue-300">Production</span>
          <span className="cursor-pointer hover:text-blue-300">Help</span>
        </div>
      </div>
      
      {/* Toolbar */}
      <div className="bg-[#F1F1F1] border-b border-[#DDDDDD] py-1 px-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="text-[#333333] hover:bg-[#DDDDDD]"
                  onClick={() => navigate('/dashboard')}
                >
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
          <Button 
            variant="outline"
            size="sm"
            className="bg-white border-[#DDDDDD] text-[#333333] hover:bg-[#F9F9F9]"
          >
            <Eye size={16} className="mr-1" />
            <span className="text-xs">Preview</span>
          </Button>

          <Button 
            onClick={handleSave}
            disabled={isSaving}
            size="sm"
            className="bg-[#0FA0CE] hover:bg-[#0D8CAF] text-white"
          >
            {isSaving ? (
              <div className="animate-spin mr-1 h-3 w-3 border-2 border-white border-t-transparent rounded-full"></div>
            ) : (
              <Save size={16} className="mr-1" />
            )}
            <span className="text-xs">Save</span>
          </Button>
        </div>
      </div>
      
      {/* Element type toolbar */}
      <div className="bg-[#F9F9F9] border-b border-[#DDDDDD] py-1 px-4 flex items-center text-xs text-[#555555]">
        <div className="flex items-center space-x-4 mx-auto">
          <div className="flex items-center space-x-1 px-3 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">
            <SplitSquareVertical size={14} />
            <span>Split</span>
          </div>
          <div className="h-4 border-r border-[#DDDDDD]"></div>
          <div className="flex items-center space-x-1 px-3 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">
            <LayoutGrid size={14} />
            <span>Elements</span>
            <ChevronDown size={14} />
          </div>
          <div className="h-4 border-r border-[#DDDDDD]"></div>
          <div className="flex items-center space-x-1 px-3 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">
            <Table size={14} />
            <span>Scene Navigator</span>
          </div>
          <div className="h-4 border-r border-[#DDDDDD]"></div>
          <div className="flex items-center space-x-6">
            <div className="px-2 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">Scene Heading (Ctrl+1)</div>
            <div className="px-2 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">Action (Ctrl+2)</div>
            <div className="px-2 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">Character (Ctrl+3)</div>
            <div className="px-2 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">Dialogue (Ctrl+4)</div>
            <div className="px-2 py-1 cursor-pointer hover:bg-[#EEEEEE] rounded">Transition (Ctrl+6)</div>
          </div>
        </div>
      </div>
      
      {/* Status bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#F1F1F1] border-t border-[#DDDDDD] py-1 px-4 flex items-center justify-between text-xs text-[#555555]">
        <div>Page 1</div>
        <div className="flex items-center space-x-4">
          <span>Scene: 1</span>
          <span>Elements: {content.elements.length}</span>
          <span>Characters: {content.elements.filter(e => e.type === 'character').length}</span>
        </div>
        <div>100%</div>
      </div>
      
      <main className="flex-grow pt-4 pb-10 flex justify-center px-4 bg-[#EEEEEE]">
        <ScriptEditor initialContent={content} onChange={handleContentChange} />
      </main>
    </div>
  );
};

export default Editor;
