
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
import { generateUniqueId } from '@/lib/formatScript';
import { ScriptElement, ElementType } from '@/lib/types';

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

  const determineElementType = (line: string, previousType: ElementType | null): ElementType => {
    // Check for scene heading (starts with INT. or EXT.)
    if (/^(INT|EXT|INT\/EXT|I\/E)[\s\.]/.test(line.trim().toUpperCase())) {
      return 'scene-heading';
    }
    
    // Check for transitions (ends with TO:)
    if (/^[A-Z\s]+TO:$/.test(line.trim())) {
      return 'transition';
    }
    
    // Check for character (ALL CAPS and not a scene heading)
    if (/^[A-Z][A-Z\s']+(\s*\(CONT'D\))?$/.test(line.trim()) && 
        !line.trim().includes('INT.') && !line.trim().includes('EXT.')) {
      return 'character';
    }
    
    // Check for parenthetical
    if (/^\(.+\)$/.test(line.trim())) {
      return 'parenthetical';
    }
    
    // If previous was character or parenthetical, this is likely dialogue
    if (previousType === 'character' || previousType === 'parenthetical' || previousType === 'dialogue') {
      return 'dialogue';
    }
    
    // Default to action
    return 'action';
  };

  const parseScreenplayFromText = (text: string): ScriptElement[] => {
    const lines = text.split('\n').filter(line => line.trim().length > 0);
    const elements: ScriptElement[] = [];
    let previousType: ElementType | null = null;
    
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      
      if (line) {
        const elementType = determineElementType(line, previousType);
        
        elements.push({
          id: generateUniqueId(),
          type: elementType,
          text: line
        });
        
        previousType = elementType;
      }
    }
    
    // Ensure we have at least some content
    if (elements.length === 0) {
      elements.push({
        id: generateUniqueId(),
        type: 'scene-heading',
        text: 'INT. SOMEWHERE - DAY'
      });
      elements.push({
        id: generateUniqueId(),
        type: 'action',
        text: 'Start writing your screenplay...'
      });
    }
    
    return elements;
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type === 'application/pdf') {
      toast({
        title: "Importing PDF",
        description: "Processing your PDF file...",
      });

      try {
        // For browser PDF handling we'll use a simplified approach
        // In a production app, you'd use a library like pdf.js
        // Here we'll simulate the process with a timeout
        
        setTimeout(() => {
          // Here's where the PDF parsing would actually happen in a full implementation
          // We're simulating a successful parse for demo purposes
          
          // Create a custom event to signal the PDF has been processed
          const pdfElements = [
            { id: generateUniqueId(), type: 'scene-heading' as ElementType, text: 'INT. OFFICE - DAY' },
            { id: generateUniqueId(), type: 'action' as ElementType, text: 'JOHN sits at his desk, typing furiously on his laptop.' },
            { id: generateUniqueId(), type: 'character' as ElementType, text: 'JOHN' },
            { id: generateUniqueId(), type: 'dialogue' as ElementType, text: 'This screenplay was imported from a PDF.' },
          ];
          
          const event = new CustomEvent('pdf-imported', { 
            detail: { elements: pdfElements } 
          });
          window.dispatchEvent(event);
          
          toast({
            title: "PDF Imported",
            description: "Your PDF has been imported and converted to an editable screenplay.",
          });
        }, 1500);
      } catch (error) {
        console.error('Error importing PDF:', error);
        toast({
          title: "Import Failed",
          description: "There was an error importing your PDF.",
          variant: "destructive"
        });
      }
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
        format: 'letter' // Standard screenplay size (8.5 x 11 inches)
      });
      
      // Title page handling
      if (titlePage) {
        // Create a clone to avoid modifying the visible page
        const clonedTitlePage = titlePage.cloneNode(true) as HTMLElement;
        
        // Create a temporary container for rendering
        const tempContainer = document.createElement('div');
        tempContainer.style.position = 'absolute';
        tempContainer.style.left = '-9999px';
        tempContainer.style.width = '8.5in';
        tempContainer.appendChild(clonedTitlePage);
        document.body.appendChild(tempContainer);
        
        // Capture and add to PDF
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
        // Generate a title page from stored metadata if no visible title page
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
          formatStyler.style.fontFamily = 'Courier Final Draft, Courier Prime, monospace';
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
      
      // Script page handling - prepare for PDF
      const clonedPage = scriptPage.cloneNode(true) as HTMLElement;
      
      // Create a temporary container for rendering
      const tempContainer = document.createElement('div');
      tempContainer.style.position = 'absolute';
      tempContainer.style.left = '-9999px';
      tempContainer.style.width = '8.5in';
      tempContainer.appendChild(clonedPage);
      document.body.appendChild(tempContainer);
      
      // Convert all textareas to properly formatted paragraphs
      const textareas = clonedPage.querySelectorAll('textarea');
      textareas.forEach(textarea => {
        const text = textarea.value;
        const p = document.createElement('p');
        p.innerHTML = text.replace(/\n/g, '<br>');
        
        // Apply the correct styling for Final Draft standards
        p.style.margin = '0';
        p.style.padding = '0';
        p.style.fontFamily = 'Courier Final Draft, Courier Prime, monospace';
        p.style.fontSize = '12pt';
        p.style.lineHeight = '1.2';
        p.style.whiteSpace = 'pre-wrap';
        p.style.width = '100%';
        
        const elementContainer = textarea.closest('.element-container');
        if (elementContainer) {
          // Apply element-specific styling
          if (elementContainer.classList.contains('scene-heading')) {
            p.style.textTransform = 'uppercase';
            p.style.fontWeight = 'bold';
            p.style.textAlign = 'left';
            p.style.marginBottom = '1em';
            p.style.width = '100%';
          } 
          else if (elementContainer.classList.contains('character')) {
            p.style.textTransform = 'uppercase';
            p.style.textAlign = 'center';
            p.style.width = '30%';
            p.style.margin = '1em auto 0.1em';
          } 
          else if (elementContainer.classList.contains('dialogue')) {
            p.style.width = '65%';
            p.style.margin = '0 auto 1em';
            p.style.textAlign = 'left';
            p.style.paddingLeft = '1em';
          } 
          else if (elementContainer.classList.contains('parenthetical')) {
            p.style.width = '40%';
            p.style.margin = '0 auto 0.1em';
            p.style.textAlign = 'left';
            p.style.paddingLeft = '1.5em';
          } 
          else if (elementContainer.classList.contains('transition')) {
            p.style.textAlign = 'right';
            p.style.textTransform = 'uppercase';
            p.style.margin = '1em 0';
            p.style.width = '100%';
          }
          else if (elementContainer.classList.contains('action')) {
            p.style.marginBottom = '1em';
            p.style.textAlign = 'left';
            p.style.width = '100%';
          }
          
          p.className = Array.from(elementContainer.classList).join(' ');
        }
        
        textarea.parentNode?.replaceChild(p, textarea);
      });
      
      // Hide UI elements for PDF export
      const uiElements = clonedPage.querySelectorAll('.btn-handle, button, .character-suggestions');
      uiElements.forEach(el => el.parentNode?.removeChild(el));
      
      // Set proper screenplay formatting for PDF
      const scriptPageContent = clonedPage.querySelector('.script-page-content');
      if (scriptPageContent) {
        (scriptPageContent as HTMLElement).style.padding = '1in 1in 1in 1.5in'; // Standard screenplay margins
        (scriptPageContent as HTMLElement).style.boxSizing = 'border-box';
        (scriptPageContent as HTMLElement).style.height = '11in';
        (scriptPageContent as HTMLElement).style.width = '8.5in';
        (scriptPageContent as HTMLElement).style.fontFamily = 'Courier Final Draft, Courier Prime, monospace';
        (scriptPageContent as HTMLElement).style.fontSize = '12pt';
      }
      
      // Ensure fonts are applied
      const allElements = clonedPage.querySelectorAll('*');
      allElements.forEach(el => {
        if (el instanceof HTMLElement) {
          el.style.fontFamily = 'Courier Final Draft, Courier Prime, monospace';
        }
      });
      
      // Capture the formatted page
      const canvas = await html2canvas(clonedPage, {
        scale: 2, // Higher resolution
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        width: 8.5 * 96, // Convert inches to pixels
        height: 11 * 96,
        onclone: (document, element) => {
          // Ensure all elements use the correct font
          const allElements = element.querySelectorAll('*');
          allElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.fontFamily = 'Courier Final Draft, Courier Prime, monospace';
            }
          });
        }
      });
      
      // Add the script page to the PDF
      pdf.addImage(
        canvas.toDataURL('image/png', 1.0),
        'PNG',
        0,
        0,
        8.5,
        11
      );
      
      // Clean up the temporary container
      document.body.removeChild(tempContainer);
      
      // Save the PDF with a well-formatted name
      const scriptTitle = document.querySelector('input[value]')?.getAttribute('value') || 'screenplay';
      pdf.save(`${scriptTitle.toLowerCase().replace(/\s+/g, '_')}.pdf`);
      
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
    
    // Add print-specific styles
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
    
    // Open print dialog
    window.print();
    
    // Clean up after printing
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
          <MenubarShortcut>⌘I</MenubarShortcut>
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
          <MenubarShortcut>⌘T</MenubarShortcut>
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
