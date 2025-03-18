import { useEffect, useState, useRef } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType, Structure } from '../../lib/types';
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
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

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
  className = '',
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
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);
  const scriptContentRef = useRef<HTMLDivElement>(null);

  const { 
    structures = [], 
    selectedStructureId = null, 
    selectedStructure = null,
    handleStructureChange: changeSelectedStructure,
    updateBeatCompletion,
    saveBeatCompletion
  } = useProjectStructures(projectId || '');

  useEffect(() => {
    if (externalSelectedStructureId && externalSelectedStructureId !== selectedStructureId && changeSelectedStructure) {
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
      const newElements: ScriptElement[] = defaultElements;
      setElements(newElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements, setElements, setActiveElementId]);

  const zoomPercentage = Math.round(formatState.zoomLevel * 100);

  const handleZoomChange = (value: number[]) => {
    const newZoomLevel = value[0] / 100;
    const { setZoomLevel } = useFormat();
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
      const updatedElements: ScriptElement[] = [...elements];
      updatedElements[currentIndex] = {
        ...currentElement,
        text: currentElement.text + '\n'
      };
      setElements(updatedElements);
      return;
    }
    
    let nextType: ElementType;
    if (currentElement.type === 'scene-heading') {
      nextType = 'action';
    } else if (currentElement.type === 'character') {
      nextType = 'dialogue';
    } else if (currentElement.type === 'dialogue') {
      nextType = 'action';
    } else if (currentElement.type === 'parenthetical') {
      nextType = 'dialogue';
    } else if (currentElement.type === 'transition') {
      nextType = 'scene-heading';
    } else {
      nextType = 'action';
    }
    
    const newElement: ScriptElement = {
      id: generateUniqueId(),
      type: nextType,
      text: ''
    };
    
    if (nextType === 'character') {
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
    if (changeSelectedStructure) {
      changeSelectedStructure(structureId);
    }
    
    if (onStructureChange) {
      onStructureChange(structureId);
    }
  };

  const handleBeatTag = async (elementId: string, beatId: string, actId: string) => {
    if (!selectedStructure || !selectedStructureId) return;
    
    const newElements: ScriptElement[] = elements.map(element =>
      element.id === elementId ? { ...element, beat: beatId } : element
    );
    setElements(newElements);
    
    if (updateBeatCompletion && saveBeatCompletion) {
      const updatedStructure = updateBeatCompletion(beatId, actId, true);
      if (updatedStructure) {
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
    }
  };

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className={`flex flex-col w-full h-full relative ${className}`}>
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
      
      {showKeyboardShortcuts && (
        <div className="keyboard-shortcuts-help">
          <h3 className="text-lg font-medium mb-2">Keyboard Shortcuts</h3>
          <table className="keyboard-shortcuts-table">
            <tbody>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘1</span></td>
                <td>Scene Heading</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘2</span></td>
                <td>Action</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘3</span></td>
                <td>Character</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘4</span></td>
                <td>Dialogue</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘5</span></td>
                <td>Parenthetical</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘6</span></td>
                <td>Transition</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">Tab</span></td>
                <td>Cycle element type</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">Enter</span></td>
                <td>New element</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⇧Enter</span></td>
                <td>New line in dialogue</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘E</span></td>
                <td>Export PDF</td>
              </tr>
              <tr>
                <td><span className="keyboard-shortcut-key">⌘/</span></td>
                <td>Show/hide this help</td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      
      <div ref={scriptContentRef} className="script-content-wrapper">
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
      </div>
      
      <ZoomControls 
        zoomPercentage={zoomPercentage}
        onZoomChange={handleZoomChange}
      />
    </div>
  );
};

export default ScriptEditor;
