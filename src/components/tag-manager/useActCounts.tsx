
import { useState, useEffect } from 'react';
import { ScriptContent } from '@/lib/types';
import { ActCountsRecord } from '@/types/scriptTypes';

const useActCounts = (scriptContent: ScriptContent) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  
  // Initialize with a stable object structure to avoid recursive type issues
  const [actCounts, setActCounts] = useState<ActCountsRecord>({
    '1': 0,
    '2A': 0,
    'midpoint': 0,
    '2B': 0,
    '3': 0
  });

  useEffect(() => {
    // Collect all unique tags from scene headings
    const tags = new Set<string>();
    
    // Create a concrete object of the exact interface shape
    const actTagCounts: ActCountsRecord = {
      '1': 0,
      '2A': 0,
      'midpoint': 0,
      '2B': 0,
      '3': 0
    };

    scriptContent.elements.forEach(element => {
      if (element.type === 'scene-heading' && element.tags) {
        element.tags.forEach(tag => {
          tags.add(tag);
          
          // Count scenes by act tag
          if (tag.startsWith('Act 1:')) {
            actTagCounts['1']++;
          } else if (tag.startsWith('Act 2A:')) {
            actTagCounts['2A']++;
          } else if (tag.startsWith('Midpoint:')) {
            actTagCounts['midpoint']++;
          } else if (tag.startsWith('Act 2B:')) {
            actTagCounts['2B']++;
          } else if (tag.startsWith('Act 3:')) {
            actTagCounts['3']++;
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
