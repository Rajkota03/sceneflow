
import React, { createContext, useContext, useRef } from 'react';
import { ScriptContent, ScriptElement, ActType, Structure, ElementType } from '@/lib/types';
import useScriptElements from '@/hooks/useScriptElements';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useCharacterNames from '@/hooks/useCharacterNames';
import useProjectStructures from '@/hooks/useProjectStructures';
import { BeatMode } from '@/types/scriptTypes';
import useBeatTagging from '@/hooks/useBeatTagging';
import useEditorUIState from '@/hooks/useEditorUIState';

interface ScriptEditorContextType {
  elements: ScriptElement[];
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>;
  activeElementId: string | null;
  setActiveElementId: React.Dispatch<React.SetStateAction<string | null>>;
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  getPreviousElementType: (index: number) => ElementType | undefined;
  addNewElement: (afterId: string, explicitType?: ElementType) => void;
  changeElementType: (id: string, newType: ElementType) => void;
  handleNavigate: (direction: 'up' | 'down', id: string) => void;
  handleEnterKey: (id: string, shiftKey: boolean) => void;
  characterNames: string[];
  activeTagFilter: string | null;
  setActiveTagFilter: (tag: string | null) => void;
  activeActFilter: ActType | null;
  setActiveActFilter: (act: ActType | null) => void;
  projectId?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructure?: Structure | null;
  beatMode: BeatMode;
  onToggleBeatMode: (mode: BeatMode) => void;
  projectTitle?: string;
  currentPage: number;
  scriptContentRef: React.RefObject<HTMLDivElement>;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  activeBeatId: string | null;
  setActiveBeatId: (beatId: string | null) => void;
  handleBeatTag: (elementId: string, beatId: string, actId: string) => void;
  beatSceneCounts: BeatSceneCount[];
  updatePageNumbers: () => void;
  showKeyboardShortcuts: boolean;
  toggleKeyboardShortcuts: () => void;
}

const ScriptEditorContext = createContext<ScriptEditorContextType | undefined>(undefined);

interface ScriptEditorProviderProps {
  children: React.ReactNode;
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  projectId?: string;
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  projectTitle?: string;
}

export const ScriptEditorProvider: React.FC<ScriptEditorProviderProps> = ({
  children,
  initialContent,
  onChange,
  projectId,
  selectedStructureId,
  onStructureChange,
  projectTitle
}) => {
  // Use our custom hooks to organize functionality
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
  
  const scriptContentRef = useRef<HTMLDivElement>(null);
  
  const { selectedStructure } = useProjectStructures(projectId);

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

  const { handleNavigate, handleEnterKey } = useScriptNavigation({
    elements,
    setElements,
    activeElementId,
    setActiveElementId
  });

  const { 
    activeBeatId, 
    setActiveBeatId, 
    beatSceneCounts, 
    handleBeatTag, 
    updatePageNumbers 
  } = useBeatTagging({
    elements,
    setElements,
    selectedStructure
  });

  const characterNames = useCharacterNames(elements);
  
  const handleTagsChange = (elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
  };
  
  const contextValue = {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType,
    handleNavigate,
    handleEnterKey,
    characterNames,
    activeTagFilter,
    setActiveTagFilter,
    activeActFilter,
    setActiveActFilter,
    projectId,
    selectedStructureId,
    onStructureChange,
    selectedStructure,
    beatMode,
    onToggleBeatMode,
    projectTitle,
    currentPage,
    scriptContentRef,
    handleTagsChange,
    activeBeatId,
    setActiveBeatId,
    handleBeatTag,
    beatSceneCounts,
    updatePageNumbers,
    showKeyboardShortcuts,
    toggleKeyboardShortcuts
  };

  return (
    <ScriptEditorContext.Provider value={contextValue}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export const useScriptEditor = () => {
  const context = useContext(ScriptEditorContext);
  if (!context) {
    throw new Error('useScriptEditor must be used within a ScriptEditorProvider');
  }
  return context;
};

export default ScriptEditorProvider;
