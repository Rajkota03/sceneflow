
import React, { useEffect, useState } from 'react';
import { Progress } from '@/components/ui/progress';
import { Structure } from '@/lib/models/structureModel';
import { FileText, Tag } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { ScriptContent } from '@/lib/types';

interface StructureProgressProps {
  structure: Structure;
}

export const StructureProgress: React.FC<StructureProgressProps> = ({ structure }) => {
  const [taggedBeatCount, setTaggedBeatCount] = useState<number>(0);
  const [hasScriptData, setHasScriptData] = useState<boolean>(false);
  
  // Calculate progress based on how many beats are completed
  // For now, we'll consider a beat "complete" if it has a non-empty description
  const totalBeats = structure.acts.reduce((count, act) => count + act.beats.length, 0);
  const completedBeats = structure.acts.reduce((count, act) => {
    return count + act.beats.filter(beat => beat.description && beat.description.trim() !== '').length;
  }, 0);
  
  const progressPercentage = totalBeats > 0 ? Math.round((completedBeats / totalBeats) * 100) : 0;
  
  // Calculate the total estimated page count (assuming a 120-page screenplay)
  const totalPages = 120;
  
  // Check if this structure is linked to a screenplay and fetch scene tag data
  useEffect(() => {
    if (!structure.id) return;
    
    const checkForSceneTags = async () => {
      try {
        // First check if structure is linked to a project
        const { data: linkData, error: linkError } = await supabase
          .from('project_structures')
          .select('project_id')
          .eq('structure_id', structure.id)
          .single();
          
        if (linkError || !linkData) {
          console.log('No project linked to this structure');
          return;
        }
        
        // If we have a linked project, check for scene elements with tags
        const { data: projectData, error: projectError } = await supabase
          .from('projects')
          .select('content')
          .eq('id', linkData.project_id)
          .single();
        
        if (projectError || !projectData || !projectData.content) {
          console.log('No content found for linked project');
          return;
        }
        
        // Safely parse the content JSON and check for elements
        const content = projectData.content;
        
        // Count scene elements that have tags
        let taggedScenes = 0;
        
        // Safely check if content has elements and if elements is an array
        if (content && 
            typeof content === 'object' && 
            'elements' in content && 
            Array.isArray((content as any).elements)) {
          
          // Now it's safe to access elements as an array
          const elements = (content as any).elements;
          taggedScenes = elements.filter((element: any) => 
            element.type === 'scene-heading' && 
            element.tags && 
            Array.isArray(element.tags) && 
            element.tags.length > 0
          ).length;
        }
        
        setTaggedBeatCount(taggedScenes);
        setHasScriptData(taggedScenes > 0);
        
      } catch (error) {
        console.error('Error checking for scene tags:', error);
      }
    };
    
    checkForSceneTags();
  }, [structure.id]);
  
  return (
    <div className="space-y-2 mb-6">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-slate-700">Story Progress</p>
        <span className="text-sm text-slate-500 flex items-center">
          <span>{completedBeats}/{totalBeats} beats</span>
          {hasScriptData && (
            <>
              <span className="mx-2">•</span>
              <Tag className="h-3 w-3 mr-1" />
              <span>{taggedBeatCount} tagged scenes</span>
            </>
          )}
        </span>
      </div>
      <Progress value={progressPercentage} className="h-2 w-full bg-slate-100" />
      
      {hasScriptData ? (
        <div className="flex justify-between text-xs text-slate-500">
          <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Page 1 (Setup)</span>
          <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Page 60 (Confrontation)</span>
          <span className="flex items-center"><FileText className="h-3 w-3 mr-1" /> Page 120 (Resolution)</span>
        </div>
      ) : (
        <div className="text-xs text-slate-500 italic text-center">
          Tag beats in your screenplay to see page number estimates
        </div>
      )}
    </div>
  );
};
