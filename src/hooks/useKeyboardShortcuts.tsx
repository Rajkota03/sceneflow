
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';

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

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard shortcuts help with Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        toggleKeyboardShortcuts();
      }
      
      // Export PDF with Cmd+E
      if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
        e.preventDefault();
        if (onExport) {
          onExport();
        } else if (scriptContentRef?.current) {
          // Default PDF export logic if no custom handler provided
          exportToPdf(scriptContentRef.current);
        }
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onExport, scriptContentRef, toggleKeyboardShortcuts]);

  const exportToPdf = async (element: HTMLElement) => {
    try {
      toast({
        title: "Exporting PDF",
        description: "Please wait while your script is being exported...",
      });

      // Apply industry-standard formatting to the element for export
      const originalClassName = element.className;
      element.classList.add('pdf-export');
      
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      // Reset the element's class
      element.className = originalClassName;
      
      const imgData = canvas.toDataURL('image/png');
      
      // Use US Letter size (8.5" x 11")
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: [8.5, 11]
      });
      
      // Calculate dimensions to maintain aspect ratio while respecting standard page size
      const imgWidth = 8.5;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
      
      // Add page numbers (except for title page)
      const pageCount = Math.ceil(imgHeight / 11);
      for (let i = 1; i < pageCount; i++) {
        pdf.setPage(i + 1);
        pdf.setFontSize(12);
        pdf.setFont('Courier', 'normal');
        pdf.text(String(i + 1), 7.5, 0.5); // Page number in top right corner
      }
      
      pdf.save('screenplay.pdf');
      
      toast({
        title: "PDF Exported",
        description: "Your script has been exported successfully.",
      });
    } catch (error) {
      console.error('PDF export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting your script to PDF.",
        variant: "destructive",
      });
    }
  };

  return {
    showKeyboardShortcuts,
    setShowKeyboardShortcuts: toggleKeyboardShortcuts,
    exportToPdf
  };
}

export default useKeyboardShortcuts;
