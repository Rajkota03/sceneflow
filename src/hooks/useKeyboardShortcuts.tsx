
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';
import { exportScriptToPDF } from '@/lib/pdfExport';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard shortcuts help with Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleKeyboardShortcuts();
        return;
      }
      
      // Export PDF with Ctrl+P
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        if (onExport) {
          onExport();
        } else if (scriptContentRef?.current) {
          // Default PDF export logic if no custom handler provided
          exportScriptToPDF(scriptContentRef.current, true, 'screenplay')
            .then(() => {
              toast({
                title: "PDF Exported",
                description: "Your script has been exported successfully.",
              });
            })
            .catch(error => {
              console.error('PDF export error:', error);
              toast({
                title: "Export Failed",
                description: "There was an error exporting your script to PDF.",
                variant: "destructive",
              });
            });
        }
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
        
        // Format as Transition: Ctrl+Shift+R
        if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key.toLowerCase() === 'r') {
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
  }, [onExport, scriptContentRef, toggleKeyboardShortcuts, changeElementType, activeElementId]);

  return {
    showKeyboardShortcuts,
    setShowKeyboardShortcuts: toggleKeyboardShortcuts,
    exportToPdf: (element: HTMLElement) => exportScriptToPDF(element, true, 'screenplay')
  };
}

export default useKeyboardShortcuts;
