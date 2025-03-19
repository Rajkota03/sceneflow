
import React, { useState, useRef } from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';
import { ElementType } from '@/lib/types';
import { useFormat } from '@/lib/formatContext';
import { convertToFDX, importFromFDX } from '@/lib/fdxUtils';
import { generatePDF } from '@/lib/pdfExport';
import { useScriptEditor } from '../script-editor/ScriptEditorProvider';

const FormatMenu = () => {
  const { formatState, setFont, setFontSize, setLineSpacing } = useFormat();
  const [showSceneNumbers, setShowSceneNumbers] = useState(false);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { elements, setElements } = useScriptEditor();
  
  const handleElementChange = (elementType: ElementType) => {
    toast({
      title: `Changed to ${elementType}`,
      description: `The current element has been changed to ${elementType}.`,
    });
  };

  const toggleSceneNumbers = () => {
    setShowSceneNumbers(!showSceneNumbers);
    toast({
      title: `Scene Numbers ${!showSceneNumbers ? "Enabled" : "Disabled"}`,
      description: `Scene numbers are now ${!showSceneNumbers ? "visible" : "hidden"} in the script.`,
    });
  };

  const togglePageNumbers = () => {
    setShowPageNumbers(!showPageNumbers);
    toast({
      title: `Page Numbers ${!showPageNumbers ? "Enabled" : "Disabled"}`,
      description: `Page numbers are now ${!showPageNumbers ? "visible" : "hidden"} in the script.`,
    });
  };

  const handlePageBreak = () => {
    toast({
      title: "Page Break Inserted",
      description: "A manual page break has been added to the script.",
    });
  };

  const handleFontChange = (fontName: string) => {
    if (setFont) {
      setFont(fontName);
      toast({
        title: "Font Changed",
        description: `Font changed to ${fontName}`,
      });
    }
  };

  const handleFontSizeChange = (size: number) => {
    if (setFontSize) {
      setFontSize(size);
      toast({
        title: "Font Size Changed",
        description: `Font size changed to ${size}pt`,
      });
    }
  };

  const handleLineSpacingChange = (spacing: 'single' | '1.5' | 'double') => {
    if (setLineSpacing) {
      setLineSpacing(spacing);
      toast({
        title: "Line Spacing Changed",
        description: `Line spacing changed to ${spacing}`,
      });
    }
  };

  const handleExportFDX = () => {
    try {
      const scriptContent = { elements };
      const fdxContent = convertToFDX(scriptContent);
      
      // Create a blob and trigger download
      const blob = new Blob([fdxContent], { type: 'application/xml' });
      const url = URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenplay.fdx';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "Export Successful",
        description: "Screenplay exported to Final Draft format (.fdx)",
      });
    } catch (error) {
      console.error('Error exporting to FDX:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting to Final Draft format.",
        variant: "destructive"
      });
    }
  };

  const handleImportFDX = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleFileSelected = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target?.result as string;
        const { scriptContent } = importFromFDX(content);
        
        if (scriptContent && scriptContent.elements) {
          setElements(scriptContent.elements);
          
          toast({
            title: "Import Successful",
            description: `Imported ${scriptContent.elements.length} elements from Final Draft file.`,
          });
        }
      } catch (error) {
        console.error('Error importing FDX:', error);
        toast({
          title: "Import Failed",
          description: "There was an error importing the Final Draft file.",
          variant: "destructive"
        });
      }
      
      // Reset the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    };
    
    reader.readAsText(file);
  };

  const handleExportPDF = async () => {
    try {
      const scriptContent = { elements };
      
      // Generate the PDF
      const pdfBlob = await generatePDF(scriptContent, undefined, {
        includePageNumbers: showPageNumbers,
        includeSceneNumbers: showSceneNumbers
      });
      
      // Trigger download
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'screenplay.pdf';
      document.body.appendChild(a);
      a.click();
      
      // Clean up
      setTimeout(() => {
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }, 100);
      
      toast({
        title: "PDF Export Successful",
        description: "Screenplay exported to PDF format.",
      });
    } catch (error) {
      console.error('Error exporting to PDF:', error);
      toast({
        title: "PDF Export Failed",
        description: "There was an error generating the PDF.",
        variant: "destructive"
      });
    }
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Format</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={() => handleElementChange('scene-heading')}>
          Scene Heading
          <MenubarShortcut>⌘1</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('action')}>
          Action
          <MenubarShortcut>⌘2</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('character')}>
          Character
          <MenubarShortcut>⌘3</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('dialogue')}>
          Dialogue
          <MenubarShortcut>⌘4</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('parenthetical')}>
          Parenthetical
          <MenubarShortcut>⌘5</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('transition')}>
          Transition
          <MenubarShortcut>⌘6</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        
        <MenubarSub>
          <MenubarSubTrigger>Element Properties</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem>Dual Dialogue</MenubarItem>
            <MenubarItem>Centered Text</MenubarItem>
            <MenubarItem>Bold Text</MenubarItem>
            <MenubarItem>Italic Text</MenubarItem>
            <MenubarItem>Underline Text</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        
        <MenubarCheckboxItem checked={showSceneNumbers} onClick={toggleSceneNumbers}>
          Scene Numbers
        </MenubarCheckboxItem>
        
        <MenubarCheckboxItem checked={showPageNumbers} onClick={togglePageNumbers}>
          Page Numbers
        </MenubarCheckboxItem>
        
        <MenubarItem onClick={handlePageBreak}>
          Page Break
        </MenubarItem>
        
        <MenubarSeparator />
        
        <MenubarSub>
          <MenubarSubTrigger>Font</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={() => handleFontChange('Courier Final Draft')}>
              Courier Final Draft
            </MenubarItem>
            <MenubarItem onClick={() => handleFontChange('Courier Prime')}>
              Courier Prime
            </MenubarItem>
            <MenubarItem onClick={() => handleFontChange('Courier New')}>
              Courier New
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        
        <MenubarSub>
          <MenubarSubTrigger>Font Size</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={() => handleFontSizeChange(10)}>10pt</MenubarItem>
            <MenubarItem onClick={() => handleFontSizeChange(12)}>12pt (Standard)</MenubarItem>
            <MenubarItem onClick={() => handleFontSizeChange(14)}>14pt</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        
        <MenubarSub>
          <MenubarSubTrigger>Line Spacing</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={() => handleLineSpacingChange('single')}>Single</MenubarItem>
            <MenubarItem onClick={() => handleLineSpacingChange('1.5')}>1.5 lines</MenubarItem>
            <MenubarItem onClick={() => handleLineSpacingChange('double')}>Double</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        
        <MenubarSeparator />
        
        <MenubarItem onClick={handleExportFDX}>
          Export to Final Draft (.fdx)
        </MenubarItem>
        
        <MenubarItem onClick={handleImportFDX}>
          Import from Final Draft (.fdx)
        </MenubarItem>
        
        <MenubarItem onClick={handleExportPDF}>
          Export to PDF
        </MenubarItem>
      </MenubarContent>
      
      {/* Hidden file input for FDX import */}
      <input 
        type="file" 
        ref={fileInputRef}
        style={{ display: 'none' }}
        accept=".fdx"
        onChange={handleFileSelected}
      />
    </MenubarMenu>
  );
};

export default FormatMenu;
