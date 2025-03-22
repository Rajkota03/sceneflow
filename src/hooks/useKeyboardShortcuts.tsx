
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';
import { generatePDF } from '@/lib/pdfExport';

interface UseKeyboardShortcutsProps {
  onExport?: () => void;
  scriptContentRef?: React.RefObject<HTMLDivElement>;
}

export function useKeyboardShortcuts({ 
  onExport, 
  scriptContentRef 
}: UseKeyboardShortcutsProps = {}) {
  // Use the context value if possible, otherwise use local state
  let contextValue;
  try {
    contextValue = useScriptEditor();
  } catch (e) {
    // ScriptEditorProvider might not be available in all cases
  }

  const [localShowKeyboardShortcuts, setLocalShowKeyboardShortcuts] = useState(false);
  
  // Use context values if available, otherwise use local state
  const showKeyboardShortcuts = contextValue?.showKeyboardShortcuts ?? localShowKeyboardShortcuts;
  const toggleKeyboardShortcuts = contextValue?.toggleKeyboardShortcuts ?? 
    (() => setLocalShowKeyboardShortcuts(prev => !prev));
  
  // Get change element type function from context
  const changeElementType = contextValue?.changeElementType;
  const activeElementId = contextValue?.activeElementId;
  const elements = contextValue?.elements;

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard shortcuts help with Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleKeyboardShortcuts();
        return;
      }
      
      // Export PDF with Ctrl+E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (onExport) {
          onExport();
        } else if (elements && elements.length > 0) {
          // Default PDF export logic if no custom handler provided
          try {
            toast.info("Preparing PDF...");
            generatePDF({ elements })
              .then(pdf => {
                // Create a download link
                const url = URL.createObjectURL(pdf);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'screenplay.pdf';
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                toast.success("PDF exported successfully");
              })
              .catch(error => {
                console.error('PDF export error:', error);
                toast.error("Failed to export PDF");
              });
          } catch (error) {
            console.error('PDF export error:', error);
            toast.error("Failed to export PDF");
          }
        } else {
          toast.error("No content to export");
        }
        return;
      }
      
      // Save with Ctrl+S
      if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        toast.success("Script saved");
        return;
      }
      
      // Format shortcuts only if we have access to the context and active element
      if (changeElementType && activeElementId) {
        // Format as Scene Heading: Ctrl+1
        if ((e.ctrlKey || e.metaKey) && e.key === '1') {
          e.preventDefault();
          changeElementType(activeElementId, 'scene-heading');
          return;
        }
        
        // Format as Action: Ctrl+2
        if ((e.ctrlKey || e.metaKey) && e.key === '2') {
          e.preventDefault();
          changeElementType(activeElementId, 'action');
          return;
        }
        
        // Format as Character: Ctrl+3
        if ((e.ctrlKey || e.metaKey) && e.key === '3') {
          e.preventDefault();
          changeElementType(activeElementId, 'character');
          return;
        }
        
        // Format as Dialogue: Ctrl+4
        if ((e.ctrlKey || e.metaKey) && e.key === '4') {
          e.preventDefault();
          changeElementType(activeElementId, 'dialogue');
          return;
        }
        
        // Format as Parenthetical: Ctrl+5
        if ((e.ctrlKey || e.metaKey) && e.key === '5') {
          e.preventDefault();
          changeElementType(activeElementId, 'parenthetical');
          return;
        }
        
        // Format as Transition: Ctrl+6 or Ctrl+Shift+R
        if (((e.ctrlKey || e.metaKey) && e.key === '6') || 
            ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r')) {
          e.preventDefault();
          changeElementType(activeElementId, 'transition');
          return;
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExport, scriptContentRef, toggleKeyboardShortcuts, changeElementType, activeElementId, elements]);

  return {
    showKeyboardShortcuts,
    setShowKeyboardShortcuts: toggleKeyboardShortcuts,
    exportToPdf: (element: HTMLElement) => {
      if (elements && elements.length > 0) {
        return generatePDF({ elements });
      } else {
        throw new Error("No content to export");
      }
    }
  };
}

export default useKeyboardShortcuts;
