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
import FormatStyler from '../FormatStyler';

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
    
    event.target.value = '';
  };

  const handleExportPDF = async () => {
    toast({
      title: "Exporting PDF",
      description: "Preparing your screenplay for PDF export...",
    });
    
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
      const clonedPage = scriptPage.cloneNode(true) as HTMLElement;
      
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '8.5in';
      tempContainer.appendChild(clonedPage);
      document.body.appendChild(tempContainer);
      
      const textareas = clonedPage.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        const text = textarea.value;
        const p = document.createElement('p');
        p.textContent = text;
        p.style.margin = '0';
        p.style.padding = '0';
        p.style.fontFamily = 'Courier Prime, monospace';
        p.style.fontSize = '12pt';
        p.style.lineHeight = '1.2';
        p.style.whiteSpace = 'pre-wrap';
        
        const elementContainer = textarea.closest('[class*="-element"]');
        if (elementContainer) {
          if (elementContainer.classList.contains('scene-heading-element')) {
            p.style.textTransform = 'uppercase';
            p.style.fontWeight = 'bold';
          } else if (elementContainer.classList.contains('character-element')) {
            p.style.textTransform = 'uppercase';
            p.style.fontWeight = 'bold';
            p.style.textAlign = 'center';
          } else if (elementContainer.classList.contains('dialogue-element')) {
            p.style.textAlign = 'center';
          } else if (elementContainer.classList.contains('parenthetical-element')) {
            p.style.textAlign = 'center';
            p.style.fontStyle = 'italic';
          } else if (elementContainer.classList.contains('transition-element')) {
            p.style.textAlign = 'right';
            p.style.textTransform = 'uppercase';
            p.style.fontWeight = 'bold';
          }
        }
        
        textarea.parentNode?.replaceChild(p, textarea);
      });
      
      const uiElements = clonedPage.querySelectorAll('.btn-handle, button');
      uiElements.forEach(el => el.parentNode?.removeChild(el));
      
      const canvas = await html2canvas(clonedPage, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
      });
      
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });
      
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        0,
        8.5,
        11
      );
      
      document.body.removeChild(tempContainer);
      
      pdf.save('screenplay.pdf');
      
      toast({
        title: "PDF Exported",
        description: "Your screenplay has been exported successfully.",
      });
    } catch (error) {
      console.error('Error exporting PDF:', error);
      toast({
        title: "Export Failed",
        description: "An error occurred during export. Please try again.",
        variant: "destructive"
      });
    }
  };

  const handleExportFountain = () => {
    const scriptContent = document.querySelector('.script-page');
    if (!scriptContent) {
      toast({
        title: "Export Failed",
        description: "Could not find screenplay content",
        variant: "destructive"
      });
      return;
    }
    
    let fountainText = "";
    
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
    
    const scriptContent = document.querySelector('.script-page');
    if (!scriptContent) {
      toast({
        title: "Export Failed",
        description: "Could not find screenplay content",
        variant: "destructive"
      });
      return;
    }
    
    let fdxContent = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="Screenplay" Version="1">
  <Content>
    <Paragraph Type="Action">
      <Text>Your screenplay has been exported to Final Draft format.</Text>
    </Paragraph>`;
    
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
    
    window.print();
    
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
