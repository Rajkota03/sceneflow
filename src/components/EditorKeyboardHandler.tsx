
import React from 'react';
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
    
    // The arrow key navigation is now handled in the EditorElement component
    // It will only bubble up here if we're at the boundaries of the textarea
    if (e.key === 'ArrowUp' || e.key === 'ArrowDown' || 
        e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      // No specific handling here, just let it propagate
      return;
    }
    
    if (e.key === 'Enter') {
      if (e.shiftKey && type === 'dialogue') {
        // Let the textarea handle this for multi-line dialogue
        return;
      } else {
        e.preventDefault();
        
        let nextType: ElementType | undefined = undefined;
        
        if (type === 'scene-heading') {
          nextType = 'action';
        } else if (type === 'character') {
          nextType = 'dialogue';
        } else if (type === 'dialogue' || type === 'parenthetical') {
          nextType = 'action';
        }
        
        onAddNewElement(id, nextType);
      }
    }
    
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
          break;
        case '4':
          e.preventDefault();
          onChangeElementType(id, 'dialogue');
          break;
        case '6':
          e.preventDefault();
          onChangeElementType(id, 'transition');
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
