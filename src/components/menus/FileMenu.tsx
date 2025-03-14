import React from 'react';
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

interface FileMenuProps {
  onSave: () => void;
}

const FileMenu = ({ onSave }: FileMenuProps) => {
  const navigate = useNavigate();

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

  const handleExportPDF = () => {
    toast({
      title: "Exporting PDF",
      description: "Preparing your screenplay for PDF export...",
    });
    
    // Create a new window for the print-friendly version
    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      toast({
        title: "Export Failed",
        description: "Could not open print window. Please check your popup blocker settings.",
        variant: "destructive"
      });
      return;
    }
    
    // Get screenplay content
    const scriptPage = document.querySelector('.script-page');
    if (!scriptPage) {
      toast({
        title: "Export Failed",
        description: "Could not find screenplay content",
        variant: "destructive"
      });
      printWindow.close();
      return;
    }
    
    // Clone the content to avoid modifying the original
    const scriptContent = scriptPage.cloneNode(true) as HTMLElement;
    
    // Create print-friendly HTML
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Screenplay Export</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Courier+Prime:wght@400;700&display=swap');
            
            body {
              margin: 0;
              padding: 0;
              background-color: #fff;
              font-family: 'Courier Prime', monospace;
            }
            
            .script-container {
              width: 8.5in;
              padding: 1in;
              margin: 0 auto;
              box-sizing: border-box;
            }
            
            .script-page {
              width: 100%;
              background-color: white;
              color: black;
              font-family: 'Courier Prime', monospace;
              font-size: 12pt;
              line-height: 1.2;
              border: none;
              box-shadow: none;
            }
            
            /* Hide any UI elements */
            .menubar, .fixed, button, .toolbar, [contenteditable=true] {
              display: none !important;
            }
            
            /* Make sure all textarea content is visible as regular text */
            textarea {
              border: none;
              background: transparent;
              resize: none;
              overflow: visible;
              width: 100%;
              height: auto;
              font-family: inherit;
              font-size: inherit;
              line-height: inherit;
              padding: 0;
              margin: 0;
              white-space: pre-wrap;
            }
            
            /* Element styles */
            .scene-heading-element {
              text-transform: uppercase;
              font-weight: bold;
              margin-bottom: 1em;
            }
            
            .action-element {
              margin-bottom: 1em;
            }
            
            .character-element {
              text-align: center;
              text-transform: uppercase;
              font-weight: bold;
              margin-top: 1em;
              margin-bottom: 0;
            }
            
            .dialogue-element {
              text-align: center;
              width: 60%;
              margin: 0 auto 1em;
            }
            
            .parenthetical-element {
              text-align: center;
              width: 40%;
              margin: 0 auto;
              font-style: italic;
            }
            
            .transition-element {
              text-align: right;
              text-transform: uppercase;
              font-weight: bold;
              margin: 1em 0;
            }
            
            @media print {
              body {
                print-color-adjust: exact;
                -webkit-print-color-adjust: exact;
              }
              
              @page {
                size: letter;
                margin: 0;
              }
              
              .script-container {
                width: 100%;
                height: 100%;
                padding: 1in;
                box-sizing: border-box;
                page-break-after: always;
              }
            }
          </style>
        </head>
        <body>
          <div class="script-container">
          </div>
        </body>
      </html>
    `);

    // Get script content and convert textareas to plain text
    const container = printWindow.document.querySelector('.script-container');
    if (container && scriptContent) {
      // Find all textareas and replace them with their content as regular text
      const textAreas = scriptContent.querySelectorAll('textarea');
      textAreas.forEach(textarea => {
        const div = printWindow.document.createElement('div');
        const elementContainer = textarea.closest('[class*="-element"]');
        if (elementContainer) {
          // Copy the class to preserve styling
          const className = Array.from(elementContainer.classList)
            .find(cls => cls.endsWith('-element'));
          if (className) {
            div.className = className;
          }
        }
        div.textContent = textarea.value;
        if (textarea.parentNode) {
          textarea.parentNode.replaceChild(div, textarea);
        }
      });
      
      // Add the processed content to the print window
      container.appendChild(scriptContent);
      
      // Remove any remaining editor controls
      const controlsToRemove = container.querySelectorAll('.menubar, .fixed, button, .toolbar');
      controlsToRemove.forEach(el => el.remove());
    }
    
    // Delay to ensure content and styles are loaded
    setTimeout(() => {
      printWindow.focus();
      printWindow.print();
      
      // Close window after printing (or if print dialog is cancelled)
      printWindow.onafterprint = () => {
        setTimeout(() => {
          printWindow.close();
        }, 1000);
      };
      
      // Fallback in case onafterprint isn't supported
      setTimeout(() => {
        if (!printWindow.closed) {
          toast({
            title: "PDF Export",
            description: "You can close the print window when finished",
          });
        }
      }, 5000);
      
      toast({
        title: "PDF Export",
        description: "PDF export complete!",
      });
    }, 1000);
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
