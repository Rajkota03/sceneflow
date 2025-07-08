import { useEffect } from 'react';
import { Editor } from '@tiptap/react';

export function useKeyboardShortcuts(editor: Editor | null) {
  useEffect(() => {
    if (!editor) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      try {
        const { selection } = editor.state;
        if (!selection) return;
        
        const node = editor.state.doc.nodeAt(selection.from);
        const currentType = node?.attrs?.elementType || 'action';

        // Tab cycling
        if (event.key === 'Tab') {
          event.preventDefault();
          const types = ['sceneHeading', 'action', 'character', 'parenthetical', 'dialogue', 'transition'];
          const currentIndex = types.indexOf(currentType);
          const nextIndex = event.shiftKey 
            ? (currentIndex - 1 + types.length) % types.length
            : (currentIndex + 1) % types.length;
          
          try {
            editor.commands.setNode(types[nextIndex]);
          } catch (error) {
            console.warn('Tab shortcut error:', error);
          }
          return;
        }

        // Enter progression
        if (event.key === 'Enter' && !event.shiftKey) {
          setTimeout(() => {
            try {
              const nextType = {
                sceneHeading: 'action',
                action: 'action',
                character: 'dialogue',
                parenthetical: 'dialogue',
                dialogue: 'action',
                transition: 'sceneHeading',
              }[currentType] || 'action';

              editor.commands.setNode(nextType);
            } catch (error) {
              console.warn('Enter progression error:', error);
            }
          }, 10);
          return;
        }

        // Direct shortcuts (Cmd/Ctrl + 1-6)
        if ((event.metaKey || event.ctrlKey) && !event.shiftKey) {
          const shortcuts = {
            '1': 'sceneHeading',
            '2': 'action',
            '3': 'character',
            '4': 'parenthetical',
            '5': 'dialogue',
            '6': 'transition',
          };

          if (shortcuts[event.key]) {
            event.preventDefault();
            try {
              editor.commands.setNode(shortcuts[event.key]);
            } catch (error) {
              console.warn('Direct shortcut error:', error);
            }
            return;
          }
        }
      } catch (error) {
        console.warn('Keyboard shortcut error:', error);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [editor]);
}