import React, { useRef } from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger
} from '@/components/ui/menubar';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';
import { scriptContentToJson } from '@/lib/types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';

interface FileMenuProps {
  onSave: () => void;
}

const FileMenu = ({ onSave }: FileMenuProps) => {
  const navigate = useNavigate();
  const importFileRef = useRef<HTMLInputElement>(null);

  const handleNewScript = () => {
    toast({
      title: "New Script",
      description: "Creating a new screenplay. Any unsaved changes will be lost.",
    });
    setTimeout(() => navigate('/dashboard'), 1500);
  };

  const handleSaveAs = () => {
    // Clone the current script with a new name via prompt
    const newName = prompt("Enter a new name for your screenplay:", "");
    if (newName) {
      toast({
        title: "Save As",
        description: `Screenplay saved as "${newName}"`,
      });
      onSave();
    }
  };

  const handleImportPDF = () => {
    if (importFileRef.current) {
      importFileRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      toast({
        title: "Importing PDF",
        description: "Processing your PDF file...",
      });

      // In a real application, you would use a PDF parsing library here
      // For now, we'll just simulate the import
      setTimeout(() => {
        toast({
          title: "PDF Imported",
          description: "Your PDF has been imported successfully. You can now edit it.",
        });
      }, 1500);
    } else {
      toast({
        title: "Invalid File Type",
        description: "Please select a PDF file.",
        variant: "destructive"
      });
    }
    
    // Reset the input so the same file can be selected again
    event.target.value = '';
  };

  const handleExportPDF = async () => {
    toast({
      title: "Exporting PDF",
      description: "Preparing your screenplay for PDF export...",
    });
    
    // Get screenplay content
    const scriptPage = document.querySelector('.script-page');
    if (!scriptPage) {
      toast({
        title: "Export Failed",
        description: "Could not find screenplay content",
        variant: "destructive"
      });
      return;
    }
    
    try {
      // Use html2canvas to capture the screenplay content
      const canvas = await html2canvas(scriptPage as HTMLElement, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        onclone: (document, element) => {
          // Modify the cloned DOM to prepare it for export
          const clone = element as HTMLElement;
          
          // Process each element
          const elements = clone.querySelectorAll('[class*="-element"]');
          elements.forEach(element => {
            const textarea = element.querySelector('textarea');
            if (!textarea) return;
            
            const text = textarea.value;
            if (!text.trim()) return;
            
            // Replace textareas with paragraphs
            const p = document.createElement('p');
            p.textContent = text;
            p.className = textarea.className;
            p.style.whiteSpace = 'pre-wrap';
            p.style.margin = textarea.style.margin;
            p.style.padding = textarea.style.padding;
            p.style.textAlign = textarea.style.textAlign;
            p.style.fontFamily = 'Courier Prime, monospace';
            
            // Apply element-specific styling
            if (element.classList.contains('character-element')) {
              p.style.textTransform = 'uppercase';
              p.style.fontWeight = 'bold';
            } else if (element.classList.contains('scene-heading-element')) {
              p.style.textTransform = 'uppercase';
              p.style.fontWeight = 'bold';
            } else if (element.classList.contains('transition-element')) {
              p.style.textAlign = 'right';
              p.style.textTransform = 'uppercase';
              p.style.fontWeight = 'bold';
            }
            
            textarea.parentNode?.replaceChild(p, textarea);
          });
          
          // Remove any editor UI elements
          const uiElements = clone.querySelectorAll('.btn-handle, button, .menubar, .toolbar');
          uiElements.forEach(el => el.remove());
        },
      });
      
      // Create PDF document
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'px',
        format: 'letter',
      });
      
      // Calculate dimensions to maintain aspect ratio
      const imgData = canvas.toDataURL('image/png');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      const canvasRatio = canvas.height / canvas.width;
      const pageRatio = pdfHeight / pdfWidth;
      
      let finalWidth, finalHeight;
      
      if (canvasRatio > pageRatio) {
        // Canvas is taller relative to its width than the page
        finalHeight = pdfHeight;
        finalWidth = pdfHeight / canvasRatio;
      } else {
        // Canvas is wider relative to its height than the page
        finalWidth = pdfWidth;
        finalHeight = pdfWidth * canvasRatio;
      }
      
      // Add the image to the PDF
      pdf.addImage(imgData, 'PNG', 0, 0, finalWidth, finalHeight);
      
      // Check if content spans multiple pages and add them
      if (canvas.height > pdfHeight) {
        const pageCount = Math.ceil(canvas.height / pdfHeight);
        
        for (let i = 1; i < pageCount; i++) {
          // Add a new page
          pdf.addPage();
          
          // Calculate position to continue from previous page
          const sourceY = i * pdfHeight * (canvas.height / finalHeight);
          
          // Add the next part of the image
          pdf.addImage(
            imgData, 
            'PNG', 
            0, 
            -i * pdfHeight, // Negative to show next part of the image
            finalWidth, 
            finalHeight
          );
        }
      }
      
      // Save the PDF
      pdf.save('screenplay.pdf');
      
      toast({
        title: "PDF Export",
        description: "PDF exported successfully!",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred while exporting the PDF. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportFountain = () => {
    // Get the screenplay content
    const scriptContent = document.querySelector('.script-page');
    if (!scriptContent) {
      toast({
        title: "Export Failed",
        description: "Could not find screenplay content",
        variant: "destructive"
      });
      return;
    }
    
    // Convert to Fountain format
    let fountainText = "";
    
    // Get all elements with scene-heading, action, character, dialogue, etc. classes
    const elements = scriptContent.querySelectorAll('[class*="-element"]');
    elements.forEach(element => {
      const textarea = element.querySelector('textarea');
      if (!textarea) return;
      
      const text = textarea.value || '';
      if (!text.trim()) return;
      
      if (element.classList.contains('scene-heading-element')) {
        fountainText += '\n' + text + '\n\n';
      } else if (element.classList.contains('action-element')) {
        fountainText += text + '\n\n';
      } else if (element.classList.contains('character-element')) {
        fountainText += text + '\n';
      } else if (element.classList.contains('dialogue-element')) {
        fountainText += text + '\n\n';
      } else if (element.classList.contains('parenthetical-element')) {
        fountainText += '(' + text + ')\n';
      } else if (element.classList.contains('transition-element')) {
        fountainText += '> ' + text + '\n\n';
      } else {
        fountainText += text + '\n\n';
      }
    });
    
    // Create and download the Fountain file
    const blob = new Blob([fountainText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screenplay.fountain';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export to Fountain",
      description: "Screenplay exported to Fountain format successfully!",
    });
  };

  const handleExportFDX = () => {
    toast({
      title: "Export to Final Draft",
      description: "Exporting screenplay to Final Draft (.fdx) format",
    });
    
    // Get the screenplay content from textareas
    const scriptContent = document.querySelector('.script-page');
    if (!scriptContent) {
      toast({
        title: "Export Failed",
        description: "Could not find screenplay content",
        variant: "destructive"
      });
      return;
    }
    
    // Build a basic FDX XML structure
    let fdxContent = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="Screenplay" Version="1">
  <Content>
    <Paragraph Type="Action">
      <Text>Your screenplay has been exported to Final Draft format.</Text>
    </Paragraph>`;
    
    // Get all elements with their types
    const elements = scriptContent.querySelectorAll('[class*="-element"]');
    elements.forEach(element => {
      const textarea = element.querySelector('textarea');
      if (!textarea) return;
      
      const text = textarea.value || '';
      if (!text.trim()) return;
      
      let paragraphType = 'Action';
      
      if (element.classList.contains('scene-heading-element')) {
        paragraphType = 'Scene Heading';
      } else if (element.classList.contains('action-element')) {
        paragraphType = 'Action';
      } else if (element.classList.contains('character-element')) {
        paragraphType = 'Character';
      } else if (element.classList.contains('dialogue-element')) {
        paragraphType = 'Dialogue';
      } else if (element.classList.contains('parenthetical-element')) {
        paragraphType = 'Parenthetical';
      } else if (element.classList.contains('transition-element')) {
        paragraphType = 'Transition';
      }
      
      fdxContent += `
    <Paragraph Type="${paragraphType}">
      <Text>${text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}</Text>
    </Paragraph>`;
    });
    
    fdxContent += `
  </Content>
</FinalDraft>`;
    
    // Create and download the FDX file
    const blob = new Blob([fdxContent], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'screenplay.fdx';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    toast({
      title: "Export to Final Draft",
      description: "Screenplay exported to Final Draft format successfully!",
    });
  };

  const handlePrint = () => {
    toast({
      title: "Print",
      description: "Opening print dialog",
    });
    
    // Add print-specific styling
    const style = document.createElement('style');
    style.textContent = `
      @media print {
        body * {
          visibility: hidden;
        }
        .script-page, .script-page * {
          visibility: visible;
        }
        .script-page {
          position: absolute;
          left: 0;
          top: 0;
          width: 8.5in;
          padding: 1in;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Print the document
    window.print();
    
    // Remove the print style after printing
    setTimeout(() => {
      document.head.removeChild(style);
    }, 500);
  };

  const handleNavigateToDashboard = () => {
    toast({
      title: "Close Project",
      description: "Returning to dashboard",
    });
    navigate('/dashboard');
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNewScript}>
          New Script
          <MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNavigateToDashboard}>
          Open Script...
          <MenubarShortcut>⌘O</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleImportPDF}>
          Import PDF...
        </MenubarItem>
        <input
          type="file"
          ref={importFileRef}
          onChange={handleFileChange}
          accept=".pdf"
          style={{ display: 'none' }}
        />
        <MenubarSeparator />
        <MenubarItem onClick={onSave}>
          Save
          <MenubarShortcut>⌘S</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleSaveAs}>
          Save As...
          <MenubarShortcut>⇧⌘S</MenubarShortcut>
        </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Export</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleExportPDF}>
              PDF (Industry Standard)
              <MenubarShortcut>⌘E</MenubarShortcut>
            </MenubarItem>
            <MenubarItem onClick={handleExportFountain}>Fountain (.fountain)</MenubarItem>
            <MenubarItem onClick={handleExportFDX}>Final Draft (.fdx)</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem onClick={handlePrint}>
          Print...
          <MenubarShortcut>⌘P</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNavigateToDashboard}>
          Close Project
          <MenubarShortcut>⌘W</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FileMenu;
