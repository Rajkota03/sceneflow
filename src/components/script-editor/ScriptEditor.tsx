
import { useEffect, useState } from 'react';
import { ScriptContent as ScriptContentType, ScriptElement, Note, ElementType, ActType, Structure } from '../../lib/types';
import { generateUniqueId } from '../../lib/formatScript';
import { useFormat } from '@/lib/formatContext';
import { shouldAddContd } from '@/lib/characterUtils';
import TagManager from '../TagManager';
import ZoomControls from './ZoomControls';
import ScriptContentComponent from './ScriptContent';
import useScriptElements from '@/hooks/useScriptElements';
import useFilteredElements from '@/hooks/useFilteredElements';
import useCharacterNames from '@/hooks/useCharacterNames';
import useProjectStructures from '@/hooks/useProjectStructures';
import { toast } from '@/components/ui/use-toast';

type BeatMode = 'on' | 'off';

interface ScriptEditorProps {
  initialContent: ScriptContentType;
  onChange: (content: ScriptContentType) => void;
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
  selectedStructureId: externalSelectedStructureId,
}: ScriptEditorProps) => {
  const { formatState } = useFormat();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeTagFilter, setActiveTagFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>('on');

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
  useEffect(() => {
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

  useEffect(() => {
    if (!elements || elements.length === 0) {
      console.log("No elements found, creating default elements");
      const defaultElements: ScriptElement[] = [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Type your action here...'
        }
      ];
      // Direct assignment instead of using a function to avoid type errors
      const newElements: ScriptElement[] = defaultElements;
      setElements(newElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements, setElements, setActiveElementId]);

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    const { formatState: currentState, setZoomLevel } = useFormat();
    if (setZoomLevel) {
      setZoomLevel(newZoomLevel);
    }
  };

  const handleFormatChange = (id: string, newType: ElementType) => {
    changeElementType(id, newType);
  };

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
    
    let nextType: ElementType;
    switch (currentElement.type) {
      case 'scene-heading':
        nextType = 'action';
        break;
      case 'character':
        nextType = 'dialogue';
        break;
      case 'dialogue':
        nextType = 'action';
        break;
      case 'parenthetical':
        nextType = 'dialogue';
        break;
      case 'transition':
        nextType = 'scene-heading';
        break;
      default:
        nextType = 'action';
    }
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    if (nextType === 'character' as ElementType) {
      let prevCharIndex = -1;
      for (let i = currentIndex - 1; i >= 0; i--) {
        if (elements[i].type === 'character') {
          prevCharIndex = i;
          break;
        }
      }
      
      if (prevCharIndex !== -1) {
        const charName = elements[prevCharIndex].text.replace(/\s*\(CONT'D\)\s*$/, '');
        if (shouldAddContd(charName, currentIndex + 1, [...elements, newElement])) {
          newElement.text = `${charName} (CONT'D)`;
        } else {
          newElement.text = charName;
        }
      }
    }
    
    // Direct assignment instead of using a function to avoid type errors
    const updatedElements: ScriptElement[] = [
      ...elements.slice(0, currentIndex + 1),
      newElement,
      ...elements.slice(currentIndex + 1)
    ];
    
    setElements(updatedElements);
    setActiveElementId(newElement.id);
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

  const handleFilterByTag = (tag: string | null) => {
    setActiveTagFilter(tag);
    if (tag !== null) {
      setActiveActFilter(null);
    }
  };

  const handleFilterByAct = (act: ActType | null) => {
    setActiveActFilter(act);
  };

  const handleToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
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

  return (
    <div className={`flex flex-col w-full h-full relative ${className || ''}`}>
      <TagManager 
        scriptContent={{ elements }} 
        onFilterByTag={handleFilterByTag}
        onFilterByAct={handleFilterByAct}
        activeFilter={activeTagFilter}
        activeActFilter={activeActFilter}
        projectName={projectName}
        structureName={structureName}
        beatMode={beatMode}
        onToggleBeatMode={handleToggleBeatMode}
        structures={structures}
        selectedStructureId={selectedStructureId || undefined}
        onStructureChange={handleStructureChange}
      />
      
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
