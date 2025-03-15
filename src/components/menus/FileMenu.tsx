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
  onSaveAs: (newTitle: string) => void;
  onTitlePage: () => void;
}

const FileMenu = ({ onSave, onSaveAs, onTitlePage }: FileMenuProps) => {
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
      onSaveAs(newName);
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
    
    const titlePage = document.querySelector('.title-page');
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
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'in',
        format: 'letter'
      });
      
      if (titlePage) {
        const clonedTitlePage = titlePage.cloneNode(true) as HTMLElement;
        
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '8.5in';
        tempContainer.appendChild(clonedTitlePage);
        document.body.appendChild(tempContainer);
        
        const titleCanvas = await html2canvas(clonedTitlePage, {
          scale: 2,
          useCORS: true,
          logging: false,
          backgroundColor: '#ffffff',
        });
        
        pdf.addImage(
          titleCanvas.toDataURL('image/png', 1.0),
          'PNG',
          0,
          0,
          8.5,
          11
        );
        
        document.body.removeChild(tempContainer);
        
        pdf.addPage();
      } else {
        const hiddenTitlePageContainer = document.createElement('div');
        hiddenTitlePageContainer.style.position = 'absolute';
        hiddenTitlePageContainer.style.left = '-9999px';
        hiddenTitlePageContainer.style.width = '8.5in';
        
        const titlePageData = JSON.parse(localStorage.getItem('currentTitlePageData') || '{}');
        if (titlePageData && titlePageData.title) {
          const titlePageElement = document.createElement('div');
          titlePageElement.className = 'title-page flex flex-col items-center min-h-[11in] text-center relative py-8';
          titlePageElement.innerHTML = `
            <div class="title-section" style="margin-top: 3in">
              <h1 class="text-xl uppercase font-bold mb-8">${titlePageData.title || "SCRIPT TITLE"}</h1>
              
              <div class="author-section mt-12">
                <p class="mb-2">Written by</p>
                <p class="mb-12">${titlePageData.author || "Name of Writer"}</p>
              </div>
              
              ${titlePageData.basedOn ? `
                <div class="based-on-section mt-12">
                  <p>${titlePageData.basedOn}</p>
                </div>
              ` : ''}
            </div>
            
            ${titlePageData.contact ? `
              <div class="contact-section absolute bottom-24 left-24 text-sm text-left whitespace-pre-line">
                <p>${titlePageData.contact}</p>
              </div>
            ` : ''}
          `;
          
          const formatStyler = document.createElement('div');
          formatStyler.style.fontFamily = 'Courier Prime, monospace';
          formatStyler.style.fontSize = '12pt';
          formatStyler.style.width = '8.5in';
          formatStyler.style.padding = '0.5in';
          formatStyler.appendChild(titlePageElement);
          
          hiddenTitlePageContainer.appendChild(formatStyler);
          document.body.appendChild(hiddenTitlePageContainer);
          
          const titleCanvas = await html2canvas(formatStyler, {
            scale: 2,
            useCORS: true,
            logging: false,
            backgroundColor: '#ffffff',
          });
          
          pdf.addImage(
            titleCanvas.toDataURL('image/png', 1.0),
            'PNG',
            0,
            0,
            8.5,
            11
          );
          
          document.body.removeChild(hiddenTitlePageContainer);
          
          pdf.addPage();
        }
      }
      
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
        .title-page, .title-page *, .script-page, .script-page * {
          visibility: visible;
        }
        .title-page, .script-page {
          position: absolute;
          left: 0;
          top: 0;
          width: 8.5in;
          padding: 1in;
        }
        .title-page {
          page-break-after: always;
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
        <MenubarItem onClick={onTitlePage}>
          Title Page
        </MenubarItem>
        <MenubarItem onClick={handleExportPDF}>
          Export PDF
          <MenubarShortcut>⌘E</MenubarShortcut>
        </MenubarItem>
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
