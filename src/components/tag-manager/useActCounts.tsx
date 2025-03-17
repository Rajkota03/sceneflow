
import { useState, useEffect } from 'react';
import { ScriptContent, ActType, ActCountsRecord } from '@/types/scriptTypes';

const useActCounts = (scriptContent: ScriptContent) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Initialize with the correct ActType enum values from types/scriptTypes.ts
  const [actCounts, setActCounts] = useState<ActCountsRecord>({
    [ActType.ACT_1]: 0,
    [ActType.ACT_2A]: 0,
    [ActType.MIDPOINT]: 0,
    [ActType.ACT_2B]: 0,
    [ActType.ACT_3]: 0
  });

  useEffect(() => {
    // Collect all unique tags from scene headings
    const tags = new Set<string>();
    
    // Create a concrete object of the exact interface shape
    const actTagCounts: ActCountsRecord = {
      [ActType.ACT_1]: 0,
      [ActType.ACT_2A]: 0,
      [ActType.MIDPOINT]: 0,
      [ActType.ACT_2B]: 0,
      [ActType.ACT_3]: 0
    };

    scriptContent.elements.forEach(element => {
      if (element.type === ElementType.SCENE_HEADING && element.tags) {
        element.tags.forEach(tag => {
          tags.add(tag);
          
          // Count scenes by act tag
          if (tag.startsWith('Act 1:')) {
            actTagCounts[ActType.ACT_1]++;
          } else if (tag.startsWith('Act 2A:')) {
            actTagCounts[ActType.ACT_2A]++;
          } else if (tag.startsWith('Midpoint:')) {
            actTagCounts[ActType.MIDPOINT]++;
          } else if (tag.startsWith('Act 2B:')) {
            actTagCounts[ActType.ACT_2B]++;
          } else if (tag.startsWith('Act 3:')) {
            actTagCounts[ActType.ACT_3]++;
          }
        });
      }
    });
    
    setAvailableTags(Array.from(tags));
    setActCounts(actTagCounts);
  }, [scriptContent]);

  return { availableTags, actCounts };
};

export default useActCounts;
