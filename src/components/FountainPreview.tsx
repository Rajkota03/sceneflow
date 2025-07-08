import React, { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Download, FileText } from 'lucide-react';

interface FountainPreviewProps {
  fountainAST: any;
  usePagedView?: boolean;
}

interface ScreenplayElement {
  type: string;
  text?: string;
  character?: string;
  dialogue?: string;
  parenthetical?: string;
  scene_heading?: string;
  action?: string;
  transition?: string;
}

export function FountainPreview({ fountainAST, usePagedView = true }: FountainPreviewProps) {
  const previewRef = useRef<HTMLDivElement>(null);
  const [isRendering, setIsRendering] = useState(false);
  const [pageCount, setPageCount] = useState(1);

  // Initialize Paged.js when component mounts or content changes
  useEffect(() => {
    if (!fountainAST?.tokens || fountainAST.tokens.length === 0) return;
    
    const renderWithPagedJS = async () => {
      setIsRendering(true);
      
      try {
        // Dynamically import Paged.js
        const { Previewer } = await import('pagedjs');
        
        if (previewRef.current) {
          // Clear previous content
          previewRef.current.innerHTML = '';
          
          // Generate HTML content for Paged.js
          const htmlContent = generateScreenplayHTML(getScreenplayElements());
          
          // Create a temporary container for Paged.js
          const tempContainer = document.createElement('div');
          tempContainer.innerHTML = htmlContent;
          
          if (usePagedView) {
            // Initialize Paged.js previewer
            const previewer = new Previewer();
            
            // Render with Paged.js
            const flow = await previewer.preview(tempContainer.innerHTML, [], previewRef.current);
            
            // Update page count
            const pages = previewRef.current.querySelectorAll('.pagedjs_page');
            setPageCount(pages.length);
          } else {
            // Simple view without pagination
            previewRef.current.appendChild(tempContainer);
          }
        }
      } catch (error) {
        console.error('Error rendering with Paged.js:', error);
        // Fallback to simple rendering
        if (previewRef.current) {
          previewRef.current.innerHTML = generateScreenplayHTML(getScreenplayElements());
        }
      } finally {
        setIsRendering(false);
      }
    };

    renderWithPagedJS();
  }, [fountainAST, usePagedView]);

  // Export to PDF function
  const exportToPDF = async () => {
    try {
      // Use browser's print functionality as fallback
      // In production, you'd want to use a backend service with puppeteer
      window.print();
    } catch (error) {
      console.error('Error exporting to PDF:', error);
    }
  };

  if (!fountainAST?.tokens || fountainAST.tokens.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-muted-foreground">
        <div className="text-center">
          <p>No content to preview</p>
          <p className="text-sm mt-2">Start typing to see the screenplay preview</p>
        </div>
      </div>
    );
  }

  const renderElement = (element: ScreenplayElement, index: number) => {
    const key = `element-${index}`;
    
    switch (element.type) {
      case 'scene_heading':
        return (
          <div key={key} className="mb-4 mt-6 font-bold uppercase">
            {element.text || element.scene_heading}
          </div>
        );
      
      case 'action':
        return (
          <div key={key} className="mb-3 text-left">
            {element.text || element.action}
          </div>
        );
      
      case 'character':
        return (
          <div key={key} className="mt-4 mb-1 font-bold uppercase" style={{ 
            textAlign: 'center',
            marginLeft: '2.2in',
            width: 'auto'
          }}>
            {element.text || element.character}
          </div>
        );
      
      case 'dialogue':
        return (
          <div key={key} className="mb-3" style={{
            marginLeft: '1.0in',
            marginRight: '1.5in',
            maxWidth: '4.0in'
          }}>
            {element.text || element.dialogue}
          </div>
        );
      
      case 'parenthetical':
        return (
          <div key={key} className="mb-2 italic text-gray-600" style={{
            marginLeft: '1.6in',
            marginRight: '2.0in'
          }}>
            {element.text || element.parenthetical}
          </div>
        );
      
      case 'transition':
        return (
          <div key={key} className="mb-4 mt-3 text-right font-bold uppercase" style={{
            paddingRight: '0.5in'
          }}>
            {element.text || element.transition}
          </div>
        );
      
      default:
        return (
          <div key={key} className="mb-2">
            {element.text || ''}
          </div>
        );
    }
  };

  // Extract the screenplay content from the AST
  const getScreenplayElements = (): ScreenplayElement[] => {
    try {
      if (fountainAST.tokens) {
        return fountainAST.tokens.map((token: any) => ({
          type: token.type,
          text: token.text || ''
        }));
      }
      return [];
    } catch (error) {
      console.error('Error parsing screenplay elements:', error);
      return [];
    }
  };

  // Generate HTML content for Paged.js
  const generateScreenplayHTML = (elements: ScreenplayElement[]): string => {
    const elementHTML = elements.map((element, index) => {
      const key = `element-${index}`;
      
      switch (element.type) {
        case 'scene_heading':
          return `<div class="scene-heading">${element.text}</div>`;
        
        case 'action':
          return `<div class="action">${element.text}</div>`;
        
        case 'character':
          return `<div class="character">${element.text}</div>`;
        
        case 'dialogue':
          return `<div class="dialogue">${element.text}</div>`;
        
        case 'parenthetical':
          return `<div class="parenthetical">${element.text}</div>`;
        
        case 'transition':
          return `<div class="transition">${element.text}</div>`;
        
        default:
          return `<div class="action">${element.text}</div>`;
      }
    }).join('');

    return `
      <style>
        @page {
          size: 8.5in 11in;
          margin: 1in 1in 1in 1.5in;
          @top-right {
            content: counter(page);
            font-family: "Courier Prime", "Courier New", monospace;
            font-size: 12pt;
          }
        }
        
        .screenplay-content {
          font-family: "Courier Prime", "Courier New", monospace;
          font-size: 12pt;
          line-height: 1.2;
          color: #000;
          background: white;
        }
        
        .scene-heading {
          margin: 1.5em 0 0.12in 0;
          text-transform: uppercase;
          font-weight: bold;
          page-break-after: avoid;
        }
        
        .action {
          margin: 0.12in 0;
          text-align: left;
        }
        
        .character {
          margin: 0.12in 0 0.06in 2.2in;
          text-transform: uppercase;
          font-weight: bold;
          text-align: left;
          page-break-after: avoid;
        }
        
        .dialogue {
          margin: 0 0 0.12in 1.0in;
          max-width: 4.0in;
          text-align: left;
          page-break-inside: avoid;
        }
        
        .parenthetical {
          margin: 0 0 0.06in 1.6in;
          font-style: italic;
          text-align: left;
          color: #666;
        }
        
        .transition {
          margin: 0.12in 0;
          text-transform: uppercase;
          font-weight: bold;
          text-align: right;
          padding-right: 0.5in;
        }
      </style>
      <div class="screenplay-content">
        ${elementHTML}
      </div>
    `;
  };

  return (
    <div className="h-full flex flex-col bg-gray-100">
      {/* Header with export controls */}
      <div className="p-4 bg-white border-b flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <FileText className="h-4 w-4" />
          <span>
            {isRendering ? 'Rendering...' : `${pageCount} page${pageCount !== 1 ? 's' : ''}`}
          </span>
        </div>
        
        <Button
          variant="outline"
          size="sm"
          onClick={exportToPDF}
          disabled={isRendering}
          className="flex items-center gap-2"
        >
          <Download className="h-4 w-4" />
          Export PDF
        </Button>
      </div>

      {/* Preview area */}
      <div className="flex-1 overflow-auto p-4">
        <div 
          ref={previewRef}
          className="screenplay-preview mx-auto"
          style={{
            maxWidth: usePagedView ? '8.5in' : '100%',
            background: 'white',
            boxShadow: usePagedView ? '0 4px 20px rgba(0,0,0,0.15)' : 'none',
          }}
        >
          {isRendering && (
            <div className="flex items-center justify-center h-96 text-muted-foreground">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
                <p>Rendering screenplay...</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default FountainPreview;