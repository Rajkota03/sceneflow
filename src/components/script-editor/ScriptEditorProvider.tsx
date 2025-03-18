
import React, { createContext, useContext, useState, useRef } from 'react';
import { ScriptContent, ScriptElement, ElementType, ActType, Structure } from '@/lib/types';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useProjectStructures from '@/hooks/useProjectStructures';
import { BeatMode } from '@/types/scriptTypes';
import { toast } from '@/components/ui/use-toast';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';

interface ScriptEditorContextType {
  elements: ScriptElement[];
  filteredElements: ScriptElement[];
  activeElementId: string | null;
  setActiveElementId: (id: string | null) => void;
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  getPreviousElementType: (index: number) => ElementType | undefined;
  addNewElement: (afterId: string, explicitType?: ElementType) => void;
  changeElementType: (id: string, newType: ElementType) => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
  handleNavigate: (direction: 'up' | 'down', id: string) => void;
  handleFocus: (id: string) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  activeActFilter: ActType | null;
  setActiveActFilter: (act: ActType | null) => void;
  beatMode: BeatMode;
  setBeatMode: (mode: BeatMode) => void;
  structures: Structure[];
  selectedStructureId: string | null;
  selectedStructure: Structure | null;
  handleStructureChange: (structureId: string) => void;
  handleBeatTag: (elementId: string, beatId: string, actId: string) => void;
  projectId?: string;
  scriptContentRef: React.RefObject<HTMLDivElement>;
  showKeyboardShortcuts: boolean;
  setShowKeyboardShortcuts: (show: boolean) => void;
  currentPage: number;
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
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  children: React.ReactNode;
}

export const ScriptEditorProvider: React.FC<ScriptEditorProviderProps> = ({
  initialContent,
  onChange,
  projectId,
  selectedStructureId: externalSelectedStructureId,
  onStructureChange,
  children
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  const scriptContentRef = useRef<HTMLDivElement>(null);
  
  const { showKeyboardShortcuts, setShowKeyboardShortcuts } = useKeyboardShortcuts({
    scriptContentRef
  });

  // Fetch structures for this project
  const { 
    structures, 
    selectedStructureId, 
    selectedStructure,
    handleStructureChange: changeSelectedStructure,
    updateBeatCompletion,
    saveBeatCompletion
  } = useProjectStructures(projectId);

  // Sync the external selectedStructureId with our local state if provided
  React.useEffect(() => {
    if (externalSelectedStructureId && externalSelectedStructureId !== selectedStructureId) {
      changeSelectedStructure(externalSelectedStructureId);
    }
  }, [externalSelectedStructureId, selectedStructureId, changeSelectedStructure]);

  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType
  } = useScriptElements(initialContent, onChange);

  const characterNames = useCharacterNames(elements);
  const filteredElements = useFilteredElements(elements, activeTagFilter, activeActFilter);

  // PDF import handler
  React.useEffect(() => {
    const handlePdfImported = (event: CustomEvent<{elements: ScriptElement[]}>) => {
      if (event.detail && Array.isArray(event.detail.elements)) {
        const importedElements = event.detail.elements;
        if (importedElements.length > 0) {
          setElements(importedElements);
          setActiveElementId(importedElements[0].id);
          
          toast({
            title: "PDF Imported",
            description: `Successfully imported ${importedElements.length} elements from PDF`,
          });
        }
      }
    };
    
    window.addEventListener('pdf-imported' as any, handlePdfImported as any);
    
    return () => {
      window.removeEventListener('pdf-imported' as any, handlePdfImported as any);
    };
  }, [setElements, setActiveElementId]);

  const handleEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    const currentElement = elements[currentIndex];
    
    if (shiftKey && currentElement.type === 'dialogue') {
      // Direct assignment instead of using a function to avoid type errors
      const updatedElements: ScriptElement[] = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    addNewElement(id);
  };

  const handleNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(el => el.id === id);
    if (currentIndex === -1) return;
    
    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  const handleTagsChange = (elementId: string, tags: string[]) => {
    // Direct assignment instead of using a function to avoid type errors
    const newElements: ScriptElement[] = elements.map(element =>
      element.id === elementId ? { ...element, tags } : element
    );
    setElements(newElements);
  };

  const handleStructureChange = (structureId: string) => {
    changeSelectedStructure(structureId);
    if (onStructureChange) {
      onStructureChange(structureId);
    }
  };

  const handleBeatTag = async (elementId: string, beatId: string, actId: string) => {
    if (!selectedStructure || !selectedStructureId) return;
    
    // Update the element with the beat tag
    // Direct assignment instead of using a function to avoid type errors
    const newElements: ScriptElement[] = elements.map(element =>
      element.id === elementId ? { ...element, beat: beatId } : element
    );
    setElements(newElements);
    
    // Update the beat's completion status in the structure
    const updatedStructure = updateBeatCompletion(beatId, actId, true);
    if (updatedStructure) {
      // Save the updated structure to the database
      const success = await saveBeatCompletion(selectedStructureId, updatedStructure);
      if (success) {
        toast({
          title: "Beat tagged",
          description: "The scene has been tagged and structure progress updated.",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update the structure progress.",
          variant: "destructive",
        });
      }
    }
  };

  const value = {
    elements,
    filteredElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType,
    handleEnterKey,
    handleNavigate,
    handleFocus,
    handleTagsChange,
    characterNames,
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    beatMode,
    setBeatMode,
    structures,
    selectedStructureId,
    selectedStructure,
    handleStructureChange,
    handleBeatTag,
    projectId,
    scriptContentRef,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts,
    currentPage
  };

  return (
    <ScriptEditorContext.Provider value={value}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
