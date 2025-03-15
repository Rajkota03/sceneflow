
import { useEffect, useState } from 'react';
import { ScriptElement, ActType } from '@/lib/types';

export function useFilteredElements(
  elements: ScriptElement[], 
  activeTagFilter: string | null, 
  activeActFilter: ActType | null
) {
  const [filteredElements, setFilteredElements] = useState<ScriptElement[]>(elements);

  useEffect(() => {
    if (!activeTagFilter && !activeActFilter) {
      setFilteredElements(elements);
      return;
    }

    let filtered = [...elements];
    
    // Tag-based filtering
    if (activeTagFilter) {
      const filteredIds = new Set<string>();
      let includeNext = false;
      
      elements.forEach((element) => {
        if (element.type === 'scene-heading') {
          if (element.tags?.includes(activeTagFilter)) {
            filteredIds.add(element.id);
            includeNext = true;
          } else {
            includeNext = false;
          }
        } else if (includeNext) {
          filteredIds.add(element.id);
        }
      });
      
      filtered = elements.filter(element => filteredIds.has(element.id));
    }
    
    // Act-based filtering
    if (activeActFilter) {
      const filteredIds = new Set<string>();
      let includeNext = false;
      
      elements.forEach((element) => {
        if (element.type === 'scene-heading') {
          // Check if any tag in this scene matches the selected act
          const matchesAct = element.tags?.some(tag => {
            if (activeActFilter === 1) return tag.startsWith('Act 1:');
            if (activeActFilter === '2A') return tag.startsWith('Act 2A:');
            if (activeActFilter === 'midpoint') return tag.startsWith('Midpoint:');
            if (activeActFilter === '2B') return tag.startsWith('Act 2B:');
            if (activeActFilter === 3) return tag.startsWith('Act 3:');
            return false;
          });
          
          if (matchesAct) {
            filteredIds.add(element.id);
            includeNext = true;
          } else {
            includeNext = false;
          }
        } else if (includeNext) {
          filteredIds.add(element.id);
        }
      });
      
      filtered = elements.filter(element => filteredIds.has(element.id));
    }
    
    setFilteredElements(filtered);
  }, [elements, activeTagFilter, activeActFilter]);

  return filteredElements;
}

export default useFilteredElements;
