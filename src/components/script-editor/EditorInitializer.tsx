
import React, { useEffect } from 'react';
import { ScriptElement } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';

interface EditorInitializerProps {
  elements: ScriptElement[];
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>;
  setActiveElementId: React.Dispatch<React.SetStateAction<string | null>>;
}

const EditorInitializer: React.FC<EditorInitializerProps> = ({
  elements,
  setElements,
  setActiveElementId,
}) => {
  useEffect(() => {
    if (!elements || elements.length === 0) {
      console.log("No elements found, creating default elements");
      const defaultElements: ScriptElement[] = [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Type your action here...'
        }
      ];
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements, setElements, setActiveElementId]);

  return null;
};

export default EditorInitializer;
