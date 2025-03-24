
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

  // Force focus when element becomes active
  useEffect(() => {
    if (isActive && editorRef.current) {
      // Small timeout to ensure DOM is ready
      setTimeout(() => {
        editorRef.current?.focus();
        
        // Set cursor at the end of text
        const range = document.createRange();
        const sel = window.getSelection();
        
        if (editorRef.current) {
          try {
            if (editorRef.current.childNodes.length > 0) {
              const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
              const offset = lastNode.textContent?.length || 0;
              range.setStart(lastNode, offset);
            } else {
              range.setStart(editorRef.current, 0);
            }
            
            range.collapse(true);
            sel?.removeAllRanges();
            sel?.addRange(range);
          } catch (e) {
            console.error('Error setting cursor position:', e);
          }
        }
      }, 10);
    }
  }, [isActive]);

  const elementStyles = getElementStyles(element.type);
  
  const handleElementClick = (e: React.MouseEvent) => {
    // Ensure click propagates properly
    e.stopPropagation();
    
    // Only trigger the additional click handler if:
    // 1. We have a click handler
    // 2. It's a scene heading
    // 3. Beat mode is on
    // 4. It's already been focused (to avoid conflicting with the normal focus behavior)
    // 5. It's specifically a double-click (for more intentional tagging interaction)
    if (
      onAdditionalClick && 
      element.type === 'scene-heading' && 
      beatMode === 'on' && 
      isActive &&
      e.detail === 2 // Check if it's a double-click
    ) {
      onAdditionalClick();
    }
    
    // Ensure focus happens on single click
    if (!isActive) {
      onFocus();
    }
  };

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
      onClick={handleElementClick}
      data-element-id={element.id}
      data-element-type={element.type}
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
          onFocus();
        }}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onInput={handleChange}
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          caretColor: 'black', // Explicitly set caret color
          cursor: 'text', // Explicitly set cursor style
          pointerEvents: 'auto', // Ensure clicks are captured
          ...elementStyles
        }}
        spellCheck="false"
        autoCorrect="off"
        autoCapitalize="off"
        dir="ltr"
        tabIndex={0} // Ensure the element is focusable
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
