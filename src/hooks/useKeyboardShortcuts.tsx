
import { useEffect, useState } from 'react';
import { toast } from '@/components/ui/use-toast';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

interface UseKeyboardShortcutsProps {
  onExport?: () => void;
  scriptContentRef?: React.RefObject<HTMLDivElement>;
}

export function useKeyboardShortcuts({ 
  onExport, 
  scriptContentRef 
}: UseKeyboardShortcutsProps = {}) {
  const [showKeyboardShortcuts, setShowKeyboardShortcuts] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Toggle keyboard shortcuts help with Ctrl+/
      if ((e.ctrlKey || e.metaKey) && e.key === '/') {
        e.preventDefault();
        setShowKeyboardShortcuts(prev => !prev);
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
  }, [onExport, scriptContentRef]);

  const exportToPdf = async (element: HTMLElement) => {
    try {
      toast({
        title: "Exporting PDF",
        description: "Please wait while your script is being exported...",
      });

      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        logging: false
      });
      
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'letter'
      });
      
      // Calculate dimensions to maintain aspect ratio
      const imgWidth = pdf.internal.pageSize.getWidth();
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      
      pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
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
    setShowKeyboardShortcuts,
    exportToPdf
  };
}

export default useKeyboardShortcuts;
