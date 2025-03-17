
import React, { useEffect } from 'react';
import { ScriptElement, ElementType } from '@/types/scriptTypes';
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
          type: ElementType.SCENE_HEADING,
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: ElementType.ACTION,
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
