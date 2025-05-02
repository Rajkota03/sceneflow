import { Editor } from 'slate';
import { ScriptElement, SlateElementType, SlateDocument, ElementType } from './types'; // Added ElementType

// Convert script elements to Slate document format (No changes needed here for now)
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

// Convert Slate document back to script elements format (No changes needed here for now)
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

// Create a new Slate element with default values (No changes needed here for now)
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

// Create a page break element (No changes needed here for now)
export const createPageBreakElement = (
  id: string = crypto.randomUUID()
): SlateElementType => {
  return {
    id,
    type: 'action', // Page breaks are often represented as empty action lines
    children: [{ text: '' }],
    pageBreak: true,
    tags: [],
  };
};

// Helper to get text content from a Slate element (No changes needed here for now)
export const getNodeText = (node: SlateElementType) => {
  return node.children.map(child => child.text).join('');
};

// Check if an element is of a specific type (No changes needed here for now)
export const isElementType = (element: SlateElementType, type: SlateElementType['type']) => {
  return element.type === type;
};

// Check if an element is a page break (No changes needed here for now)
export const isPageBreak = (element: SlateElementType) => {
  return element.pageBreak === true;
};

// Check if the selection is in a specific element type (No changes needed here for now)
export const isSelectionInType = (editor: Editor, type: SlateElementType['type']) => {
  const [match] = Editor.nodes(editor, {
    match: n => isElementType(n as SlateElementType, type),
  });
  return !!match;
};

// Enhanced Auto-format text based on element type
export const formatTextForElementType = (text: string, type: ElementType): string => {
  // Trim whitespace first
  const trimmedText = text.trim();

  switch (type) {
    case 'scene-heading':
    case 'transition':
      // Ensure INT./EXT. prefixes for scene headings if missing?
      // For now, just uppercase
      return trimmedText.toUpperCase();
    case 'character':
      // Uppercase the base name, preserve (CONT'D) case
      const contdMatch = trimmedText.match(/^(.*?)(\s*\(CONT'D\))?$/i);
      if (contdMatch && contdMatch[1]) {
        const baseName = contdMatch[1].trim().toUpperCase();
        const contdSuffix = contdMatch[2] || ''; // Preserve original case of (CONT'D) if present
        return `${baseName}${contdSuffix}`;
      }
      return trimmedText.toUpperCase(); // Fallback if regex fails
    case 'parenthetical':
      // Ensure it's wrapped in parentheses
      if (trimmedText.startsWith('(') && trimmedText.endsWith(')')) {
        return trimmedText; // Already wrapped
      }
      // Wrap the text, handle cases where it might already have one parenthesis
      const coreText = trimmedText.replace(/^\(|\)$/g, ''); // Remove existing parenthesis
      return `(${coreText})`;
    case 'action':
    case 'dialogue':
    case 'note':
    default:
      // No specific formatting for these types, just return trimmed text
      return trimmedText;
  }
};

// Improved line estimation function for pagination
export const estimateLines = (text: string, type: ElementType): number => {
  if (!text) return 1; // Even an empty element takes up at least one line visually

  // Industry standard Courier 12pt is roughly 10 chars per inch.
  // Usable line width is ~6 inches (8.5" paper - 1.5" left margin - 1" right margin).
  const MAX_CHARS_PER_LINE = 60;

  // Adjust max characters based on element type margins
  const charsPerLine = {
    'scene-heading': MAX_CHARS_PER_LINE, // Approx 1.5" left margin
    'action': MAX_CHARS_PER_LINE,        // Approx 1.5" left margin
    'character': 22,     // Approx 3.7" left margin -> ~2.2" width -> 22 chars
    'dialogue': 35,      // Approx 2.5" left margin -> ~3.5" width -> 35 chars
    'parenthetical': 28, // Approx 3.1" left margin -> ~2.8" width -> 28 chars
    'transition': MAX_CHARS_PER_LINE,    // Right aligned, but effectively uses full width
    'note': MAX_CHARS_PER_LINE
  }[type] || MAX_CHARS_PER_LINE;

  // Split text by explicit newlines added by Shift+Enter
  const paragraphs = text.split('\n');
  let totalLines = 0;

  paragraphs.forEach(paragraph => {
    if (paragraph.trim().length === 0) {
      totalLines += 1; // Empty paragraphs count as one line
    } else {
      // Calculate lines needed for this paragraph based on character count and width
      totalLines += Math.max(1, Math.ceil(paragraph.length / charsPerLine));
    }
  });

  // Add standard spacing between elements (approximated)
  // These values represent the blank lines *after* the element.
  const spacingAfter = {
      'scene-heading': 1, // Double space after scene heading
      'action': 1,        // Single space after action
      'character': 0,     // No space after character (before dialogue/paren)
      'dialogue': 1,     // Single space after dialogue (before next character/action)
      'parenthetical': 0, // No space after parenthetical (before dialogue)
      'transition': 1,    // Double space after transition (usually)
      'note': 1
  }[type] || 1; // Default to 1 line spacing

  // Add the spacing to the line count
  totalLines += spacingAfter;

  // Ensure a minimum of 1 line for the element itself + spacing
  return Math.max(1, totalLines);
};

// Calculate which page an element should appear on (Refined Algorithm)
export const calculatePageForElement = (
  elements: SlateElementType[],
  elementIndex: number,
  linesPerPage: number = 55 // Standard screenplay lines per page
): { pageNumber: number, linesOnPage: number[] } => {
  let lineCount = 0;
  let pageNumber = 1;
  const linesOnPage: number[] = new Array(elements.length).fill(0);

  for (let i = 0; i < elements.length; i++) {
    const element = elements[i];
    const text = getNodeText(element);
    const linesForElement = estimateLines(text, element.type);

    // Check for explicit page break BEFORE adding lines
    if (element.pageBreak) {
      if (lineCount > 0) { // Only break if not already at top of a page
          pageNumber++;
          lineCount = 0;
      }
      // Assign page number even if it's just a break element
      linesOnPage[i] = pageNumber;
      continue; // Move to next element
    }

    // Orphan/Widow Control (Simple version: Keep Character with Dialogue/Parenthetical)
    const previousElement = i > 0 ? elements[i - 1] : null;
    const isDialogueOrParen = element.type === 'dialogue' || element.type === 'parenthetical';
    const followsCharacter = previousElement?.type === 'character';

    // If adding this element exceeds the page limit
    if (lineCount > 0 && lineCount + linesForElement > linesPerPage) {
        // Check if it's a dialogue/paren following a character that would be orphaned
        if (isDialogueOrParen && followsCharacter && lineCount === estimateLines(getNodeText(previousElement!), previousElement!.type)) {
            // The character is the only thing on the previous line count.
            // Force the character onto the new page as well.
            pageNumber++;
            // Recalculate line count starting with the character
            lineCount = estimateLines(getNodeText(previousElement!), previousElement!.type) + linesForElement;
            // Update the previous element's page number
            if (i > 0) linesOnPage[i - 1] = pageNumber;
        } else {
            // Normal page break
            pageNumber++;
            lineCount = linesForElement;
        }
    } else {
        // Element fits on the current page
        lineCount += linesForElement;
    }

    // Assign the calculated page number to the element
    linesOnPage[i] = pageNumber;

    // If this is the target element, return the result early
    if (i === elementIndex) {
      // Return the page number for the requested element and the array of all page numbers
      return { pageNumber: linesOnPage[elementIndex], linesOnPage };
    }
  }

  // Should not be reached if elementIndex is valid, but return fallback
  return { pageNumber: linesOnPage[elementIndex] ?? 1, linesOnPage };
};

