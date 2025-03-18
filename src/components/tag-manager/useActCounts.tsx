
import { useState, useEffect } from 'react';
import { ScriptContent, ActType, ActCountsRecord } from '@/lib/types';

const useActCounts = (scriptContent: ScriptContent) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [actCounts, setActCounts] = useState<ActCountsRecord>({
    [ActType.ACT_1]: 0,
    [ActType.ACT_2A]: 0,
    [ActType.MIDPOINT]: 0,
    [ActType.ACT_2B]: 0,
    [ActType.ACT_3]: 0
  });

  useEffect(() => {
    if (!scriptContent.elements) return;

    const tags: string[] = [];
    const actCountsTemp: ActCountsRecord = {
      [ActType.ACT_1]: 0,
      [ActType.ACT_2A]: 0,
      [ActType.MIDPOINT]: 0,
      [ActType.ACT_2B]: 0,
      [ActType.ACT_3]: 0
    };

    scriptContent.elements.forEach(element => {
      if (element.type === 'scene-heading' && element.tags && element.tags.length > 0) {
        // Add unique tags to the availableTags array
        element.tags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
          
          // Count the scenes by act type based on tags
          if (tag.startsWith('Act 1:')) {
            actCountsTemp[ActType.ACT_1]++;
          } else if (tag.startsWith('Act 2A:')) {
            actCountsTemp[ActType.ACT_2A]++;
          } else if (tag.startsWith('Midpoint:')) {
            actCountsTemp[ActType.MIDPOINT]++;
          } else if (tag.startsWith('Act 2B:')) {
            actCountsTemp[ActType.ACT_2B]++;
          } else if (tag.startsWith('Act 3:')) {
            actCountsTemp[ActType.ACT_3]++;
          }
        });
      }
    });

    setAvailableTags(tags);
    setActCounts(actCountsTemp);
  }, [scriptContent]);

  return { availableTags, actCounts };
};

export default useActCounts;
