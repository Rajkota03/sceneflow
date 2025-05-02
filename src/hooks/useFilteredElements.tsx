
import { useMemo } from 'react'; // Import useMemo, remove useState and useEffect
import { ScriptElement, ActType } from '@/lib/types';

export function useFilteredElements(
  elements: ScriptElement[] | undefined,
  activeTagFilter: string | null,
  activeActFilter: ActType | null
): ScriptElement[] { // Return the filtered array directly

  // Memoize the filtering logic
  const filteredElements = useMemo(() => {
    console.log("Recalculating filtered elements..."); // Debug log
    if (!elements) {
      return [];
    }

    // If no filters are active, return the original elements array
    if (!activeTagFilter && !activeActFilter) {
      return elements;
    }

    let filtered: ScriptElement[] = [];
    let includeScene = false;

    // Single pass filtering
    for (const element of elements) {
      if (element.type === 'scene-heading') {
        // Reset includeScene flag for each new scene heading
        includeScene = false;

        // Check tag filter
        if (activeTagFilter) {
          if (element.tags?.includes(activeTagFilter)) {
            includeScene = true;
          }
        }
        // Check act filter (only if tag filter didn't match or wasn't active)
        else if (activeActFilter) {
          const matchesAct = element.tags?.some(tag => {
            // Use a helper function or switch for clarity
            switch (activeActFilter) {
              case ActType.ACT_1: return tag.startsWith('Act 1:');
              case ActType.ACT_2A: return tag.startsWith('Act 2A:');
              case ActType.MIDPOINT: return tag.startsWith('Midpoint:');
              case ActType.ACT_2B: return tag.startsWith('Act 2B:');
              case ActType.ACT_3: return tag.startsWith('Act 3:');
              default: return false;
            }
          });
          if (matchesAct) {
            includeScene = true;
          }
        }
      }

      // If the scene should be included (based on its heading), add the element
      if (includeScene) {
        filtered.push(element);
      }
    }

    return filtered;

  }, [elements, activeTagFilter, activeActFilter]); // Dependencies for memoization

  return filteredElements;
}

export default useFilteredElements;

