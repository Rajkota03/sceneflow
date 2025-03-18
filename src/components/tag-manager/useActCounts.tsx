
import { useState, useEffect } from 'react';
import { ScriptContent, ActType } from '@/lib/types';

type ActCount = {
  act: ActType;
  count: number;
};

type UseActCountsResult = {
  availableTags: string[];
  actCounts: ActCount[];
};

const useActCounts = (scriptContent: ScriptContent | undefined): UseActCountsResult => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [actCounts, setActCounts] = useState<ActCount[]>([]);

  useEffect(() => {
    if (!scriptContent || !scriptContent.elements || scriptContent.elements.length === 0) {
      setAvailableTags([]);
      setActCounts([]);
      return;
    }

    // Extract all unique tags
    const allTags = new Set<string>();
    scriptContent.elements.forEach(element => {
      if (element.tags && Array.isArray(element.tags)) {
        element.tags.forEach(tag => allTags.add(tag));
      }
    });

    setAvailableTags(Array.from(allTags));

    // Count acts
    const actCounts: Record<ActType, number> = {
      [ActType.ACT_1]: 0,
      [ActType.ACT_2A]: 0,
      [ActType.MIDPOINT]: 0,
      [ActType.ACT_2B]: 0,
      [ActType.ACT_3]: 0,
    };

    // Count the scenes with each act tag
    scriptContent.elements
      .filter(element => element.type === 'scene-heading' && element.tags && Array.isArray(element.tags))
      .forEach(element => {
        if (element.tags) {
          element.tags.forEach(tag => {
            if (tag.startsWith('Act 1:')) actCounts[ActType.ACT_1]++;
            else if (tag.startsWith('Act 2A:')) actCounts[ActType.ACT_2A]++;
            else if (tag.startsWith('Midpoint:')) actCounts[ActType.MIDPOINT]++;
            else if (tag.startsWith('Act 2B:')) actCounts[ActType.ACT_2B]++;
            else if (tag.startsWith('Act 3:')) actCounts[ActType.ACT_3]++;
          });
        }
      });

    // Convert to array
    const result: ActCount[] = [
      { act: ActType.ACT_1, count: actCounts[ActType.ACT_1] },
      { act: ActType.ACT_2A, count: actCounts[ActType.ACT_2A] },
      { act: ActType.MIDPOINT, count: actCounts[ActType.MIDPOINT] },
      { act: ActType.ACT_2B, count: actCounts[ActType.ACT_2B] },
      { act: ActType.ACT_3, count: actCounts[ActType.ACT_3] },
    ];

    setActCounts(result);
  }, [scriptContent]);

  return { availableTags, actCounts };
};

export default useActCounts;
