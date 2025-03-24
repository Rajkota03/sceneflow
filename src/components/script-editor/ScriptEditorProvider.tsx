
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ScriptContent, ScriptElement, ElementType, Structure } from '@/lib/types';
import { BeatMode } from '@/types/scriptTypes';
import { generateUniqueId } from '@/lib/formatScript';

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
  
  const scriptContentRef = useRef<HTMLDivElement>(null);
  
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
  
  // Add a new element after the specified element
  const addNewElement = (afterId: string, type?: ElementType) => {
    const afterIndex = elements.findIndex(el => el.id === afterId);
    if (afterIndex === -1) return;
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: type || 'action',
      text: ''
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
    scriptContentRef
  };
  
  return (
    <ScriptEditorContext.Provider value={value}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
