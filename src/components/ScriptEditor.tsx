
import { useEffect } from 'react';
import { ScriptContent, ScriptElement } from '../lib/types';
import EditorElement from './EditorElement';
import EditorKeyboardHandler from './EditorKeyboardHandler';
import useScriptElements from '../hooks/useScriptElements';
import { generateUniqueId } from '../lib/formatScript';
import FormatStyler from './FormatStyler';

interface ScriptEditorProps {
  initialContent: ScriptContent;
  onChange: (content: ScriptContent) => void;
}

const ScriptEditor = ({ initialContent, onChange }: ScriptEditorProps) => {
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
    if (elements.length === 0) {
      const defaultElements: ScriptElement[] = [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. SOMEWHERE - DAY'
        }
      ];
      setElements(defaultElements);
      setActiveElementId(defaultElements[0].id);
    }
  }, [elements.length, setElements, setActiveElementId]);

  return (
    <div className="flex justify-center w-full">
      <FormatStyler>
        <div className="script-page">
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
