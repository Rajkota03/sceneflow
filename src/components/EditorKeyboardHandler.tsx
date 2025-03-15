
import React, { useRef } from 'react';
import { ElementType } from '../lib/types';

interface EditorKeyboardHandlerProps {
  id: string;
  type: ElementType;
  onAddNewElement: (afterId: string, explicitType?: ElementType) => void;
  onChangeElementType: (id: string, newType: ElementType) => void;
  children: React.ReactNode;
}

const EditorKeyboardHandler: React.FC<EditorKeyboardHandlerProps> = ({
  id,
  type,
  onAddNewElement,
  onChangeElementType,
  children
}) => {
  const handleKeyDown = (e: React.KeyboardEvent) => {
    // Don't intercept common keyboard shortcuts
    if ((e.ctrlKey || e.metaKey) && 
        (e.key === 'c' || e.key === 'v' || e.key === 'x' || 
         e.key === 'a' || e.key === 'z')) {
      // Let the browser handle common operations
      return;
    }
    
    // Handle Enter key for creating new elements and auto-formatting
    if (e.key === 'Enter') {
      // Allow Shift+Enter to create a new line in dialogue without creating a new element
      if (e.shiftKey && type === 'dialogue') {
        return; // Let the textarea handle this for multi-line dialogue
      }
      
      e.preventDefault();
      
      // Determine the next element's type based on current element type
      let nextType: ElementType | undefined = undefined;
      
      if (type === 'scene-heading') {
        nextType = 'action'; // After Scene Heading, move to Action
      } else if (type === 'character') {
        nextType = 'dialogue'; // After Character, move to Dialogue
      } else if (type === 'dialogue') {
        nextType = 'action'; // After Dialogue, move to Action
      } else if (type === 'parenthetical') {
        nextType = 'dialogue'; // Parentheticals stay within Dialogue
      } else if (type === 'transition') {
        nextType = 'scene-heading'; // After Transition, move to Scene Heading
      }
      // Default to action for other types
      
      onAddNewElement(id, nextType);
    }
    
    // Handle Tab key for cycling through element types
    if (e.key === 'Tab') {
      e.preventDefault();
      
      let newType: ElementType = 'action';
      
      if (type === 'action') {
        newType = 'character';
      } else if (type === 'character') {
        newType = 'scene-heading';
      } else if (type === 'scene-heading') {
        newType = 'transition';
      } else if (type === 'transition') {
        newType = 'action';
      }
      
      onChangeElementType(id, newType);
    }
    
    // Handle keyboard shortcuts for element type formatting
    if (e.ctrlKey || e.metaKey) {
      switch (e.key) {
        case '1':
          e.preventDefault();
          onChangeElementType(id, 'scene-heading');
          break;
        case '2':
          e.preventDefault();
          onChangeElementType(id, 'action');
          break;
        case '3':
          e.preventDefault();
          onChangeElementType(id, 'character');
          // Character formatting is applied via CSS in EditorElement
          break;
        case '4':
          e.preventDefault();
          onChangeElementType(id, 'dialogue');
          break;
        case '6':
          e.preventDefault();
          onChangeElementType(id, 'transition');
          // Transition formatting is applied via CSS in EditorElement
          break;
      }
    }
  };

  return (
    <div onKeyDown={handleKeyDown}>
      {children}
    </div>
  );
};

export default EditorKeyboardHandler;
