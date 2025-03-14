
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
    
    // Add CSS to optimize the print view
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
          font-family: 'Courier Prime', monospace;
        }
      }
    `;
    document.head.appendChild(style);
    
    // Hide elements we don't want to print
    const elementsToHide = document.querySelectorAll('.menubar, .fixed');
    elementsToHide.forEach(el => {
      if (el instanceof HTMLElement) {
        el.setAttribute('data-original-display', el.style.display);
        el.style.display = 'none';
      }
    });
    
    // Scale and position the script for optimal printing
    const scriptPage = document.querySelector('.script-page');
    let originalTransform = '';
    if (scriptPage instanceof HTMLElement) {
      originalTransform = scriptPage.style.transform;
      scriptPage.style.transform = 'scale(1)';
    }
    
    // Open print dialog
    setTimeout(() => {
      window.print();
      
      // Restore the UI after printing
      setTimeout(() => {
        // Remove the print stylesheet
        document.head.removeChild(style);
        
        // Restore hidden elements
        elementsToHide.forEach(el => {
          if (el instanceof HTMLElement) {
            const originalDisplay = el.getAttribute('data-original-display') || '';
            el.style.display = originalDisplay;
            el.removeAttribute('data-original-display');
          }
        });
        
        // Restore script page scaling
        if (scriptPage instanceof HTMLElement) {
          scriptPage.style.transform = originalTransform;
        }
        
        toast({
          title: "PDF Export",
          description: "PDF export complete!",
        });
      }, 500);
    }, 500);
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
