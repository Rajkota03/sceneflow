
import React, { useEffect } from 'react';
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';
import { renderStyle, getElementStyles } from '@/lib/elementStyles';
import ElementTypeMenu from './editor/ElementTypeMenu';
import useElementInteraction from '@/hooks/useElementInteraction';
import { formatType } from '@/lib/formatScript';

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
  onAdditionalClick?: () => void;
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
  onBeatTag,
  onAdditionalClick,
}) => {
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
    setShowElementMenu,
    handleBlur
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
  
  // Make sure the component focuses properly when it becomes active
  useEffect(() => {
    if (isActive && editorRef.current) {
      // Only focus if not already focused to prevent cursor jumps
      if (document.activeElement !== editorRef.current) {
        // Use setTimeout to ensure DOM is ready before focusing
        setTimeout(() => {
          if (editorRef.current) {
            editorRef.current.focus();
            
            // Move cursor to end of text
            const selection = window.getSelection();
            const range = document.createRange();
            
            if (selection && editorRef.current.childNodes.length > 0) {
              const textNode = editorRef.current.childNodes[0];
              range.setStart(textNode, text.length);
              range.setEnd(textNode, text.length);
              selection.removeAllRanges();
              selection.addRange(range);
            }
          }
        }, 0);
      }
    }
  }, [isActive, text]);

  const handleElementClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Stop propagation to prevent parent handlers
    
    // Always focus first on click
    if (!isActive) {
      onFocus();
    }
    
    // Only handle double-click actions if element is already active
    if (
      isActive &&
      onAdditionalClick && 
      element.type === 'scene-heading' && 
      beatMode === 'on' && 
      e.detail === 2 // Check if it's a double-click
    ) {
      onAdditionalClick();
    }
  };

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
      onClick={handleElementClick}
      data-element-id={element.id}
      data-element-type={element.type}
      style={{ pointerEvents: 'all' }}
    >
      <div className="absolute -left-16 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowElementMenu(!showElementMenu);
              }}
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
          ${element.type === 'scene-heading' && beatMode === 'on' ? 'cursor-pointer' : ''}
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={(e) => {
          e.stopPropagation();
          if (!isActive) {
            onFocus();
          }
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        dangerouslySetInnerHTML={{ __html: text }}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          caretColor: 'black', // Explicitly set caret color
          cursor: 'text', // Explicitly set cursor style
          pointerEvents: 'all', // Changed from 'auto' to 'all'
          ...elementStyles
        }}
      />
      
      {isActive && (
        <>
          {suggestionsVisible && (
            <CharacterSuggestions 
              suggestions={filteredSuggestions} 
              onSelect={handleSelectCharacter} 
              focusIndex={focusIndex}
            />
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
