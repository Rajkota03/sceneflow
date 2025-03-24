
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ScriptContent, ScriptElement, ElementType, Structure, ActType } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';
import { generateUniqueId } from '@/lib/formatScript';
import useCharacterNames from '@/hooks/useCharacterNames';
import useFilteredElements from '@/hooks/useFilteredElements';
import useScriptNavigation from '@/hooks/useScriptNavigation';

interface BeatSceneCount {
  beatId: string;
  count: number;
}

interface ScriptEditorContextType {
  elements: ScriptElement[];
  activeElementId: string | null;
  setActiveElementId: (id: string | null) => void;
  handleElementChange: (content: ScriptContent) => void;
  addNewElement: (afterId: string, type?: ElementType) => void;
  deleteElement: (id: string) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  beatMode: BeatMode;
  setBeatMode: (mode: BeatMode) => void;
  structures: Structure[];
  selectedStructureId: string | null;
  selectedStructure: Structure | null;
  handleStructureChange: (structureId: string) => void;
  scriptContentRef: React.RefObject<HTMLDivElement>;
  // Additional properties needed by components
  filteredElements: ScriptElement[];
  currentPage: number;
  getPreviousElementType: (index: number) => ElementType | undefined;
  handleFocus: (id: string) => void;
  handleNavigate: (direction: 'up' | 'down', id: string) => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
  changeElementType: (id: string, newType: ElementType) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  handleBeatTag?: (elementId: string, beatId: string, actId: string) => void;
  beatSceneCounts: BeatSceneCount[];
}

const ScriptEditorContext = createContext<ScriptEditorContextType | null>(null);

export const useScriptEditor = () => {
  const context = useContext(ScriptEditorContext);
  if (!context) {
    throw new Error('useScriptEditor must be used within a ScriptEditorProvider');
  }
  return context;
};

interface ScriptEditorProviderProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  projectId?: string;
  selectedStructureId?: string | null;
  onStructureChange?: (structureId: string) => void;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  children: React.ReactNode;
}

export const ScriptEditorProvider: React.FC<ScriptEditorProviderProps> = ({
  initialContent,
  onChange,
  projectId,
  selectedStructureId: externalSelectedStructureId,
  onStructureChange,
  beatMode: externalBeatMode = 'on',
  onToggleBeatMode,
  children
}) => {
  // Initialize core state
  const [elements, setElements] = useState<ScriptElement[]>(initialContent.elements || []);
  const [activeElementId, setActiveElementId] = useState<string | null>(
    elements.length > 0 ? elements[0].id : null
  );
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>(externalBeatMode);
  const [structures, setStructures] = useState<Structure[]>([]);
  const [selectedStructureId, setSelectedStructureId] = useState<string | null>(externalSelectedStructureId || null);
  const [selectedStructure, setSelectedStructure] = useState<Structure | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [beatSceneCounts, setBeatSceneCounts] = useState<BeatSceneCount[]>([]);
  
  const scriptContentRef = useRef<HTMLDivElement>(null);
  
  // Get character names from elements
  const characterNames = useCharacterNames(elements);
  
  // Get filtered elements based on active filter
  const filteredElements = useFilteredElements(elements, activeTagFilter, null);
  
  // Sync with external state when it changes
  useEffect(() => {
    if (externalSelectedStructureId !== selectedStructureId) {
      setSelectedStructureId(externalSelectedStructureId || null);
    }
  }, [externalSelectedStructureId]);
  
  useEffect(() => {
    if (externalBeatMode !== beatMode) {
      setBeatMode(externalBeatMode);
    }
  }, [externalBeatMode]);
  
  // Handle changes to the script content
  const handleElementChange = (content: ScriptContent) => {
    if (content.elements) {
      setElements(content.elements);
      onChange(content);
    }
  };
  
  // Get the type of the previous element
  const getPreviousElementType = (index: number): ElementType | undefined => {
    if (index < 0 || !elements[index]) return undefined;
    return elements[index].type;
  };
  
  // Focus handling
  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };
  
  // Element navigation
  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };
  
  // Handle enter key press
  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    // Handle shift+enter for line breaks in dialogue
    if (shiftKey && currentElement.type === 'dialogue') {
      const updatedElements = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    // Add a new element after the current one
    addNewElement(id);
  };
  
  // Add a new element after the specified element
  const addNewElement = (afterId: string, type?: ElementType) => {
    const afterIndex = elements.findIndex(el => el.id === afterId);
    if (afterIndex === -1) return;
    
    const currentElement = elements[afterIndex];
    
    // Determine the type of the new element based on the current one
    let newType: ElementType = type || 'action';
    let initialText = '';
    
    if (!type) {
      if (currentElement.type === 'scene-heading') {
        newType = 'action';
      } else if (currentElement.type === 'character') {
        newType = 'dialogue';
      } else if (currentElement.type === 'dialogue' || currentElement.type === 'parenthetical') {
        newType = 'action';
      } else if (currentElement.type === 'action') {
        newType = 'action';
      } else if (currentElement.type === 'transition') {
        newType = 'scene-heading';
      }
    }
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: newType,
      text: initialText
    };
    
    const newElements = [
      ...elements.slice(0, afterIndex + 1),
      newElement,
      ...elements.slice(afterIndex + 1)
    ];
    
    setElements(newElements);
    setActiveElementId(newElement.id);
    onChange({ elements: newElements });
  };
  
  // Change the type of an element
  const changeElementType = (id: string, newType: ElementType) => {
    setElements(prevElements => {
      const elementIndex = prevElements.findIndex(el => el.id === id);
      if (elementIndex === -1) return prevElements;
      
      return prevElements.map((element, index) => {
        if (element.id === id) {
          let newText = element.text;
          
          // Auto-capitalize scene headings and character names
          if (newType === 'scene-heading' || newType === 'character') {
            newText = newText.toUpperCase();
          }
          
          return { ...element, type: newType, text: newText };
        }
        return element;
      });
    });
  };
  
  // Handle tags change
  const handleTagsChange = (elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
  };
  
  // Handle beat tagging
  const handleBeatTag = (elementId: string, beatId: string, actId: string) => {
    console.log(`Tagging element ${elementId} with beat ${beatId} in act ${actId}`);
    // Implementation would go here
  };
  
  // Delete an element
  const deleteElement = (id: string) => {
    const elementIndex = elements.findIndex(el => el.id === id);
    if (elementIndex === -1) return;
    
    // Don't delete the last element
    if (elements.length <= 1) return;
    
    const newElements = elements.filter(el => el.id !== id);
    
    // Set the active element to the previous one, or the next one if there's no previous
    const newActiveIndex = Math.max(0, elementIndex - 1);
    
    setElements(newElements);
    setActiveElementId(newElements[newActiveIndex].id);
    onChange({ elements: newElements });
  };
  
  // Handle structure change
  const handleStructureChange = (structureId: string) => {
    setSelectedStructureId(structureId);
    
    // Find the structure by ID
    const structure = structures.find(s => s.id === structureId);
    if (structure) {
      setSelectedStructure(structure);
    }
    
    if (onStructureChange) {
      onStructureChange(structureId);
    }
  };
  
  // Handle beat mode change
  const handleBeatModeChange = (mode: BeatMode) => {
    setBeatMode(mode);
    if (onToggleBeatMode) {
      onToggleBeatMode(mode);
    }
  };
  
  // Initialize with default elements if empty
  useEffect(() => {
    if (elements.length === 0) {
      const defaultElements: ScriptElement[] = [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Start writing your screenplay...'
        }
      ];
      
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
      onChange({ elements: defaultElements });
    }
  }, []);
  
  const value = {
    elements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    addNewElement,
    deleteElement,
    activeTagFilter,
    setActiveTagFilter,
    beatMode,
    setBeatMode: handleBeatModeChange,
    structures,
    selectedStructureId,
    selectedStructure,
    handleStructureChange,
    scriptContentRef,
    // Additional properties
    filteredElements,
    currentPage,
    getPreviousElementType,
    handleFocus,
    handleNavigate,
    handleEnterKey,
    changeElementType,
    handleTagsChange,
    characterNames,
    projectId,
    handleBeatTag,
    beatSceneCounts
  };
  
  return (
    <ScriptEditorContext.Provider value={value}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
