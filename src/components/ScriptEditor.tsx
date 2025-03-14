
import { ScriptContent } from '../lib/types';
import EditorElement from './EditorElement';
import EditorKeyboardHandler from './EditorKeyboardHandler';
import useScriptElements from '../hooks/useScriptElements';
import { processCharacterName } from '../lib/characterUtils';
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
    changeElementType
  } = useScriptElements(initialContent, onChange);

  return (
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
  );
};

export default ScriptEditor;
