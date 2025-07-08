
import { useState, useRef, useEffect } from 'react';
import { ElementType } from '@/lib/types';
import { detectCharacter } from '@/lib/characterUtils';
import { formatTextForElementType } from '@/lib/textFormatUtils';

interface UseElementInteractionProps {
  elementId: string;
  text: string;
  type: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  isActive: boolean;
  characterNames: string[];
}

export function useElementInteraction({
  elementId,
  text: initialText,
  type,
  onChange,
  onNavigate,
  onEnterKey,
  onFormatChange,
  isActive,
  characterNames
}: UseElementInteractionProps) {
  const [text, setText] = useState(initialText);
  const [suggestionsVisible, setSuggestionsVisible] = useState(false);
  const [filteredSuggestions, setFilteredSuggestions] = useState<string[]>([]);
  const [focusIndex, setFocusIndex] = useState(0);
  const [showElementMenu, setShowElementMenu] = useState(false);
  const editorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Update local text state only if the initialText prop changes
    if (initialText !== text) {
      setText(initialText);
      if (editorRef.current && !isActive) {
        editorRef.current.innerText = initialText;
      }
    }
  }, [initialText]);

  useEffect(() => {
    // Focus and set cursor position only when the element becomes active
    if (editorRef.current && isActive) {
      if (editorRef.current.innerText !== text) {
        editorRef.current.innerText = text;
      }
      const range = document.createRange();
      const sel = window.getSelection();
      try {
        if (editorRef.current.childNodes.length > 0) {
          const lastNode = editorRef.current.childNodes[editorRef.current.childNodes.length - 1];
          if (lastNode.nodeType === Node.TEXT_NODE) {
            range.setStart(lastNode, lastNode.nodeValue?.length ?? 0);
          } else {
             range.setStart(editorRef.current, editorRef.current.childNodes.length);
          }
        } else {
          range.setStart(editorRef.current, 0);
        }
        range.collapse(true);
        if (sel) {
          sel.removeAllRanges();
          sel.addRange(range);
        }
        editorRef.current.focus();
      } catch (err) {
        console.error('Error setting cursor position:', err);
      }
    }
  }, [isActive, text]);

  const handleChange = (e: React.FormEvent<HTMLDivElement>) => {
    const newText = e.currentTarget.innerText;
    setText(newText);
    onChange(elementId, newText, type);

    if (type === 'character') {
      const detected = detectCharacter(newText, characterNames);
      setSuggestionsVisible(detected);
      if (detected) {
        const searchText = newText.toLowerCase();
        const newSuggestions = characterNames.filter(name =>
          name.toLowerCase().startsWith(searchText) && name !== newText
        );
        setFilteredSuggestions(newSuggestions);
        setFocusIndex(0);
      } else {
         setSuggestionsVisible(false);
      }
    } else {
      setSuggestionsVisible(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Backspace' && text.trim() === '') {
      e.preventDefault();
      // TODO: Implement element deletion logic here or in parent
      // For now, just navigate up
      onNavigate('up', elementId);
      return;
    }

    // --- Keyboard Shortcuts for Element Type Change ---
    if (e.metaKey || e.ctrlKey) {
      let newType: ElementType | null = null;
      let preventDefault = true;

      switch (e.key) {
        case '1': newType = 'scene-heading'; break;
        case '2': newType = 'action'; break;
        case '3': newType = 'character'; break;
        case '4': newType = 'dialogue'; break;
        case '5': newType = 'parenthetical'; break;
        case '6': newType = 'transition'; break;
        default:
          preventDefault = false; // Don't prevent default for other Ctrl/Cmd keys
      }

      // Handle Ctrl/Cmd + Shift + R for Transition
      if (e.shiftKey && e.key.toUpperCase() === 'R') {
        newType = 'transition';
        preventDefault = true;
      }

      if (newType && preventDefault) {
        e.preventDefault();
        if (type !== newType) {
          const formattedText = formatTextForElementType(text, newType);
          onFormatChange(elementId, newType);
          if (formattedText !== text) {
            setText(formattedText);
            onChange(elementId, formattedText, newType);
            if(editorRef.current) {
              editorRef.current.innerText = formattedText;
            }
          }
          if (newType === 'transition' && formattedText.trim() === '') {
            const defaultTransition = 'CUT TO:';
            setText(defaultTransition);
            onChange(elementId, defaultTransition, newType);
            if(editorRef.current) {
              editorRef.current.innerText = defaultTransition;
            }
          }
        }
        return; // Shortcut handled
      }
    }

    // --- Other Key Handlers --- 
    if (e.key === 'Enter') {
      e.preventDefault();
      onEnterKey(elementId, e.shiftKey); // Handle Enter and Shift+Enter
    } else if (e.key === 'ArrowUp') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.max(0, prevIndex - 1));
      } else {
        onNavigate('up', elementId);
      }
    } else if (e.key === 'ArrowDown') {
      if (suggestionsVisible && filteredSuggestions.length > 0) {
        e.preventDefault();
        setFocusIndex(prevIndex => Math.min(filteredSuggestions.length - 1, prevIndex + 1));
      } else {
        onNavigate('down', elementId);
      }
    } else if (suggestionsVisible && filteredSuggestions.length > 0 && (e.key === 'Tab' || e.key === 'Enter')) {
      if (filteredSuggestions[focusIndex]) {
         e.preventDefault();
         handleSelectCharacter(filteredSuggestions[focusIndex]);
      }
    } else if (e.key === 'Tab') {
      e.preventDefault();
      if (type === 'dialogue') {
        // Dialogue -> Parenthetical
        onFormatChange(elementId, 'parenthetical');
        if (!text.startsWith('(') || !text.endsWith(')')) {
          const newText = `(${text.trim()})`;
          setText(newText);
          onChange(elementId, newText, 'parenthetical');
           if(editorRef.current) {
              editorRef.current.innerText = newText;
            }
        }
      } else if (type === 'parenthetical') {
         // Parenthetical -> Dialogue
         onFormatChange(elementId, 'dialogue');
         // Remove parenthesis if present
         if (text.startsWith('(') && text.endsWith(')')) {
            const coreText = text.slice(1, -1);
            setText(coreText);
            onChange(elementId, coreText, 'dialogue');
            if(editorRef.current) {
               editorRef.current.innerText = coreText;
            }
         }
      } else if (type === 'character') {
         // Character -> Dialogue (handled by Enter key, Tab moves down)
         onNavigate('down', elementId);
      } else {
        // Default Tab: Move focus down
        onNavigate('down', elementId);
      }
    } else if (e.key === 'Escape') {
       if (suggestionsVisible) {
          e.preventDefault();
          setSuggestionsVisible(false);
       }
       if (showElementMenu) {
          e.preventDefault();
          setShowElementMenu(false);
       }
    }
  };

  const handleSelectCharacter = (name: string) => {
    if (editorRef.current) {
      const formattedName = formatTextForElementType(name, 'character');
      editorRef.current.innerText = formattedName;
      setText(formattedName);
      onChange(elementId, formattedName, type);
      setSuggestionsVisible(false);
      // Optionally trigger Enter to move to Dialogue after selection
      // onEnterKey(elementId, false); // This might feel more natural
    }
  };

  const handleRightClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowElementMenu(!showElementMenu);
  };

  const handleElementTypeChange = (newType: ElementType) => {
    const formattedText = formatTextForElementType(text, newType);
    onFormatChange(elementId, newType);
     if (formattedText !== text) {
        setText(formattedText);
        onChange(elementId, formattedText, newType);
        if(editorRef.current) {
           editorRef.current.innerText = formattedText;
        }
     }
    setShowElementMenu(false);
  };

  return {
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
  };
}

export default useElementInteraction;

