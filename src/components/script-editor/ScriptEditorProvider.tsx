
import React, { createContext, useContext, useState, useRef, useEffect } from 'react';
import { ScriptContent, ScriptElement, ActType, ElementType, Note, Structure, BeatSceneCount } from '@/lib/types';
import { generateUniqueId } from '@/lib/formatScript';
import useScriptElements from '@/hooks/useScriptElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useFilteredElements from '@/hooks/useFilteredElements';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useKeyboardShortcuts from '@/hooks/useKeyboardShortcuts';
import useEditorUIState from '@/hooks/useEditorUIState';
import useStructures from '@/hooks/structure/useStructures';
import { BeatMode } from '@/types/scriptTypes';

interface ScriptEditorProviderProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectId?: string;
  projectTitle?: string;
  structureName?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  children: React.ReactNode;
}

export interface ScriptEditorContextType {
  elements: ScriptElement[];
  activeElementId: string | null;
  setActiveElementId: (id: string | null) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  activeActFilter: ActType | null;
  setActiveActFilter: (act: ActType | null) => void;
  beatMode: BeatMode;
  onToggleBeatMode: (mode: BeatMode) => void;
  currentPage: number;
  handleElementChange: (id: string, changes: Partial<ScriptElement>) => void;
  getPreviousElementType: (index: number) => ElementType | null;
  handleNavigate: (id: string, direction: 'up' | 'down') => void;
  handleEnterKey: (id: string) => void;
  showKeyboardShortcuts: boolean;
  toggleKeyboardShortcuts: () => void;
  changeElementType: (id: string, newType: ElementType) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  projectTitle?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructure?: Structure | null;
  structures?: Structure[];
  availableStructures?: Array<{ id: string; name: string }>;
  activeBeatId: string | null;
  setActiveBeatId: (beatId: string | null) => void;
  handleBeatTag: (elementId: string, beatId: string) => void;
  scriptContentRef: React.RefObject<HTMLDivElement>;
  beatSceneCounts: BeatSceneCount[];
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
  selectedStructureId: initialStructureId,
  onStructureChange: parentStructureChange,
  children
}) => {
  const scriptContentRef = useRef<HTMLDivElement>(null);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [beatSceneCounts, setBeatSceneCounts] = useState<BeatSceneCount[]>([]);

  // UI state management
  const {
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    beatMode,
    onToggleBeatMode,
    currentPage,
    showKeyboardShortcuts,
    toggleKeyboardShortcuts
  } = useEditorUIState();

  // Load structures if project ID is available
  const { 
    structures, 
    selectedStructureId, 
    selectedStructure,
    handleStructureChange
  } = useStructures({
    projectId
  });

  // Convert structures to options format for selector
  const availableStructures = structures ? 
    structures.map(s => ({ id: s.id, name: s.name })) : 
    [];

  // Use the script elements hook
  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    changeElementType
  } = useScriptElements(initialContent, onChange);

  // Character names for auto-suggestions
  const characterNames = useCharacterNames(elements);

  // Navigation between elements
  const { handleNavigate, handleEnterKey } = useScriptNavigation({
    elements,
    setElements,
    activeElementId,
    setActiveElementId
  });

  // Handle structure change from parent or internal
  const onStructureChangeHandler = (structureId: string) => {
    if (parentStructureChange) {
      parentStructureChange(structureId);
    }
    handleStructureChange(structureId);
  };

  // Initialize with structure ID if provided
  useEffect(() => {
    if (initialStructureId && initialStructureId !== selectedStructureId) {
      handleStructureChange(initialStructureId);
    }
  }, [initialStructureId]);

  // Calculate beat scene counts when elements or selectedStructure changes
  useEffect(() => {
    if (!selectedStructure || !selectedStructure.acts) return;
    
    const counts: BeatSceneCount[] = [];
    
    // Flatten all beats from all acts
    const allBeats = selectedStructure.acts.flatMap(act => 
      act.beats ? act.beats.map(beat => ({ ...beat, actId: act.id })) : []
    );
    
    // Count scenes for each beat
    allBeats.forEach(beat => {
      const scenesWithBeat = elements.filter(element => 
        element.beatId === beat.id
      );
      
      if (scenesWithBeat.length > 0) {
        counts.push({
          beatId: beat.id,
          actId: beat.actId as string,
          count: scenesWithBeat.length,
          pageRange: '1-2' // This would need proper calculation based on actual page numbers
        });
      }
    });
    
    setBeatSceneCounts(counts);
  }, [elements, selectedStructure]);

  // Handle tagging an element with a beat
  const handleBeatTag = (elementId: string, beatId: string) => {
    handleElementChange(elementId, { beatId });
  };
  
  // Handler for updating tags on elements
  const handleTagsChange = (elementId: string, tags: string[]) => {
    handleElementChange(elementId, { tags });
  };

  // Create the context value
  const contextValue: ScriptEditorContextType = {
    elements,
    activeElementId,
    setActiveElementId,
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    beatMode,
    onToggleBeatMode,
    currentPage,
    handleElementChange,
    getPreviousElementType,
    handleNavigate,
    handleEnterKey,
    showKeyboardShortcuts,
    toggleKeyboardShortcuts,
    changeElementType,
    handleTagsChange,
    characterNames,
    projectId,
    projectTitle,
    selectedStructureId,
    onStructureChange: onStructureChangeHandler,
    selectedStructure,
    structures,
    availableStructures,
    activeBeatId,
    setActiveBeatId,
    handleBeatTag,
    scriptContentRef,
    beatSceneCounts
  };

  return (
    <ScriptEditorContext.Provider value={contextValue}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;
