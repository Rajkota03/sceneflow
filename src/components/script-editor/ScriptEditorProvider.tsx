
import React, { createContext, useContext, useState, useRef, useEffect, useCallback, useMemo } from 'react'; // Added useMemo, useCallback
import { ScriptContent, ScriptElement, ActType, ElementType, Note, Structure, BeatSceneCount, Act, Beat } from '@/lib/types'; // Added Act, Beat
import { generateUniqueId } from '@/lib/formatScript';
import useScriptElements from '@/hooks/useScriptElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useEditorUIState from '@/hooks/useEditorUIState';
import useStructures from '@/hooks/structure/useStructures'; // Corrected import: default export
import { BeatMode } from '@/types/scriptTypes';
import { toast } from '@/components/ui/use-toast';
import { updateStructureBeatCompletion, saveStructureBeatCompletion } from '@/hooks/structure/structureUtils';

interface ScriptEditorProviderProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectId?: string;
  projectTitle?: string;
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
  handleElementChange: (id: string, text: string, type: ElementType) => void;
  getPreviousElementType: (index: number) => ElementType | null;
  showKeyboardShortcuts: boolean;
  toggleKeyboardShortcuts: () => void;
  changeElementType: (id: string, newType: ElementType) => void;
  handleTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  projectTitle?: string;
  selectedStructureId: string | null; // Now from useStructures
  onStructureChange: (structureId: string) => void; // Now from useStructures
  updateStructure: (updatedStructureData: Structure) => Promise<boolean>; // Now from useStructures
  selectedStructure: Structure | null; // Now from useStructures
  structures: Structure[]; // Now from useStructures
  availableStructures: Array<{ id: string; name: string }>; // Derived from structures
  activeBeatId: string | null;
  setActiveBeatId: (beatId: string | null) => void;
  handleBeatTag: (elementId: string, beatId: string, actId?: string) => void;
  scriptContentRef: React.RefObject<HTMLDivElement>;
  beatSceneCounts: BeatSceneCount[];
  setElements: (elements: React.SetStateAction<ScriptElement[]>) => void;
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
  children
}) => {
  const scriptContentRef = useRef<HTMLDivElement>(null);
  const [activeBeatId, setActiveBeatId] = useState<string | null>(null);
  const [beatSceneCounts, setBeatSceneCounts] = useState<BeatSceneCount[]>([]);

  // UI State Hook
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

  // Structure Management Hook
  const {
    structures,
    selectedStructureId,
    selectedStructure,
    handleStructureChange,
    updateStructure,
    fetchStructures // Keep if needed, but hook handles initial fetch
  } = useStructures({ projectId });

  // Derive available structures for selectors
  const availableStructures = useMemo(() => 
    structures.map(s => ({ id: s.id, name: s.name })), 
  [structures]);

  // Script Element Management Hook
  const {
    elements,
    setElements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    changeElementType
  } = useScriptElements(initialContent, onChange);

  // Derived Data Hooks
  const characterNames = useCharacterNames(elements);
  

  // Calculate Beat Scene Counts (Memoized)
  useEffect(() => {
    if (!selectedStructure || !selectedStructure.acts) {
      setBeatSceneCounts([]);
      return;
    }

    console.log("Recalculating beat scene counts...");
    const counts: BeatSceneCount[] = [];
    const actsArray = Array.isArray(selectedStructure.acts) 
      ? selectedStructure.acts 
      : Object.values(selectedStructure.acts || {});

    if (!Array.isArray(actsArray)) return;

    const allBeats = actsArray.flatMap((act: Act) => 
      act.beats?.map(beat => ({ ...beat, actId: act.id })) || []
    );

    allBeats.forEach((beat: Beat & { actId: string }) => {
      if (!beat || !beat.id) return;
      const scenesWithBeat = elements.filter(element => element.beat === beat.id && element.type === 'scene-heading');
      if (scenesWithBeat.length > 0) {
        // TODO: Calculate actual page range based on element positions
        counts.push({
          beatId: beat.id,
          actId: beat.actId,
          count: scenesWithBeat.length,
          pageRange: '...' // Placeholder for page range
        });
      }
    });

    setBeatSceneCounts(counts);
  }, [elements, selectedStructure]);

  // Beat Tagging Handler
  const handleBeatTag = useCallback(async (elementId: string, beatId: string, actId?: string) => {
    console.log('ScriptEditorProvider.handleBeatTag:', { elementId, beatId, actId });

    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, beat: beatId } : element
    );
    setElements(updatedElements);
    onChange({ elements: updatedElements }); // Propagate change upwards

    // Mark beat as complete in structure (optional, based on logic)
    if (selectedStructure && selectedStructureId && actId && beatId) {
      console.log('Marking beat as complete:', { beatId, actId });
      const updatedStructureData = updateStructureBeatCompletion(
        selectedStructure,
        beatId,
        actId,
        true // Mark as complete
      );

      if (updatedStructureData) {
        // Persist the completion status change
        const success = await updateStructure(updatedStructureData);
        if (success) {
          toast({ description: "Beat marked as complete.", duration: 2000 });
          // No need to manually refetch, useStructures handles state update
        } else {
          console.error('Failed to save beat completion status');
          toast({ title: "Error", description: "Failed to update beat status.", variant: "destructive" });
        }
      }
    }
  }, [elements, onChange, selectedStructure, selectedStructureId, setElements, updateStructure]);

  // Scene Tag (non-beat) Handler
  const handleTagsChange = useCallback((elementId: string, tags: string[]) => {
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, tags } : element
    );
    setElements(updatedElements);
    onChange({ elements: updatedElements }); // Propagate change upwards
  }, [elements, onChange, setElements]);


  // Context Value
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
    showKeyboardShortcuts,
    toggleKeyboardShortcuts,
    changeElementType,
    handleTagsChange,
    characterNames,
    projectId,
    projectTitle,
    selectedStructureId,
    onStructureChange: handleStructureChange,
    updateStructure, // From useStructures
    selectedStructure,
    structures,
    availableStructures,
    activeBeatId,
    setActiveBeatId,
    handleBeatTag,
    scriptContentRef,
    beatSceneCounts,
    setElements
  };

  return (
    <ScriptEditorContext.Provider value={contextValue}>
      {children}
    </ScriptEditorContext.Provider>
  );
};

export default ScriptEditorProvider;

