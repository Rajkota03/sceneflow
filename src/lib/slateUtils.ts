import { Editor } from 'slate';
import { ScriptElement, SlateElementType, SlateDocument } from './types';

// Convert script elements to Slate document format
export const scriptToSlate = (elements: ScriptElement[]): SlateDocument => {
  return elements.map(element => ({
    id: element.id,
    type: element.type,
    children: [{ text: element.text }],
    tags: element.tags,
    act: element.act,
    beat: element.beat,
    page: element.page,
    pageBreak: element.pageBreak
  }));
};

// Convert Slate document back to script elements format
export const slateToScript = (document: SlateDocument): ScriptElement[] => {
  return document.map(node => ({
    id: node.id,
    type: node.type,
    text: node.children.map(child => child.text).join(''),
    tags: node.tags,
    act: node.act,
    beat: node.beat,
    page: node.page,
    pageBreak: node.pageBreak
  }));
};

// Create a new Slate element with default values
export const createSlateElement = (
  type: SlateElementType['type'],
  text: string = '',
  id: string = crypto.randomUUID()
): SlateElementType => {
  return {
    id,
    type,
    children: [{ text }],
    tags: [],
  };
};

// Create a page break element (improved version)
export const createPageBreakElement = (
  id: string = crypto.randomUUID()
): SlateElementType => {
  return {
    id,
    type: 'action',
    children: [{ text: '' }],
    pageBreak: true,
    tags: [],
  };
};

// Helper to get text content from a Slate element
export const getNodeText = (node: SlateElementType) => {
  return node.children.map(child => child.text).join('');
};

// Check if an element is of a specific type
export const isElementType = (element: SlateElementType, type: SlateElementType['type']) => {
  return element.type === type;
};

// Check if an element is a page break
export const isPageBreak = (element: SlateElementType) => {
  return element.pageBreak === true;
};

// Check if the selection is in a specific element type
export const isSelectionInType = (editor: Editor, type: SlateElementType['type']) => {
  const [match] = Editor.nodes(editor, {
    match: n => isElementType(n as SlateElementType, type),
  });
  return !!match;
};

// Auto-format text based on element type
export const formatTextForElementType = (text: string, type: SlateElementType['type']): string => {
  if (type === 'scene-heading' || type === 'character' || type === 'transition') {
    return text.toUpperCase();
  }
  return text;
};

// Improved line estimation function for pagination
export const estimateLines = (text: string, type: SlateElementType['type']): number => {
  if (!text) return 1;
  
  // Element-specific characters per line for more accurate line counts
  const charsPerLine = {
    'scene-heading': 60, // Standard 6" width (10 chars per inch)
    'action': 60,        // Standard 6" width (10 chars per inch)
    'character': 38,     // About 3.8" width 
    'dialogue': 45,      // About 4.5" width
    'parenthetical': 34, // About 3.4" width
    'transition': 60,    // Standard 6" width
    'note': 60           // Standard 6" width
  }[type] || 60;
  
  // Split text into lines if it contains manual line breaks
  const lines = text.split('\n');
  let totalLines = 0;
  
  // Process each line/paragraph
  lines.forEach(line => {
    if (line.length === 0) {
      totalLines += 1; // Empty lines count as one line
    } else {
      // Calculate lines based on character count
      totalLines += Math.max(1, Math.ceil(line.length / charsPerLine));
    }
  });
  
  // Add element-specific adjustments
  if (type === 'scene-heading') totalLines += 0.5; // Scene headings often have extra space
  if (type === 'character') totalLines += 0.5;     // Character names have space before them
  if (type === 'dialogue' && text.length > 200) totalLines += 1; // Long dialogue often needs extra space
  
  return Math.max(1, Math.ceil(totalLines));
};

// Calculate which page an element should appear on (improved algorithm)
export const calculatePageForElement = (
  elements: SlateElementType[],
  elementIndex: number,
  linesPerPage: number = 54
): number => {
  // Initialize line count and page number
  let lineCount = 0;
  let pageNumber = 1;
  
  // Process each element up to the target index
  for (let i = 0; i <= elementIndex; i++) {
    const element = elements[i];
    
    // Handle explicit page breaks
    if (element.pageBreak) {
      pageNumber++;
      lineCount = 0;
      continue;
    }
    
    // Special handling for character and dialogue continuity
    const previousElement = i > 0 ? elements[i-1] : null;
    const shouldKeepWithPrevious = 
      (element.type === 'dialogue' || element.type === 'parenthetical') && 
      previousElement && 
      previousElement.type === 'character';
    
    // Get text from element
    const text = getNodeText(element);
    
    // Calculate lines for this element
    const linesForElement = estimateLines(text, element.type);
    
    // Check if adding this element would exceed page limit
    if (lineCount + linesForElement > linesPerPage) {
      // If this element should stick with the previous but won't fit, go to next page
      if (shouldKeepWithPrevious && previousElement && 
          elements.indexOf(previousElement) === i-1) {
        // Keep character with dialogue by moving both to next page
        // Adjust the line count for the previous element (character)
        const prevText = getNodeText(previousElement);
        const prevLines = estimateLines(prevText, previousElement.type);
        
        lineCount = prevLines + linesForElement;
        pageNumber++;
      } else {
        // Regular page break - element starts on new page
        pageNumber++;
        lineCount = linesForElement;
      }
    } else {
      // Element fits on current page
      lineCount += linesForElement;
    }
  }
  
  return pageNumber;
};
