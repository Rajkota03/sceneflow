
import { useState } from 'react';

// Define a simple type for structure info
export interface StructureInfo {
  id: string;
  name: string;
}

const useStructures = (projectId?: string, availableStructures: StructureInfo[] = []) => {
  const [structures] = useState<StructureInfo[]>(availableStructures);
  
  // Just return the provided structures or an empty array
  return structures;
};

export default useStructures;
