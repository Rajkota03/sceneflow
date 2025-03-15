
import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import ThreeActStructureTimeline from '@/components/structure/ThreeActStructureTimeline';
import useThreeActStructure from '@/hooks/useThreeActStructure';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';
import { StoryBeat } from '@/lib/types';

const Structure = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const { session } = useAuth();
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  
  const {
    structure,
    isLoading,
    isSaving,
    updateBeat,
    reorderBeats,
    saveStructure
  } = useThreeActStructure(projectId || '');
  
  const handleUpdateProjectTitle = async (newTitle: string) => {
    if (!session || !projectId) return;
    
    setIsUpdatingTitle(true);
    
    try {
      // Update the project title in the database
      const { error } = await supabase
        .from('projects')
        .update({ title: newTitle })
        .eq('id', projectId)
        .eq('author_id', session.user.id);
      
      if (error) throw error;
      
      // Update the structure with the new title
      if (structure) {
        const updatedStructure = {
          ...structure,
          projectTitle: newTitle
        };
        saveStructure(updatedStructure);
      }
      
      toast({
        title: 'Success',
        description: 'Project title updated',
      });
    } catch (error) {
      console.error('Error updating project title:', error);
      toast({
        title: 'Error',
        description: 'Failed to update project title',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingTitle(false);
    }
  };

  const handleDeleteBeat = (beatId: string) => {
    if (!structure) return;
    
    // Filter out the beat with the specified ID
    const updatedBeats = structure.beats.filter(beat => beat.id !== beatId);
    
    // Update positions to ensure they're consecutive
    const reorderedBeats = updatedBeats.map((beat, index) => ({
      ...beat,
      position: index
    }));
    
    // Create updated structure
    const updatedStructure = {
      ...structure,
      beats: reorderedBeats
    };
    
    // Save the updated structure
    saveStructure(updatedStructure);
    
    toast({
      title: 'Beat deleted',
      description: 'The story beat has been removed from the structure',
    });
  };
  
  return (
    <div className="min-h-screen bg-gray-100">
      <div className="bg-white border-b border-gray-200 py-4 px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => navigate('/dashboard?tab=structures')}
              className="text-gray-600"
            >
              <ArrowLeft size={18} className="mr-1" />
              Back to Structures
            </Button>
            <h1 className="text-xl font-semibold text-gray-800">Story Structure</h1>
          </div>
        </div>
      </div>
      
      <div className="container mx-auto py-8 px-4">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="w-full lg:w-80">
            <div className="bg-white rounded-md shadow-sm border border-gray-200 p-4">
              <h2 className="text-lg font-medium mb-4">Structure Tools</h2>
              <div className="space-y-2">
                <Button variant="outline" className="w-full justify-start">
                  Four-Part Structure
                </Button>
                <Button variant="outline" className="w-full justify-start text-gray-500" disabled>
                  Save the Cat Beats (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full justify-start text-gray-500" disabled>
                  Hero's Journey (Coming Soon)
                </Button>
                <Button variant="outline" className="w-full justify-start text-gray-500" disabled>
                  Character Arc (Coming Soon)
                </Button>
              </div>
            </div>
          </div>
          
          <div className="flex-1">
            <ThreeActStructureTimeline 
              structure={structure}
              isLoading={isLoading}
              isSaving={isSaving || isUpdatingTitle}
              onUpdateBeat={updateBeat}
              onReorderBeats={reorderBeats}
              onUpdateProjectTitle={handleUpdateProjectTitle}
              onDeleteBeat={handleDeleteBeat}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Structure;
