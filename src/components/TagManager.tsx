
import React, { useState, useEffect } from 'react';
import { ActType } from '@/lib/types';
import ActBar from './ActBar';
import { BeatMode, TagManagerProps } from '@/types/scriptTypes';
import useActCounts from './tag-manager/useActCounts';
import useStructures, { StructureInfo } from './tag-manager/useStructures';
import TagFilter from './tag-manager/TagFilter';
import { supabase } from '@/integrations/supabase/client';
import { Button } from './ui/button';
import { Check, LinkIcon, ExternalLink } from 'lucide-react';
import { toast } from './ui/use-toast';
import { useNavigate } from 'react-router-dom';

const TagManager: React.FC<TagManagerProps> = ({ 
  scriptContent, 
  onFilterByTag,
  onFilterByAct,
  activeFilter,
  activeActFilter,
  projectName,
  structureName,
  beatMode = 'on',
  onToggleBeatMode,
  availableStructures = [],
  onStructureChange,
  selectedStructureId,
  projectId
}) => {
  const { availableTags, actCounts } = useActCounts(scriptContent);
  const structures = useStructures(projectId, availableStructures);
  const [projects, setProjects] = useState<{ id: string, title: string }[]>([]);
  const [linkedProjectId, setLinkedProjectId] = useState<string | null>(null);
  const [isLinking, setIsLinking] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // If we have a structure ID, check if it's linked to any project
    if (selectedStructureId) {
      const checkStructureLinks = async () => {
        try {
          const { data, error } = await supabase
            .from('project_structures')
            .select('project_id')
            .eq('structure_id', selectedStructureId)
            .single();
          
          if (data && !error) {
            setLinkedProjectId(data.project_id);
          }
        } catch (error) {
          console.error('Error checking structure links:', error);
        }
      };
      
      checkStructureLinks();
    }
  }, [selectedStructureId]);

  useEffect(() => {
    // Fetch available projects for linking
    const fetchProjects = async () => {
      try {
        const { data, error } = await supabase
          .from('projects')
          .select('id, title')
          .order('title', { ascending: true });
        
        if (data && !error) {
          setProjects(data);
        }
      } catch (error) {
        console.error('Error fetching projects:', error);
      }
    };
    
    fetchProjects();
  }, []);

  const handleActFilter = (act: ActType | null) => {
    if (onFilterByAct) {
      onFilterByAct(act);
      // Clear tag filter when using act filter
      if (act !== null && activeFilter !== null) {
        onFilterByTag(null);
      }
    }
  };

  const handleLinkToProject = async (projectId: string) => {
    if (!selectedStructureId) {
      toast({
        title: "No structure selected",
        description: "Please select a structure first",
        variant: "destructive"
      });
      return;
    }
    
    setIsLinking(true);
    
    try {
      // First, delete any existing links for this structure
      await supabase
        .from('project_structures')
        .delete()
        .eq('structure_id', selectedStructureId);
      
      // Then create the new link
      const { error } = await supabase
        .from('project_structures')
        .insert({
          structure_id: selectedStructureId,
          project_id: projectId
        });
      
      if (error) {
        throw error;
      }
      
      setLinkedProjectId(projectId);
      
      toast({
        title: "Structure linked",
        description: "The structure has been linked to the screenplay",
      });
    } catch (error) {
      console.error('Error linking structure to project:', error);
      toast({
        title: "Error linking structure",
        description: "Could not link the structure to the screenplay",
        variant: "destructive"
      });
    } finally {
      setIsLinking(false);
    }
  };

  const handleGoToScreenplay = () => {
    if (linkedProjectId) {
      navigate(`/editor/${linkedProjectId}`);
    }
  };

  const handleLinkToCurrentScreenplay = async () => {
    if (!projectId || !selectedStructureId) return;
    
    await handleLinkToProject(projectId);
  };

  // Always render the ActBar so the user can toggle between modes
  return (
    <div className="mb-4">
      <div className="flex justify-between items-center mb-2">
        {onFilterByAct && (
          <ActBar 
            activeAct={activeActFilter || null} 
            onSelectAct={handleActFilter} 
            actCounts={actCounts}
            projectName={projectName}
            structureName={structureName}
            beatMode={beatMode}
            onToggleBeatMode={onToggleBeatMode}
            availableStructures={structures}
            onStructureChange={onStructureChange}
            selectedStructureId={selectedStructureId}
          />
        )}
        
        {/* Structure linking controls */}
        {selectedStructureId && (
          <div className="flex items-center space-x-2">
            {linkedProjectId ? (
              <>
                <span className="text-sm text-green-600 flex items-center">
                  <Check size={16} className="mr-1" />
                  Linked to screenplay
                </span>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleGoToScreenplay}
                >
                  <ExternalLink size={14} className="mr-1" />
                  Go to Screenplay
                </Button>
              </>
            ) : (
              projectId ? (
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="h-7 text-xs"
                  onClick={handleLinkToCurrentScreenplay}
                  disabled={isLinking}
                >
                  <LinkIcon size={14} className="mr-1" />
                  Link to Current Screenplay
                </Button>
              ) : null
            )}
          </div>
        )}
      </div>
      
      {beatMode === 'on' && availableTags.length > 0 && (
        <TagFilter 
          availableTags={availableTags}
          activeFilter={activeFilter}
          onFilterByTag={onFilterByTag}
        />
      )}
    </div>
  );
};

export default TagManager;
