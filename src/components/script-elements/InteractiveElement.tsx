import React from 'react';
import { ElementType } from '@/lib/types';
import { useScriptElement, ScriptElementData } from '@/hooks/useScriptElement';
import { getElementStyles } from '@/lib/elementStyles';

interface InteractiveElementProps {
  element: ScriptElementData;
  onUpdate: (id: string, text: string, type: ElementType) => void;
  onNavigate: (direction: 'up' | 'down', currentId: string) => void;
  onEnter: (currentId: string, createAfter: boolean) => void;
  onDelete: (id: string) => void;
  isActive: boolean;
  showTypeIndicator?: boolean;
}

const InteractiveElement: React.FC<InteractiveElementProps> = ({
  element,
  onUpdate,
  onNavigate,
  onEnter,
  onDelete,
  isActive,
  showTypeIndicator = false
}) => {
  const {
    elementRef,
    localText,
    handleInput,
    handleKeyDown
  } = useScriptElement({
    element,
    onUpdate,
    onNavigate,
    onEnter,
    onDelete,
    isActive
  });

  const elementStyles = getElementStyles(element.type);
  
  // Get display name for element type
  const getTypeDisplay = (type: ElementType) => {
    switch (type) {
      case 'scene-heading': return 'SCENE';
      case 'character': return 'CHAR';
      case 'dialogue': return 'DIAL';
      case 'parenthetical': return 'PAREN';
      case 'transition': return 'TRANS';
      case 'action': return 'ACTION';
      default: return 'TEXT';
    }
  };

  return (
    <div 
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group cursor-text`}
      id={element.id}
      onClick={() => {
        // Click-to-focus functionality
        if (elementRef.current && !isActive) {
          elementRef.current.focus();
        }
      }}
    >
      {/* Type indicator */}
      {showTypeIndicator && isActive && (
        <div className="absolute -left-16 top-0 text-xs text-muted-foreground bg-muted px-1 py-0.5 rounded opacity-0 group-hover:opacity-100 transition-opacity">
          {getTypeDisplay(element.type)}
        </div>
      )}
      
      <div
        ref={elementRef}
        className={`
          element-text 
          ${element.type}
          ${isActive ? 'active-element ring-2 ring-primary/20' : ''}
          outline-none border-none resize-none cursor-text
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onInput={handleInput}
        onKeyDown={handleKeyDown}
        style={{
          whiteSpace: 'pre-wrap',
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          textAlign: 'left',
          fontFamily: '"Courier Final Draft", "Courier Prime", "Courier New", monospace',
          fontSize: '12pt',
          lineHeight: '1.2',
          caretColor: 'hsl(var(--primary))',
          minHeight: '1.2em',
          pointerEvents: 'auto',
          ...elementStyles
        }}
        dir="ltr"
        tabIndex={0}
      >
        {localText || (isActive ? '' : '\u00A0')}
      </div>
    </div>
  );
};

export default InteractiveElement;