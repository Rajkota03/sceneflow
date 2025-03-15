
import { useEffect } from 'react';
import { ScriptContent, ScriptElement, Note } from '../lib/types';
import EditorElement from './EditorElement';
import EditorKeyboardHandler from './EditorKeyboardHandler';
import useScriptElements from '../hooks/useScriptElements';
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';
import { useFormat } from '@/lib/formatContext';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
  notes?: Note[];
  onNoteCreate?: (note: Note) => void;
}

const ScriptEditor = ({ initialContent, onChange, notes, onNoteCreate }: ScriptEditorProps) => {
  const { formatState } = useFormat();
  const {
    elements,
    activeElementId,
    setActiveElementId,
    handleElementChange,
    getPreviousElementType,
    addNewElement,
    changeElementType,
    setElements
  } = useScriptElements(initialContent, onChange);

  // Ensure there's always at least one element to edit
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
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements, setElements, setActiveElementId]);

  // Fallback rendering for when elements are not yet available
  if (!elements || elements.length === 0) {
    return (
      <div className="flex justify-center w-full h-full">
        <FormatStyler>
          <div className="script-page">
            <div className="flex items-center justify-center py-12">
              <p className="text-lg text-slate-500">Loading editor...</p>
            </div>
          </div>
        </FormatStyler>
      </div>
    );
  }

  return (
    <div className="flex justify-center w-full h-full">
      <FormatStyler>
        <div className="script-page" style={{ 
          transform: `scale(${formatState.zoomLevel})`,
          transformOrigin: 'top center',
          transition: 'transform 0.2s ease-out'
        }}>
          {elements.map((element, index) => (
            <EditorKeyboardHandler
              key={element.id}
              id={element.id}
              type={element.type}
              onAddNewElement={addNewElement}
              onChangeElementType={changeElementType}
            >
              <EditorElement
                element={element}
                previousElementType={getPreviousElementType(index)}
                onChange={handleElementChange}
                onKeyDown={(e) => {/* This gets handled by the EditorKeyboardHandler */}}
                isActive={activeElementId === element.id}
                onFocus={() => setActiveElementId(element.id)}
              />
            </EditorKeyboardHandler>
          ))}
        </div>
      </FormatStyler>
    </div>
  );
};

export default ScriptEditor;
