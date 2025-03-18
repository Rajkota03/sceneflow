
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ScriptContent, ScriptElement, ActType, Structure } from '@/lib/types';
import useScriptElements from '@/hooks/useScriptElements';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useCharacterNames from '@/hooks/useCharacterNames';
import useProjectStructures from '@/hooks/useProjectStructures';
import { BeatMode } from '@/types/scriptTypes';

interface ScriptEditorContextType {
  elements: ScriptElement[];
  setElements: React.Dispatch<React.SetStateAction<ScriptElement[]>>;
  activeElementId: string | null;
  setActiveElementId: React.Dispatch<React.SetStateAction<string | null>>;
  handleElementChange: (id: string, text: string, type: ActType) => void;
  getPreviousElementType: (index: number) => ActType | undefined;
  addNewElement: (afterId: string, explicitType?: ActType) => void;
  changeElementType: (id: string, newType: ActType) => void;
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
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>('on');
  
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

  const characterNames = useCharacterNames(elements);
  
  const onToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  return (
    <ScriptEditorContext.Provider
      value={{
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
        projectTitle
      }}
    >
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
