import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
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
  handleRemoveBeat: (elementId: string) => void;
  beatSceneCounts: Record<string, number>;
  projectId?: string;
  scriptContentRef: React.RefObject<HTMLDivElement>;
  showKeyboardShortcuts: boolean;
  setShowKeyboardShortcuts: (show: boolean) => void;
  currentPage: number;
  fetchStructures: () => Promise<void>;
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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>(externalBeatMode);
  const scriptContentRef = useRef<HTMLDivElement>(null);
  const [beatSceneCounts, setBeatSceneCounts] = useState<Record<string, number>>({});
  
  const { showKeyboardShortcuts, setShowKeyboardShortcuts } = useKeyboardShortcuts({
    scriptContentRef
  });

  const { 
    structures, 
    selectedStructureId, 
    selectedStructure,
    handleStructureChange: changeSelectedStructure,
    updateBeatCompletion,
    saveBeatCompletion,
    fetchStructures
  } = useProjectStructures(projectId);

  useEffect(() => {
    if (externalSelectedStructureId && externalSelectedStructureId !== selectedStructureId) {
      console.log("External structure ID changed, updating:", externalSelectedStructureId);
      changeSelectedStructure(externalSelectedStructureId);
    }
  }, [externalSelectedStructureId, selectedStructureId, changeSelectedStructure]);

  useEffect(() => {
    if (externalBeatMode !== beatMode) {
      setBeatMode(externalBeatMode);
    }
  }, [externalBeatMode]);

  const handleBeatModeChange = (mode: BeatMode) => {
    setBeatMode(mode);
    if (onToggleBeatMode) {
      onToggleBeatMode(mode);
    }
  };

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

  // Calculate beat scene counts whenever elements change
  useEffect(() => {
    const counts: Record<string, number> = {};
    elements.forEach(element => {
      if (element.beat) {
        counts[element.beat] = (counts[element.beat] || 0) + 1;
      }
    });
    setBeatSceneCounts(counts);
  }, [elements]);

  useEffect(() => {
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
    const newElements: ScriptElement[] = elements.map(element =>
      element.id === elementId ? { ...element, tags } : element
    );
    setElements(newElements);
  };

  const handleStructureChange = async (structureId: string) => {
    console.log("Structure changing to:", structureId);
    await changeSelectedStructure(structureId);
    
    if (onStructureChange) {
      onStructureChange(structureId);
    }
    
    await fetchStructures();
  };

  const handleBeatTag = async (elementId: string, beatId: string, actId: string) => {
    if (!selectedStructure || !selectedStructureId) return;
    
    const newElements: ScriptElement[] = elements.map(element =>
      element.id === elementId ? { ...element, beat: beatId } : element
    );
    setElements(newElements);
    
    const updatedStructure = updateBeatCompletion(beatId, actId, true);
    if (updatedStructure) {
      const success = await saveBeatCompletion(selectedStructureId, updatedStructure);
      if (success) {
        console.log("Beat tagged and structure progress updated");
      } else {
        console.error("Failed to update structure progress");
      }
    }
  };

  const handleRemoveBeat = async (elementId: string) => {
    // Find the element and its current beat
    const element = elements.find(e => e.id === elementId);
    if (!element || !element.beat || !selectedStructureId) return;
    
    const beatId = element.beat;
    
    // Remove the beat tag from the element
    const newElements: ScriptElement[] = elements.map(el =>
      el.id === elementId ? { ...el, beat: undefined } : el
    );
    setElements(newElements);
    
    // Check if this was the last scene tagged with this beat
    const otherSceneWithSameBeat = elements.some(
      e => e.id !== elementId && e.beat === beatId
    );
    
    // If no other scene has this beat, mark it as incomplete in the structure
    if (!otherSceneWithSameBeat && selectedStructure) {
      // Find the act containing this beat
      let actId = "";
      for (const act of selectedStructure.acts) {
        const beatExists = act.beats?.some(b => b.id === beatId);
        if (beatExists) {
          actId = act.id;
          break;
        }
      }
      
      if (actId) {
        const updatedStructure = updateBeatCompletion(beatId, actId, false);
        if (updatedStructure) {
          await saveBeatCompletion(selectedStructureId, updatedStructure);
        }
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
    setBeatMode: handleBeatModeChange,
    structures,
    selectedStructureId,
    selectedStructure,
    handleStructureChange,
    handleBeatTag,
    handleRemoveBeat,
    beatSceneCounts,
    projectId,
    scriptContentRef,
    showKeyboardShortcuts,
    setShowKeyboardShortcuts,
    currentPage,
    fetchStructures
  };

  return (
    <ScriptEditorContext.Provider value={value}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
