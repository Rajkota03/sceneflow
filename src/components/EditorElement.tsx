
import React, { useEffect, useRef } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';
import { renderStyle, getElementStyles } from '@/lib/elementStyles';
import ElementTypeMenu from './editor/ElementTypeMenu';
import useElementInteraction from '@/hooks/useElementInteraction';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './script-editor/ScriptEditorProvider';
import BeatTagButton from './script/beat-tags/BeatTagButton';

interface EditorElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}

const EditorElement: React.FC<EditorElementProps> = ({ 
  element, 
  previousElementType, 
  onChange, 
  onFocus, 
  isActive, 
  onNavigate, 
  onEnterKey, 
  onFormatChange, 
  onTagsChange,
  characterNames,
  projectId,
  beatMode = 'on',
  selectedStructure,
  onBeatTag
}) => {
  // Access global context for beat tagging and structure
  const { handleBeatTag: contextHandleBeatTag, selectedStructure: contextStructure, showKeyboardShortcuts } = useScriptEditor();
  
  // Use the structure from props or context
  const structure = selectedStructure || contextStructure;
  
  // Use onBeatTag from props or context
  const handleBeatTagging = onBeatTag || contextHandleBeatTag;
  
  const {
    text,
    editorRef,
    suggestionsVisible,
    filteredSuggestions,
    focusIndex,
    showElementMenu,
    handleChange,
    handleKeyDown,
    handleSelectCharacter,
    handleRightClick,
    handleElementTypeChange,
    setShowElementMenu
  } = useElementInteraction({
    elementId: element.id,
    text: element.text,
    type: element.type,
    onChange,
    onNavigate,
    onEnterKey,
    onFormatChange,
    isActive,
    characterNames
  });

  const elementStyles = getElementStyles(element.type);
  
  // Only show beat tagging controls for scene headings
  const showBeatTags = element.type === 'scene-heading' && beatMode === 'on';

  // If this element is active, force focus to the editor element
  useEffect(() => {
    if (isActive && editorRef.current) {
      // Set a timeout to ensure the focus happens after rendering
      setTimeout(() => {
        if (editorRef.current) {
          editorRef.current.focus();
          
          // Position cursor at the end
          const range = document.createRange();
          const selection = window.getSelection();
          
          if (editorRef.current.childNodes.length > 0) {
            const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
            range.setStartAfter(lastNode);
            range.collapse(true);
          } else {
            range.setStart(editorRef.current, 0);
            range.collapse(true);
          }
          
          if (selection) {
            selection.removeAllRanges();
            selection.addRange(range);
          }
        }
      }, 0);
    }
  }, [isActive]);

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
    >
      <div className="absolute -left-16 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && showKeyboardShortcuts && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <button
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="px-1.5 py-0.5 text-blue-600 hover:bg-gray-100 rounded"
            >
              {formatType(element.type)}
            </button>
          </div>
        )}
      </div>
      
      <div
        ref={editorRef}
        className={`
          element-text 
          ${renderStyle(element.type, previousElementType)}
          ${isActive ? 'active-element' : ''}
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={onFocus}
        onBlur={() => suggestionsVisible}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          pointerEvents: 'auto', // Ensure the element can receive pointer events
          minHeight: '1.2em', // Ensure empty elements have height
          ...elementStyles
        }}
        dir="ltr"
        data-element-type={element.type}
      >
        {text}
      </div>
      
      {isActive && (
        <>
          {suggestionsVisible && (
            <CharacterSuggestions 
              suggestions={filteredSuggestions} 
              onSelect={handleSelectCharacter} 
              focusIndex={focusIndex}
            />
          )}
          
          {showBeatTags && (
            <div className="absolute right-0 top-0">
              <BeatTagButton
                elementId={element.id}
                beatId={element.beat}
              />
            </div>
          )}
          
          {showElementMenu && (
            <ElementTypeMenu 
              currentType={element.type} 
              onElementTypeChange={handleElementTypeChange} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default EditorElement;
