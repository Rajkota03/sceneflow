
import React, { createContext, useContext, useState, useCallback } from 'react';
import { ScriptContent, ElementType, ScriptElement } from '@/lib/types';
import { generateUniqueId, detectElementType } from '@/lib/formatScript';

interface ScriptEditorProviderProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  projectId?: string;
  projectTitle?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  children: React.ReactNode;
}

// Create a context type with properties needed for the screenplay editor
export interface ScriptEditorContextType {
  projectTitle?: string;
  elements: ScriptElement[];
  activeElementId: string | null;
  updateElement: (id: string, text: string, type?: ElementType) => void;
  addElement: (afterId: string, type?: ElementType) => void;
  deleteElement: (id: string) => void;
  changeElementType: (id: string, newType: ElementType) => void;
  setActiveElement: (id: string | null) => void;
  showKeyboardShortcuts: boolean;
  toggleKeyboardShortcuts: () => void;
}

const ScriptEditorContext = createContext<ScriptEditorContextType | undefined>(undefined);

export const useScriptEditor = (): ScriptEditorContextType => {
  const context = useContext(ScriptEditorContext);
  if (!context) {
    throw new Error('useScriptEditor must be used within a ScriptEditorProvider');
  }
  return context;
};

const ScriptEditorProvider: React.FC<ScriptEditorProviderProps> = ({
  initialContent,
  onChange,
  projectId,
  projectTitle,
  selectedStructureId,
  onStructureChange,
  children
}) => {
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  // Update an existing element
  const updateElement = useCallback((id: string, text: string, type?: ElementType) => {
    setElements(prev => {
      const updated = prev.map(el => {
        if (el.id === id) {
          // If no type is provided, detect it based on text content
          const elementType = type || detectElementType(text, el.type);
          return { ...el, text, type: elementType };
        }
        return el;
      });
      
      onChange({ elements: updated });
      return updated;
    });
  }, [onChange]);

  // Add a new element after the specified element
  const addElement = useCallback((afterId: string, type?: ElementType) => {
    setElements(prev => {
      const index = prev.findIndex(el => el.id === afterId);
      if (index === -1) return prev;

      // Determine the new element type based on context
      const prevElement = prev[index];
      let newType: ElementType = type || 'action';
      
      // If previous element was a character, default to dialogue
      if (prevElement.type === 'character') {
        newType = 'dialogue';
      } 
      // If previous element was a scene heading, default to action
      else if (prevElement.type === 'scene-heading') {
        newType = 'action';
      }

      const newElement: ScriptElement = {
        id: generateUniqueId(),
        type: newType,
        text: ''
      };

      const updated = [
        ...prev.slice(0, index + 1),
        newElement,
        ...prev.slice(index + 1)
      ];
      
      onChange({ elements: updated });
      return updated;
    });

    // Return the ID of the new element (for focusing)
    const newId = generateUniqueId();
    return newId;
  }, [onChange]);

  // Delete an element
  const deleteElement = useCallback((id: string) => {
    setElements(prev => {
      // Don't delete the last element
      if (prev.length <= 1) return prev;
      
      const updated = prev.filter(el => el.id !== id);
      onChange({ elements: updated });
      return updated;
    });
  }, [onChange]);

  // Change the type of an element
  const changeElementType = useCallback((id: string, newType: ElementType) => {
    setElements(prev => {
      const updated = prev.map(el => {
        if (el.id === id) {
          // Format text based on new type if needed
          let formattedText = el.text;
          if (newType === 'scene-heading' || newType === 'character' || newType === 'transition') {
            formattedText = el.text.toUpperCase();
          }
          return { ...el, type: newType, text: formattedText };
        }
        return el;
      });
      
      onChange({ elements: updated });
      return updated;
    });
  }, [onChange]);

  // Toggle keyboard shortcuts help visibility
  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(prev => !prev);
  }, []);

  const contextValue: ScriptEditorContextType = {
    projectTitle,
    elements,
    activeElementId,
    updateElement,
    addElement,
    deleteElement,
    changeElementType,
    setActiveElement: setActiveElementId,
    showKeyboardShortcuts,
    toggleKeyboardShortcuts
  };

  return (
    <ScriptEditorContext.Provider value={contextValue}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
