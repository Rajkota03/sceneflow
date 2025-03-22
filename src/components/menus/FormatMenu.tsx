
import React from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useFormat } from '@/lib/formatContext';
import { Pilcrow, Save, FileText } from 'lucide-react';
import { useScriptEditor } from '@/components/script-editor/ScriptEditorProvider';
import { toast } from 'sonner';
import { generatePDF } from '@/lib/pdfExport';

const FormatMenu = () => {
  const { formatState, setLineSpacing } = useFormat();
  const { elements, scriptContentRef } = useScriptEditor();

  const handleLineSpacingChange = (spacing: 'single' | '1.5' | 'double') => {
    if (setLineSpacing) {
      setLineSpacing(spacing);
    }
  };

  const handleExportToPDF = async () => {
    if (!elements || elements.length === 0) {
      toast.error("No content to export");
      return;
    }

    try {
      toast.info("Preparing PDF...");
      // Generate script PDF with Final Draft standard formatting
      const pdf = await generatePDF({ 
        elements,
        // Removing the useStandardMargins property that caused the build error
      });
      
      // Create a download link
      const url = URL.createObjectURL(pdf);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'screenplay.pdf';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.success("PDF exported successfully");
    } catch (error) {
      console.error("PDF export error:", error);
      toast.error("Failed to export PDF");
    }
  };

  // Keyboard shortcut for export
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + P shortcut for PDF export
      if ((e.ctrlKey || e.metaKey) && e.key === 'p') {
        e.preventDefault();
        handleExportToPDF();
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [elements]);

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="h-8 w-8 p-0">
          <Pilcrow className="h-4 w-4" />
          <span className="sr-only">Format options</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => handleLineSpacingChange('single')}
          className={formatState.lineSpacing === 'single' ? 'bg-accent' : ''}
        >
          <span className="text-xs mr-2">1.0</span>
          Single Line Spacing
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLineSpacingChange('1.5')}
          className={formatState.lineSpacing === '1.5' ? 'bg-accent' : ''}
        >
          <span className="text-xs mr-2">1.5</span>
          1.5 Line Spacing
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => handleLineSpacingChange('double')}
          className={formatState.lineSpacing === 'double' ? 'bg-accent' : ''}
        >
          <span className="text-xs mr-2">2.0</span>
          Double Line Spacing
        </DropdownMenuItem>
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem onClick={handleExportToPDF}>
          <Save className="h-4 w-4 mr-2" />
          Export to PDF
        </DropdownMenuItem>
        
        <DropdownMenuItem 
          className="text-xs text-muted-foreground"
        >
          <FileText className="h-4 w-4 mr-2" />
          Shortcut: Ctrl+P
        </DropdownMenuItem>
        
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default FormatMenu;
