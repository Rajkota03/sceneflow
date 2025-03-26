
import React from 'react';
import { ElementType, ScriptElement } from '@/lib/types';
import { useDialogueElement } from '@/hooks/elements/useDialogueElement';
import ElementTypeMenu from '@/components/editor/ElementTypeMenu';
import { getElementStyles } from '@/lib/elementStyles';

interface DialogueElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  showKeyboardShortcuts?: boolean;
}

const DialogueElement: React.FC<DialogueElementProps> = ({
  element,
  previousElementType,
  onChange,
  onFocus,
  isActive,
  onNavigate,
  onEnterKey,
  onFormatChange,
  showKeyboardShortcuts = false
}) => {
  const {
    text,
    editorRef,
    showElementMenu,
    handleChange,
    handleKeyDown,
    handleRightClick,
    handleElementTypeChange,
    setShowElementMenu
  } = useDialogueElement({
    element,
    onChange,
    onNavigate,
    onEnterKey,
    onFormatChange,
    isActive
  });

  const elementStyles = getElementStyles(element.type);

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
      id={element.id}
    >
      <div className="absolute -left-16 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && showKeyboardShortcuts && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <button
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="px-1.5 py-0.5 text-blue-600 hover:bg-gray-100 rounded"
            >
              Dialogue
            </button>
          </div>
        )}
      </div>
      
      <div
        ref={editorRef}
        className={`
          element-text 
          dialogue
          ${isActive ? 'active-element' : ''}
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={onFocus}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          caretColor: 'black',
          lineHeight: '1.2', // Reduced line height to match Final Draft
          marginBottom: '0.8em', // Adjusted spacing after dialogue
          ...elementStyles
        }}
        dir="ltr"
        tabIndex={0}
      >
        {text}
      </div>
      
      {isActive && showElementMenu && (
        <ElementTypeMenu 
          currentType={element.type} 
          onElementTypeChange={handleElementTypeChange} 
        />
      )}
    </div>
  );
};

export default DialogueElement;
