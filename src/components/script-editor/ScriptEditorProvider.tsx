
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
  setElements: (elements: ScriptElement[]) => void;
  activeElementId: string | null;
  setActiveElementId: (id: string | null) => void;
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  activeActFilter: ActType | null;
  setActiveActFilter: (act: ActType | null) => void;
  beatMode: BeatMode;
  onToggleBeatMode: (mode: BeatMode) => void;
  currentPage: number;
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  getPreviousElementType: (index: number) => ElementType | null;
  handleNavigate: (id: string, direction: 'up' | 'down') => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
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
  handleBeatTag: (elementId: string, beatId: string, actId?: string) => void;
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

  const { 
    structures, 
    selectedStructureId, 
    selectedStructure,
    handleStructureChange,
    fetchStructures
  } = useStructures({
    projectId
  });

  const availableStructures = structures ? 
    structures.map(s => ({ id: s.id, name: s.name })) : 
    [];

  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    changeElementType
  } = useScriptElements(initialContent, onChange);

  const characterNames = useCharacterNames(elements);

  const { handleNavigate, handleEnterKey } = useScriptNavigation({
    elements,
    setElements,
    activeElementId,
    setActiveElementId
  });

  const onStructureChangeHandler = (structureId: string) => {
    console.log('Structure changed to:', structureId);
    if (parentStructureChange) {
      parentStructureChange(structureId);
    }
    handleStructureChange(structureId);
  };

  useEffect(() => {
    if (initialStructureId && initialStructureId !== selectedStructureId) {
      console.log('Initial structure ID provided:', initialStructureId);
      handleStructureChange(initialStructureId);
    }
  }, [initialStructureId]);

  useEffect(() => {
    if (projectId && fetchStructures) {
      console.log('Fetching structures for project:', projectId);
      fetchStructures();
    }
  }, [projectId, fetchStructures]);

  useEffect(() => {
    if (!selectedStructure || !selectedStructure.acts) return;
    
    const counts: BeatSceneCount[] = [];
    
    const allBeats = selectedStructure.acts.flatMap(act => 
      act.beats ? act.beats.map(beat => ({ ...beat, actId: act.id })) : []
    );
    
    allBeats.forEach(beat => {
      const scenesWithBeat = elements.filter(element => 
        element.beat === beat.id
      );
      
      if (scenesWithBeat.length > 0) {
        counts.push({
          beatId: beat.id,
          actId: beat.actId as string,
          count: scenesWithBeat.length,
          pageRange: '1-2'
        });
      }
    });
    
    setBeatSceneCounts(counts);
  }, [elements, selectedStructure]);

  const handleBeatTag = (elementId: string, beatId: string, actId?: string) => {
    console.log('ScriptEditorProvider.handleBeatTag called:', { elementId, beatId, actId });
    
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, beat: beatId } : element
    );
    
    setElements(updatedElements);
    
    onChange({ elements: updatedElements });
  };

  const handleTagsChange = (elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
    onChange({ elements: elements.map(element =>
      element.id === elementId ? { ...element, tags } : element
    ) });
  };

  const contextValue: ScriptEditorContextType = {
    elements,
    setElements,
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
