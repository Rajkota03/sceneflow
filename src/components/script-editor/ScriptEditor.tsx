
import { useEffect, useState, useRef } from 'react';
import { ScriptContent, ScriptElement, Note, ElementType, ActType, Structure } from '../../lib/types';
import { generateUniqueId } from '../../lib/formatScript';
import TagManager from '../TagManager';
import { useLockBodyScroll } from '@/hooks/useLockBodyScroll';
import { BeatMode } from '@/types/scriptTypes';
import ScriptContentComponent from './ScriptContent';
import { PanelResizeHandle, Panel, PanelGroup } from 'react-resizable-panels';
import { Button } from '@/components/ui/button';
import { ZoomInIcon, ZoomOutIcon } from 'lucide-react';
import ActBar from '@/components/ActBar';

interface ScriptEditorProps {
  content: ScriptContent;
  onContentChange: (content: ScriptContent) => void;
  projectId?: string;
  structures?: Structure[];
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
}

const ScriptEditor = ({
  content,
  onContentChange,
  projectId,
  structures,
  selectedStructureId,
  onStructureChange
}: ScriptEditorProps) => {
  const [elements, setElements] = useState<ScriptElement[]>(content.elements);
  const [activeElementId, setActiveElementId] = useState<string | null>(null);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState<string | null>(null);
  const [activeActFilter, setActiveActFilter] = useState<ActType | null>(null);
  const [beatMode, setBeatMode] = useState<BeatMode>('off');
  const [zoomLevel, setZoomLevel] = useState(1);

  const panelGroupRef = useRef(null);

  useLockBodyScroll(isTagManagerOpen);

  useEffect(() => {
    setElements(content.elements);
  }, [content]);

  const handleZoomIn = () => {
    setZoomLevel(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setZoomLevel(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleFilterByTag = (tag: string | null) => {
    setActiveFilter(tag);
  };

  const handleFilterByAct = (act: ActType | null) => {
    setActiveActFilter(act);
  };

  const handleToggleBeatMode = (mode: BeatMode) => {
    setBeatMode(mode);
  };

  const handleElementChange = (id: string, text: string, type: ElementType) => {
    const updatedElements = elements.map(element =>
      element.id === id ? { ...element, text, type } : element
    );
    setElements(updatedElements);

    const newContent: ScriptContent = {
      ...content,
      elements: updatedElements
    };
    onContentChange(newContent);
  };

  const handleElementFocus = () => {
    setIsTagManagerOpen(false);
  };

  const handleElementNavigate = (direction: 'up' | 'down', id: string) => {
    const currentIndex = elements.findIndex(element => element.id === id);

    if (direction === 'up' && currentIndex > 0) {
      setActiveElementId(elements[currentIndex - 1].id);
    } else if (direction === 'down' && currentIndex < elements.length - 1) {
      setActiveElementId(elements[currentIndex + 1].id);
    }
  };

  const handleElementEnterKey = (id: string, shiftKey: boolean) => {
    const currentIndex = elements.findIndex(element => element.id === id);

    if (shiftKey) {
      handleCreateNewElement(currentIndex, 'action');
    } else {
      const currentType = elements[currentIndex].type;
      let nextType: ElementType = 'action';

      switch (currentType) {
        case 'scene-heading':
          nextType = 'action';
          break;
        case 'action':
          nextType = 'character';
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

      handleCreateNewElement(currentIndex, nextType);
    }
  };

  const handleFormatChange = (id: string, newType: ElementType) => {
    const updatedElements = elements.map(element =>
      element.id === id ? { ...element, type: newType } : element
    );
    setElements(updatedElements);

    const newContent: ScriptContent = {
      ...content,
      elements: updatedElements
    };
    onContentChange(newContent);
  };

  const handleTagsChange = (elementId: string, tags: string[]) => {
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, tags: tags } : element
    );
    setElements(updatedElements);

    const newContent: ScriptContent = {
      ...content,
      elements: updatedElements
    };
    onContentChange(newContent);
  };

  const handleBeatTag = (elementId: string, beatId: string, actId: string) => {
    const updatedElements = elements.map(element =>
      element.id === elementId ? { ...element, beat: beatId } : element
    );
    setElements(updatedElements);

    const newContent: ScriptContent = {
      ...content,
      elements: updatedElements
    };
    onContentChange(newContent);
  };

  const handleCreateNewElement = (currentIndex: number, nextType: ElementType, prevElementType?: ElementType) => {
    const uniqueId = generateUniqueId();
    const newElement: ScriptElement = {
      id: uniqueId,
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

      if (prevCharIndex !== -1 && elements[prevCharIndex].text) {
        newElement.text = elements[prevCharIndex].text;
      }
    }

    const updatedElements = [
      ...elements.slice(0, currentIndex + 1),
      newElement,
      ...elements.slice(currentIndex + 1)
    ];

    setElements(updatedElements);

    const newContent: ScriptContent = {
      ...content,
      elements: updatedElements
    };

    onContentChange(newContent);

    setTimeout(() => {
      setActiveElementId(uniqueId);
    }, 0);
  };

  const characterNames = Array.from(new Set(elements
    .filter(element => element.type === 'character')
    .map(element => element.text)
    .filter(text => text.trim() !== '')));

  const selectedStructure = structures?.find(structure => structure.id === selectedStructureId) || null;

  return (
    <div className="flex h-full">
      <PanelGroup direction="horizontal" className="flex-grow">
        <Panel minSize={20} defaultSize={70}>
          <div className="h-full flex flex-col">
            <div className="flex items-center justify-between p-2 bg-gray-100 border-b">
              <div className="flex items-center space-x-2">
                <Button variant="outline" size="icon" onClick={handleZoomIn}>
                  <ZoomInIcon className="h-4 w-4" />
                </Button>
                <Button variant="outline" size="icon" onClick={handleZoomOut}>
                  <ZoomOutIcon className="h-4 w-4" />
                </Button>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  onClick={() => setIsTagManagerOpen(true)}
                >
                  Tags
                </Button>
              </div>
            </div>
            <div
              className="flex-grow overflow-y-auto p-4"
              style={{ zoom: zoomLevel }}
            >
              <ScriptContentComponent
                elements={elements}
                activeElementId={activeElementId}
                characterNames={characterNames}
                projectId={projectId}
                beatMode={beatMode}
                selectedStructure={selectedStructure}
                onElementChange={handleElementChange}
                onElementFocus={handleElementFocus}
                onElementNavigate={handleElementNavigate}
                onElementEnterKey={handleElementEnterKey}
                onFormatChange={handleFormatChange}
                onTagsChange={handleTagsChange}
                onBeatTag={handleBeatTag}
              />
            </div>
          </div>
        </Panel>
        <PanelResizeHandle className="bg-gray-200 hover:bg-gray-300" />
        <Panel defaultSize={30} minSize={20}>
          {isTagManagerOpen && (
            <TagManager
              scriptContent={content}
              onFilterByTag={handleFilterByTag}
              onFilterByAct={handleFilterByAct}
              activeFilter={activeFilter}
              activeActFilter={activeActFilter}
              projectName={content.title}
              beatMode={beatMode}
              onToggleBeatMode={handleToggleBeatMode}
              structures={structures}
              selectedStructureId={selectedStructureId}
              onStructureChange={onStructureChange}
            />
          )}
        </Panel>
      </PanelGroup>
    </div>
  );
};

export default ScriptEditor;
