
import { useEffect, useState, useCallback } from 'react';
import { toast } from '@/components/ui/use-toast';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';

interface UseKeyboardShortcutsProps {
  onSave?: () => void;       // Callback for Ctrl+S
  onExport?: () => void;      // Callback for Ctrl+E
  onUndo?: () => void;       // Placeholder callback for Ctrl+Z
  onRedo?: () => void;       // Placeholder callback for Ctrl+Y / Ctrl+Shift+Z
}

export function useKeyboardShortcuts({
  onSave,
  onExport,
  onUndo,
  onRedo
}: UseKeyboardShortcutsProps = {}) {

  // State for showing the help modal, managed within the hook
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  const toggleKeyboardShortcuts = useCallback(() => {
    setShowKeyboardShortcuts(prev => !prev);
  }, []);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts if focus is on input/textarea, except for Save
      const target = e.target as HTMLElement;
      const isEditable = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if (e.ctrlKey || e.metaKey) {
        let shortcutHandled = false;
        switch (e.key.toLowerCase()) {
          case 's': // Save
            // Allow save even if editable element is focused
            e.preventDefault();
            if (onSave) {
              console.log("Ctrl+S pressed, saving...");
              onSave();
            }
            shortcutHandled = true;
            break;

          case 'e': // Export PDF
            if (!isEditable) { // Prevent export shortcut if editing text
              e.preventDefault();
              if (onExport) {
                console.log("Ctrl+E pressed, exporting PDF...");
                onExport();
              }
              shortcutHandled = true;
            }
            break;

          case '/': // Toggle Help
            if (!isEditable) { // Prevent help shortcut if editing text
              e.preventDefault();
              console.log("Ctrl+/ pressed, toggling help...");
              toggleKeyboardShortcuts();
              shortcutHandled = true;
            }
            break;

          case 'z': // Undo / Redo
            if (!isEditable) { // Prevent undo/redo if editing text
                if (e.shiftKey) {
                    // Redo (Cmd/Ctrl + Shift + Z)
                    e.preventDefault();
                    if (onRedo) {
                        console.log("Ctrl+Shift+Z pressed, redoing...");
                        onRedo();
                    } else {
                        console.log("Redo action not implemented.");
                        // Optionally show a toast message
                        // toast({ title: "Redo", description: "Redo functionality not yet implemented." });
                    }
                    shortcutHandled = true;
                } else {
                    // Undo (Cmd/Ctrl + Z)
                    e.preventDefault();
                    if (onUndo) {
                        console.log("Ctrl+Z pressed, undoing...");
                        onUndo();
                    } else {
                        console.log("Undo action not implemented.");
                        // Optionally show a toast message
                        // toast({ title: "Undo", description: "Undo functionality not yet implemented." });
                    }
                    shortcutHandled = true;
                }
            }
            break;

          case 'y': // Redo (Windows/Linux - Ctrl+Y)
            // Check if it's not macOS (where Cmd+Y might do something else)
            if (!navigator.platform.toUpperCase().includes('MAC') && !isEditable) {
                e.preventDefault();
                if (onRedo) {
                    console.log("Ctrl+Y pressed, redoing...");
                    onRedo();
                } else {
                    console.log("Redo action not implemented.");
                    // toast({ title: "Redo", description: "Redo functionality not yet implemented." });
                }
                shortcutHandled = true;
            }
            break;
        }
        // if (shortcutHandled) return; // Potentially stop further processing if needed
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => {
      window.removeEventListener('keydown', handleGlobalKeyDown);
    };
  // Add dependencies for the callbacks
  }, [onSave, onExport, onUndo, onRedo, toggleKeyboardShortcuts]);

  // Return state and control function for the help modal
  return {
    showKeyboardShortcuts,
    setShowKeyboardShortcuts, // Allow external control if needed
    toggleKeyboardShortcuts
  };
}

export default useKeyboardShortcuts;

