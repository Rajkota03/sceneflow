
import { ScriptContent, ScriptElement, ElementType, TitlePageData } from '@/lib/types';
import { generateUniqueId } from './formatScript';

// XML namespaces used in Final Draft FDX format
const FD_NAMESPACE = 'http://www.finaldraft.com/Final_Draft_8';

/**
 * Converts a Scene Flow script to FDX format
 */
export const convertToFDX = (
  scriptContent: ScriptContent, 
  titlePageData?: TitlePageData
): string => {
  const date = new Date().toISOString().split('T')[0]; // YYYY-MM-DD format
  
  let xml = `<?xml version="1.0" encoding="UTF-8" standalone="no" ?>
<FinalDraft DocumentType="Script" Template="Screenplay" Version="3">
  <Content>
    <TitlePage>`;
  
  // Add title page content if available
  if (titlePageData) {
    xml += `
      <Title>${escapeXml(titlePageData.title || 'Untitled')}</Title>
      <Author>${escapeXml(titlePageData.author || '')}</Author>`;
    
    if (titlePageData.basedOn) {
      xml += `
      <AdaptedBy>Based on: ${escapeXml(titlePageData.basedOn)}</AdaptedBy>`;
    }
    
    if (titlePageData.contact) {
      xml += `
      <Contact>${escapeXml(titlePageData.contact)}</Contact>`;
    }
  } else {
    xml += `
      <Title>Untitled</Title>
      <Author></Author>`;
  }
  
  xml += `
    </TitlePage>
    <Paragraphs>`;
  
  // Convert each script element to FDX format
  scriptContent.elements.forEach(element => {
    xml += convertElementToFDX(element);
  });
  
  xml += `
    </Paragraphs>
  </Content>
</FinalDraft>`;
  
  return xml;
};

/**
 * Converts a single screenplay element to FDX format
 */
const convertElementToFDX = (element: ScriptElement): string => {
  const type = mapElementTypeToFDX(element.type);
  const text = escapeXml(element.text);
  
  return `
      <Paragraph Type="${type}">
        <Text>${text}</Text>
      </Paragraph>`;
};

/**
 * Maps Scene Flow element types to Final Draft element types
 */
const mapElementTypeToFDX = (type: ElementType): string => {
  switch (type) {
    case 'scene-heading':
      return 'Scene Heading';
    case 'action':
      return 'Action';
    case 'character':
      return 'Character';
    case 'dialogue':
      return 'Dialogue';
    case 'parenthetical':
      return 'Parenthetical';
    case 'transition':
      return 'Transition';
    case 'note':
      return 'General';
    default:
      return 'Action';
  }
};

/**
 * Escape special characters for XML
 */
const escapeXml = (unsafe: string): string => {
  return unsafe
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
};

/**
 * Imports an FDX file and converts it to Scene Flow format
 */
export const importFromFDX = (fdxContent: string): { 
  scriptContent: ScriptContent;
  titlePageData?: TitlePageData;
} => {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(fdxContent, 'text/xml');
    
    // Check for parsing errors
    const parseError = xmlDoc.querySelector('parsererror');
    if (parseError) {
      throw new Error('Failed to parse FDX file: Invalid XML format');
    }
    
    // Extract title page data
    const titlePageData = extractTitlePageData(xmlDoc);
    
    // Extract script elements
    const elements = extractScriptElements(xmlDoc);
    
    return {
      scriptContent: { elements },
      titlePageData
    };
  } catch (error) {
    console.error('Error importing FDX file:', error);
    // Return empty script as fallback
    return {
      scriptContent: { elements: [{
        id: generateUniqueId(),
        type: 'scene-heading',
        text: 'INT. SOMEWHERE - DAY'
      }] }
    };
  }
};

/**
 * Extracts title page data from FDX XML
 */
const extractTitlePageData = (xmlDoc: Document): TitlePageData => {
  const titleElement = xmlDoc.querySelector('TitlePage > Title');
  const authorElement = xmlDoc.querySelector('TitlePage > Author');
  const adaptedByElement = xmlDoc.querySelector('TitlePage > AdaptedBy');
  const contactElement = xmlDoc.querySelector('TitlePage > Contact');
  
  return {
    title: titleElement?.textContent || 'Untitled',
    author: authorElement?.textContent || '',
    basedOn: adaptedByElement?.textContent?.replace('Based on: ', '') || '',
    contact: contactElement?.textContent || ''
  };
};

/**
 * Extracts script elements from FDX XML
 */
const extractScriptElements = (xmlDoc: Document): ScriptElement[] => {
  const paragraphElements = xmlDoc.querySelectorAll('Paragraphs > Paragraph');
  const elements: ScriptElement[] = [];
  
  paragraphElements.forEach(para => {
    const typeAttr = para.getAttribute('Type');
    const textElement = para.querySelector('Text');
    const text = textElement?.textContent || '';
    
    if (typeAttr && text) {
      elements.push({
        id: generateUniqueId(),
        type: mapFDXToElementType(typeAttr),
        text
      });
    }
  });
  
  // If no elements were extracted, create a default element
  if (elements.length === 0) {
    elements.push({
      id: generateUniqueId(),
      type: 'scene-heading',
      text: 'INT. SOMEWHERE - DAY'
    });
  }
  
  return elements;
};

/**
 * Maps Final Draft element types to Scene Flow element types
 */
const mapFDXToElementType = (fdxType: string): ElementType => {
  switch (fdxType) {
    case 'Scene Heading':
      return 'scene-heading';
    case 'Action':
      return 'action';
    case 'Character':
      return 'character';
    case 'Dialogue':
      return 'dialogue';
    case 'Parenthetical':
      return 'parenthetical';
    case 'Transition':
      return 'transition';
    case 'General':
      return 'note';
    default:
      return 'action';
  }
};
