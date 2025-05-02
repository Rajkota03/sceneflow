
import React, { useEffect, memo } from 'react'; // Import memo
import { ElementType, ScriptElement, Structure } from '@/lib/types';
import CharacterSuggestions from './CharacterSuggestions';
import SceneTags from './SceneTags';
import { BeatMode } from '@/types/scriptTypes';
import { renderStyle, getElementStyles } from '@/lib/elementStyles';
import ElementTypeMenu from './editor/ElementTypeMenu';
import useElementInteraction from '@/hooks/useElementInteraction';
import { formatType } from '@/lib/formatScript';
import { useScriptEditor } from './script-editor/ScriptEditorProvider';

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

// Wrap the component with React.memo for performance optimization
const EditorElement: React.FC<EditorElementProps> = memo(({ 
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
  const { handleBeatTag: contextHandleBeatTag, selectedStructure: contextStructure, showKeyboardShortcuts } = useScriptEditor();
  
  const structure = selectedStructure || contextStructure;
  
  const handleBeatTagging = onBeatTag || contextHandleBeatTag;
  
  // Use the custom hook for interaction logic
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
    text: element.text, // Pass element.text directly
    type: element.type,
    onChange,
    onNavigate,
    onEnterKey,
    onFormatChange,
    isActive,
    characterNames
  });

  const elementStyles = getElementStyles(element.type);
  
  const showBeatTags = element.type === 'scene-heading' && beatMode === 'on';

  // Effect to handle focus and cursor position when element becomes active
  // This might need refinement based on useElementInteraction's handling
  useEffect(() => {
    if (isActive && editorRef.current) {
      // Focus is handled within useElementInteraction now
      // editorRef.current.focus(); 
      // Cursor positioning is also handled within useElementInteraction
    }
  }, [isActive, editorRef]); // Simplified dependency

  // Adjust spacing based on context (previous element type)
  const getContextualSpacing = (): React.CSSProperties => {
    const baseStyles = { ...elementStyles };
    
    // Apply conditional spacing based on the previous element type
    if (element.type === 'action' && previousElementType === 'scene-heading') {
      return { ...baseStyles, marginTop: '0.5em' }; // Reduced space after scene heading
    }
    if (element.type === 'dialogue' && previousElementType === 'character') {
      return { ...baseStyles, marginTop: 0 }; // No space between character and dialogue
    }
    if (element.type === 'dialogue' && previousElementType === 'parenthetical') {
      return { ...baseStyles, marginTop: 0 }; // No space between parenthetical and dialogue
    }
    if (element.type === 'character' && previousElementType === 'dialogue') {
      return { ...baseStyles, marginTop: '0.8em' }; // Space between dialogue and next character
    }
    // Add more rules as needed
    
    return baseStyles;
  };

  const contextStyles = getContextualSpacing();

  console.log(`Rendering EditorElement: ${element.id}, Active: ${isActive}`); // Debug log

  return (
    <div 
      id={element.id} // Add ID to the container for easier selection/scrolling
      className={`element-container ${element.type} ${isActive ? 'active' : ''} relative group`} 
      onContextMenu={handleRightClick}
    >
      {/* Element Type Indicator (Optional) */}
      {/* <div className="absolute -left-16 top-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
        {isActive && (
          <div className="flex items-center gap-1 text-xs text-gray-500">
            <button
              onClick={() => setShowElementMenu(!showElementMenu)}
              className="px-1.5 py-0.5 text-blue-600 hover:bg-gray-100 rounded"
            >
              {formatType(element.type)}
            </button>
          </div>
        )}
      </div> */}
      
      {/* Content Editable Div */}
      <div
        ref={editorRef}
        className={`
          element-text 
          ${renderStyle(element.type, previousElementType)} /* Use renderStyle for Tailwind classes */
          ${isActive ? 'active-element' : ''}
          ${element.type}
        `}
        contentEditable={true}
        suppressContentEditableWarning={true}
        onFocus={onFocus} // Propagate focus event up
        // onBlur={() => setSuggestionsVisible(false)} // Handled in useElementInteraction?
        onKeyDown={handleKeyDown} // Handle key events
        onInput={handleChange} // Handle input changes
        style={{
          outline: 'none',
          whiteSpace: 'pre-wrap', // Allow wrapping and preserve whitespace/newlines
          wordBreak: 'break-word',
          direction: 'ltr',
          unicodeBidi: 'plaintext',
          fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
          caretColor: 'black',
          lineHeight: '1.2', // Standard screenplay line height
          ...contextStyles // Apply dynamic styles (margins, etc.)
        }}
        dir="ltr"
        tabIndex={0} // Make it focusable
        // Use dangerouslySetInnerHTML only if absolutely necessary and text is sanitized
        // For contentEditable, managing innerText/textContent is usually preferred
        // dangerouslySetInnerHTML={{ __html: text }} 
      >
        {/* Render initial text. Subsequent updates are handled by contentEditable and state */}
        {/* We rely on useElementInteraction to set initial innerText */}
      </div>
      
      {/* Suggestions, Tags, Menus (only when active) */}
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
              <SceneTags 
                element={element} 
                onTagsChange={onTagsChange} 
                projectId={projectId}
                selectedStructure={structure}
                onBeatTag={handleBeatTagging}
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
}); // End of memo wrap

export default EditorElement;

