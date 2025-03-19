import React, { createContext, useContext, useState, useEffect, useRef, useMemo } from 'react';
import { ScriptContent, ScriptElement, ActType, Structure, ElementType, BeatSceneCount } from '@/lib/types';
import useScriptElements from '@/hooks/useScriptElements';
import useScriptNavigation from '@/hooks/useScriptNavigation';
import useCharacterNames from '@/hooks/useCharacterNames';
import useProjectStructures from '@/hooks/useProjectStructures';
import { BeatMode } from '@/types/scriptTypes';
import { toast } from '@/components/ui/use-toast';

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
  const [currentPage, setCurrentPage] = useState(1);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [beatSceneCounts, setBeatSceneCounts] = useState<BeatSceneCount[]>([]);
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

  const characterNames = useCharacterNames(elements);
  
  const onToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  const handleTagsChange = (elementId: string, tags: string[]) => {
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId ? { ...element, tags } : element
      )
    );
  };
  
  const handleBeatTag = (elementId: string, beatId: string, actId: string) => {
    console.log('handleBeatTag called:', { elementId, beatId, actId });
    
    const elementToUpdate = elements.find(el => el.id === elementId);
    if (!elementToUpdate) {
      console.error('Element not found:', elementId);
      return;
    }
    
    setElements(prevElements =>
      prevElements.map(element =>
        element.id === elementId 
          ? { ...element, beat: beatId } 
          : element
      )
    );
    
    toast({
      description: "Scene tagged successfully",
      duration: 2000,
    });
    
    updateBeatSceneCounts();
  };
  
  const updatePageNumbers = () => {
    const updatedElements = elements.map((element, index) => {
      const estimatedPage = Math.floor(index / 15) + 1;
      return { ...element, page: estimatedPage };
    });
    
    setElements(updatedElements);
    updateBeatSceneCounts();
  };
  
  const updateBeatSceneCounts = () => {
    if (!selectedStructure) return;
    
    const counts: BeatSceneCount[] = [];
    
    let acts: any[] = [];
    
    if (selectedStructure.acts && Array.isArray(selectedStructure.acts)) {
      acts = selectedStructure.acts;
    } else if (selectedStructure.acts && typeof selectedStructure.acts === 'object' && 'acts' in selectedStructure.acts) {
      acts = (selectedStructure.acts as any).acts || [];
    }
    
    if (!Array.isArray(acts)) {
      console.error('Structure acts is not an array:', selectedStructure);
      return;
    }
    
    acts.forEach(act => {
      if (!act.beats || !Array.isArray(act.beats)) return;
      
      act.beats.forEach(beat => {
        const taggedScenes = elements.filter(
          element => element.type === 'scene-heading' && element.beat === beat.id
        );
        
        let minPage = Infinity;
        let maxPage = 0;
        
        taggedScenes.forEach(scene => {
          if (scene.page) {
            minPage = Math.min(minPage, scene.page);
            maxPage = Math.max(maxPage, scene.page);
          }
        });
        
        const pageRange = taggedScenes.length > 0 
          ? (minPage === maxPage ? `p.${minPage}` : `pp.${minPage}-${maxPage}`)
          : '';
        
        counts.push({
          beatId: beat.id,
          actId: act.id,
          count: taggedScenes.length,
          pageRange
        });
      });
    });
    
    setBeatSceneCounts(counts);
  };
  
  useEffect(() => {
    updatePageNumbers();
  }, [elements.length, selectedStructure]);
  
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
    updatePageNumbers
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
