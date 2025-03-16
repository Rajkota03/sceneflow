
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

// Define a concrete type for structure info without any recursion
export interface StructureInfo {
  id: string;
  name: string;
}

const useStructures = (projectId?: string, availableStructures: StructureInfo[] = []) => {
  const [structures, setStructures] = useState<StructureInfo[]>([]);

  useEffect(() => {
    // If we have a projectId but no available structures were provided, fetch them
    if (projectId && availableStructures.length === 0) {
      const fetchStructures = async () => {
        try {
          const { data, error } = await supabase
            .from('structures')
            .select('id, name')
            .eq('projectId', projectId);
            
          if (error) {
            console.error('Error fetching structures:', error);
            return;
          }
          
          if (data) {
            setStructures(data);
          }
        } catch (error) {
          console.error('Error fetching structures:', error);
        }
      };
      
      fetchStructures();
    } else {
      setStructures(availableStructures);
    }
  }, [projectId, availableStructures]);

  return structures;
};

export default useStructures;
