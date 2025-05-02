
import { useState, useEffect, useMemo } from 'react'; // Import useMemo
import { ScriptElement } from '@/lib/types';

export function useCharacterNames(elements: ScriptElement[]) {
  const [characterNames, setCharacterNames] = useState<string[]>([]);

  // Memoize the calculation of character names
  const calculatedNames = useMemo(() => {
    console.log("Recalculating character names..."); // Debug log
    const names = elements
      .filter(el => el.type === 'character' && el.text.trim() !== '') // Ensure type is character and text is not empty
      .map(el => el.text.replace(/\s*\(CONT'D\)\s*$/i, '').trim()) // Use case-insensitive regex for CONT'D
      .filter((name, index, self) => 
        name && self.findIndex(n => n.toLowerCase() === name.toLowerCase()) === index // Case-insensitive uniqueness check
      );
    return names.sort(); // Sort for consistent order, helps with comparison
  }, [elements]); // Recalculate only when elements array changes

  // Update state only if the calculated names are different from the current state
  useEffect(() => {
    // Simple comparison: check length and element-wise equality
    if (calculatedNames.length !== characterNames.length || 
        !calculatedNames.every((name, index) => name === characterNames[index])) {
      console.log("Updating character names state:", calculatedNames); // Debug log
      setCharacterNames(calculatedNames);
    }
  }, [calculatedNames, characterNames]); // Run effect when calculatedNames or characterNames change

  return characterNames;
}

export default useCharacterNames;

