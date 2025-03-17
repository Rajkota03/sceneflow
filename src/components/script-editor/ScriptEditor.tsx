
import { useState } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType, Structure } from '../../lib/types';
import { useFormat } from '@/lib/formatContext';
import TagManager from '../TagManager';
import ZoomControls from './ZoomControls';
import ScriptContentComponent from './ScriptContent';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useProjectStructures from '@/hooks/useProjectStructures';
import { useScriptEditing } from '@/hooks/useScriptEditing';
import { useBeatTagging } from '@/hooks/useBeatTagging';
import { useTagFiltering } from '@/hooks/useTagFiltering';
import EditorInitializer from './EditorInitializer';

type BeatMode = 'on' | 'off';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
  className?: string;
  projectName?: string;
  structureName?: string;
  projectId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructureId?: string;
}

const ScriptEditor = ({ 
  initialContent, 
  onChange, 
  notes, 
  onNoteCreate, 
  className,
  projectName = "Untitled Project",
  structureName = "Three Act Structure",
  projectId,
  onStructureChange,
}: ScriptEditorProps) => {
  const { formatState } = useFormat();
  const [currentPage, setCurrentPage] = useState(1);

  // Get structures data
  const { 
    structures, 
    selectedStructureId, 
    selectedStructure,
    handleStructureChange: changeSelectedStructure,
    updateBeatCompletion,
    saveBeatCompletion
  } = useProjectStructures(projectId);

  // Get script elements
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

  // Get character names from the script
  const characterNames = useCharacterNames(elements);

  // Tag filtering functionality
  const {
    activeTagFilter,
    activeActFilter,
    beatMode,
    handleFilterByTag,
    handleFilterByAct,
    handleToggleBeatMode
  } = useTagFiltering();

  // Get filtered elements based on tag/act filters
  const filteredElements = useFilteredElements(elements, activeTagFilter, activeActFilter);

  // Script editing operations
  const {
    handleEnterKey,
    handleNavigate,
    handleFormatChange,
    handleTagsChange
  } = useScriptEditing(elements, setElements, activeElementId, setActiveElementId);

  // Beat tagging functionality
  const { handleBeatTag } = useBeatTagging(
    elements,
    setElements,
    selectedStructure,
    selectedStructureId,
    updateBeatCompletion,
    saveBeatCompletion
  );

  // Handle zoom changes
  const zoomPercentage = Math.round(formatState.zoomLevel * 100);
  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    const { formatState: currentState, setZoomLevel } = useFormat();
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  // Handle structure changes
  const handleStructureChange = (structureId: string) => {
    changeSelectedStructure(structureId);
    if (onStructureChange) {
      onStructureChange(structureId);
    }
  };

  // Handle element focus
  const handleFocus = (id: string) => {
    setActiveElementId(id);
  };

  // Error handling: Wrap TagManager with error boundary to prevent entire app from crashing
  const renderTagManager = () => {
    try {
      return (
        <TagManager 
          scriptContent={{ elements }} 
          onFilterByTag={handleFilterByTag}
          onFilterByAct={handleFilterByAct}
          activeFilter={activeTagFilter}
          activeActFilter={activeActFilter}
          projectName={projectName}
          structureName={structureName || (selectedStructure?.name || "Three Act Structure")}
          beatMode={beatMode}
          onToggleBeatMode={handleToggleBeatMode}
          structures={structures}
          selectedStructureId={selectedStructureId || undefined}
          onStructureChange={handleStructureChange}
          selectedStructure={selectedStructure}
        />
      );
    } catch (error) {
      console.error("Error rendering TagManager:", error);
      return (
        <div className="p-2 bg-red-50 text-red-600 text-sm">
          Error loading tag manager. Please refresh the page.
        </div>
      );
    }
  };

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <EditorInitializer 
        elements={elements}
        setElements={setElements}
        setActiveElementId={setActiveElementId}
      />
      
      {renderTagManager()}
      
      <ScriptContentComponent
        filteredElements={filteredElements}
        activeElementId={activeElementId}
        currentPage={currentPage}
        getPreviousElementType={getPreviousElementType}
        handleElementChange={handleElementChange}
        handleFocus={handleFocus}
        handleNavigate={handleNavigate}
        handleEnterKey={handleEnterKey}
        handleFormatChange={handleFormatChange}
        handleTagsChange={handleTagsChange}
        characterNames={characterNames}
        projectId={projectId}
        beatMode={beatMode}
        selectedStructure={selectedStructure}
        onBeatTag={handleBeatTag}
      />
      
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

export default ScriptEditor;
