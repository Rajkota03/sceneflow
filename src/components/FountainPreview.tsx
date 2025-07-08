import React from 'react';

interface FountainPreviewProps {
  fountainAST: any;
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

export function FountainPreview({ fountainAST }: FountainPreviewProps) {
  if (!fountainAST || !fountainAST.html || !fountainAST.html.script) {
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
          <div key={key} className="mt-4 mb-1 text-center font-bold uppercase ml-[2.2in]">
            {element.text || element.character}
          </div>
        );
      
      case 'dialogue':
        return (
          <div key={key} className="mb-3 ml-[1.0in] max-w-[4.0in]">
            {element.text || element.dialogue}
          </div>
        );
      
      case 'parenthetical':
        return (
          <div key={key} className="mb-2 ml-[1.6in] italic text-muted-foreground">
            {element.text || element.parenthetical}
          </div>
        );
      
      case 'transition':
        return (
          <div key={key} className="mb-4 mt-3 text-right font-bold uppercase pr-[0.5in]">
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
      
      // Fallback: try to parse from HTML structure
      if (fountainAST.html && fountainAST.html.script) {
        const elements: ScreenplayElement[] = [];
        const scriptContent = fountainAST.html.script;
        
        // Simple parsing of common screenplay elements
        const lines = scriptContent.split('\n').filter((line: string) => line.trim());
        
        lines.forEach((line: string) => {
          const trimmedLine = line.trim();
          
          if (trimmedLine.startsWith('INT.') || trimmedLine.startsWith('EXT.')) {
            elements.push({ type: 'scene_heading', text: trimmedLine });
          } else if (trimmedLine === trimmedLine.toUpperCase() && !trimmedLine.includes('.') && trimmedLine.length < 30) {
            elements.push({ type: 'character', text: trimmedLine });
          } else if (trimmedLine.startsWith('(') && trimmedLine.endsWith(')')) {
            elements.push({ type: 'parenthetical', text: trimmedLine });
          } else if (trimmedLine.endsWith('TO:') || trimmedLine.endsWith('IN:') || trimmedLine.endsWith('OUT:')) {
            elements.push({ type: 'transition', text: trimmedLine });
          } else if (trimmedLine) {
            elements.push({ type: 'action', text: trimmedLine });
          }
        });
        
        return elements;
      }
      
      return [];
    } catch (error) {
      console.error('Error parsing screenplay elements:', error);
      return [];
    }
  };

  const elements = getScreenplayElements();

  return (
    <div className="h-full overflow-auto bg-muted p-4">
      <div 
        className="bg-white shadow-lg mx-auto min-h-full"
        style={{
          width: '8.5in',
          fontFamily: '"Courier New", monospace',
          fontSize: '12pt',
          lineHeight: '1.2',
          padding: '1in 1in 1in 1.5in'
        }}
      >
        {elements.length > 0 ? (
          elements.map((element, index) => renderElement(element, index))
        ) : (
          <div className="text-muted-foreground text-center py-8">
            <p>Start typing your screenplay...</p>
          </div>
        )}
      </div>
    </div>
  );
}

export default FountainPreview;