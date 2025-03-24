
import React, { useRef, useEffect } from 'react';
import { ElementType } from '@/lib/types';
import { getElementStyles } from '@/lib/elementStyles';
import { formatType } from '@/lib/formatScript';
import { Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import ElementTypeMenu from './ElementTypeMenu';
import CharacterSuggestions from '../CharacterSuggestions';
import useElementInteraction from '@/hooks/script-editor/useElementInteraction';

interface ScriptElementProps {
  id: string;
  text: string;
  type: ElementType;
  isActive: boolean;
  previousElementType?: ElementType;
  characterNames: string[];
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
}

const ScriptElement: React.FC<ScriptElementProps> = ({
  id,
  text: initialText,
  type,
  isActive,
  previousElementType,
  characterNames,
  onChange,
  onFocus,
  onNavigate,
  onEnterKey,
  onFormatChange,
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
    elementId: id,
    text: initialText,
    type,
    onChange,
    onNavigate,
    onEnterKey,
    onFormatChange,
    isActive,
    characterNames
  });

  // Apply styles based on element type
  const elementStyles = getElementStyles(type);
  
  // Auto-focus when the element becomes active
  useEffect(() => {
    if (isActive && editorRef.current) {
      if (document.activeElement !== editorRef.current) {
        editorRef.current.focus();
        
        // Set cursor at end of text
        const range = document.createRange();
        const selection = window.getSelection();
        
        if (editorRef.current.childNodes.length > 0) {
          const lastNode = editorRef.current.childNodes[0];
          const textLength = lastNode.textContent?.length || 0;
          range.setStart(lastNode, textLength);
          range.collapse(true);
          
          selection?.removeAllRanges();
          selection?.addRange(range);
        }
      }
    }
  }, [isActive]);

  // Generate CSS classes based on element type
  const getElementClasses = () => {
    const baseClasses = `element-text relative`;
    
    // Add type-specific classes
    switch (type) {
      case 'scene-heading':
        return `${baseClasses} font-bold uppercase tracking-wider mb-4`;
      case 'action':
        return `${baseClasses} mb-4`;
      case 'character':
        return `${baseClasses} text-center font-bold mb-1 mx-auto`;
      case 'dialogue':
        return `${baseClasses} mb-4 mx-auto`;
      case 'parenthetical':
        return `${baseClasses} text-center italic mb-1 mx-auto`;
      case 'transition':
        return `${baseClasses} text-right font-bold uppercase tracking-wider mb-4`;
      case 'note':
        return `${baseClasses} text-sm italic text-gray-500 mb-2`;
      default:
        return `${baseClasses} mb-4`;
    }
  };

  return (
    <div 
      className={`element-container ${type} ${isActive ? 'active' : ''} relative group`}
      data-element-id={id}
      data-element-type={type}
    >
      {/* Element type indicator (only visible when active) */}
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
              {formatType(type)}
            </button>
          </div>
        )}
      </div>
      
      {/* Editable text area */}
      <div
        ref={editorRef}
        className={getElementClasses()}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onClick={(e) => {
          e.stopPropagation();
          if (!isActive) {
            onFocus();
          }
        }}
        onContextMenu={handleRightClick}
        onFocus={(e) => {
          e.stopPropagation();
          if (!isActive) {
            onFocus();
          }
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
          caretColor: 'black',
          cursor: 'text',
          ...elementStyles
        }}
      >
        {text}
      </div>
      
      {/* UI elements that appear when the element is active */}
      {isActive && (
        <>
          {/* Character name suggestions */}
          {suggestionsVisible && (
            <CharacterSuggestions 
              suggestions={filteredSuggestions} 
              onSelect={handleSelectCharacter} 
              focusIndex={focusIndex}
            />
          )}
          
          {/* Element type menu */}
          {showElementMenu && (
            <ElementTypeMenu 
              currentType={type} 
              onElementTypeChange={handleElementTypeChange} 
            />
          )}
        </>
      )}
    </div>
  );
};

export default ScriptElement;
