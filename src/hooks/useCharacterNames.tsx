
import { useState, useEffect } from 'react';
import { ScriptElement } from '@/lib/types';

export function useCharacterNames(elements: ScriptElement[]) {
  const [characterNames, setCharacterNames] = useState<string[]>([]);

  useEffect(() => {
    const names = elements
      .filter(el => el.type === 'character')
      .map(el => el.text.replace(/\s*\(CONT'D\)\s*$/, '').trim())
      .filter((name, index, self) => 
        name && self.indexOf(name) === index
      );
    
    setCharacterNames(names);
  }, [elements]);

  return characterNames;
}

export default useCharacterNames;
