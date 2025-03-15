
import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/App';
import { toast } from '@/components/ui/use-toast';
import { ThreeActStructure } from '@/lib/types';

export const useProjectTitle = (
  projectId: string | undefined, 
  structure: ThreeActStructure | null,
  saveStructure: (updatedStructure: ThreeActStructure) => void
) => {
  const { session } = useAuth();
  const [isUpdatingTitle, setIsUpdatingTitle] = useState(false);
  
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
  
  return {
    isUpdatingTitle,
    handleUpdateProjectTitle
  };
};

export default useProjectTitle;
