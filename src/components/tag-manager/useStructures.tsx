
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Structure, Act } from '@/lib/types';

// Define a simple type for structure info
export interface StructureInfo {
  id: string;
  name: string;
  description?: string;
  isLinked?: boolean;
}

const useStructures = (projectId?: string) => {
  const [structures, setStructures] = useState<StructureInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchStructures = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        // Fetch all available structures
        const { data, error } = await supabase
          .from('structures')
          .select('id, name, description');
        
        if (error) throw error;
        
        // If a project ID is provided, also check if any structures are linked to this project
        if (projectId) {
          const { data: linkedData, error: linkedError } = await supabase
            .from('project_structures')
            .select('structure_id')
            .eq('project_id', projectId);
            
          if (linkedError) throw linkedError;
          
          // Mark structures that are linked to this project
          const linkedIds = new Set(linkedData?.map(item => item.structure_id) || []);
          
          setStructures(data?.map(structure => ({
            ...structure,
            isLinked: linkedIds.has(structure.id)
          })) || []);
        } else {
          setStructures(data || []);
        }
      } catch (err) {
        console.error('Error fetching structures:', err);
        setError('Failed to load structures');
        setStructures([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStructures();
  }, [projectId]);
  
  return { structures, isLoading, error };
};

export default useStructures;
