import { useState, useEffect } from 'react';
import { getStructures } from '@/services/structureService';

// Define a simple type for structure info
export interface StructureInfo {
  id: string;
  name: string;
}

const useStructures = (projectId?: string, availableStructures: StructureInfo[] = []) => {
  const [structures, setStructures] = useState<StructureInfo[]>(availableStructures);
  
  useEffect(() => {
    // If structures are already provided, use them
    if (availableStructures.length > 0) {
      setStructures(availableStructures);
      return;
    }
    
    // Otherwise, try to fetch all structures
    if (projectId) {
      const fetchStructures = async () => {
        try {
          const allStructures = await getStructures();
          setStructures(allStructures.map(s => ({ id: s.id, name: s.name })));
        } catch (error) {
          console.error('Error fetching structures in hook:', error);
        }
      };
      
      fetchStructures();
    }
  }, [projectId, availableStructures]);

  return structures;
};

export default useStructures;
