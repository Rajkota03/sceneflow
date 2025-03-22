
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { ScriptContent, TitlePageData } from '@/lib/types';
import { calculatePages } from './elementStyles';

interface PDFExportOptions {
  includePageNumbers?: boolean;
  includeSceneNumbers?: boolean;
  includeTitle?: boolean;
  pageSize?: 'letter' | 'a4';
}

/**
 * Export script content directly to PDF
 */
export const exportScriptToPDF = async (
  scriptContentElement: HTMLElement,
  includePageNumbers: boolean = true,
  fileName: string = 'screenplay'
): Promise<void> => {
  try {
    const canvas = await html2canvas(scriptContentElement, {
      scale: 2,
      useCORS: true,
      logging: false
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'px',
      format: 'letter'
    });
    
    // Calculate dimensions to maintain aspect ratio
    const imgWidth = pdf.internal.pageSize.getWidth();
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, imgWidth, imgHeight);
    pdf.save(`${fileName}.pdf`);
    
    return;
  } catch (error) {
    console.error('PDF export error:', error);
    throw error;
  }
};

/**
 * Generates a PDF from the screenplay content
 */
export const generatePDF = async (
  scriptContent: ScriptContent,
  titlePageData?: TitlePageData,
  options: PDFExportOptions = {}
): Promise<Blob> => {
  const {
    includePageNumbers = true,
    includeSceneNumbers = false,
    includeTitle = true,
    pageSize = 'letter'
  } = options;
  
  // Use jsPDF to create a new document
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'in',
    format: pageSize === 'letter' ? [8.5, 11] : 'a4'
  });
  
  // Set the font to match Final Draft's Courier font
  doc.setFont('Courier', 'normal');
  
  // Calculate the number of pages for the script
  const totalPages = calculatePages(scriptContent.elements);
  
  // If we have a title page, add it
  if (titlePageData && includeTitle) {
    await addTitlePage(doc, titlePageData);
  }
  
  // Format and add each script element
  let currentPage = includeTitle ? 2 : 1;
  let yPosition = 1; // Start 1 inch from the top
  const lineHeight = 0.2; // Equivalent to 1.2 line height in 12pt font
  
  // Add script content
  for (const element of scriptContent.elements) {
    const { text, type } = element;
    
    // Format text based on element type
    doc.setFont('Courier', type === 'scene-heading' || type === 'character' || type === 'transition' ? 'bold' : 'normal');
    
    // Set text alignment and margins based on element type
    let xPosition = 1.5; // Default left margin
    let maxWidth = 6; // Default width
    
    switch (type) {
      case 'scene-heading':
        doc.setFont('Courier', 'bold');
        doc.text(text.toUpperCase(), xPosition, yPosition);
        break;
      case 'character':
        xPosition = 3.5;
        doc.setFont('Courier', 'bold');
        doc.text(text.toUpperCase(), xPosition, yPosition);
        break;
      case 'dialogue':
        xPosition = 2.5;
        maxWidth = 3.5;
        doc.text(text, xPosition, yPosition, { maxWidth });
        break;
      case 'parenthetical':
        xPosition = 3;
        maxWidth = 2.5;
        doc.setFont('Courier', 'italic');
        doc.text(text, xPosition, yPosition, { maxWidth });
        break;
      case 'transition':
        xPosition = 5.5;
        doc.setFont('Courier', 'bold');
        doc.text(text.toUpperCase(), xPosition, yPosition, { align: 'right' });
        break;
      default: // action
        doc.text(text, xPosition, yPosition, { maxWidth });
        break;
    }
    
    // Add page number if needed
    if (includePageNumbers) {
      doc.setFont('Courier', 'normal');
      doc.text(String(currentPage), 8, 0.5, { align: 'right' });
    }
    
    // Calculate text height and advance yPosition
    const textHeight = calculateTextHeight(text, type, maxWidth);
    yPosition += textHeight * lineHeight;
    
    // Check if we need a new page
    if (yPosition > 10) { // 10 inches is close to the bottom of the page
      doc.addPage();
      currentPage++;
      yPosition = 1;
      
      if (includePageNumbers) {
        doc.setFont('Courier', 'normal');
        doc.text(String(currentPage), 8, 0.5, { align: 'right' });
      }
    }
  }
  
  return doc.output('blob');
};

/**
 * Adds a title page to the PDF
 */
const addTitlePage = async (doc: jsPDF, titlePageData: TitlePageData): Promise<void> => {
  // Center the title on the page
  doc.setFont('Courier', 'bold');
  doc.setFontSize(14);
  
  // Position title 1/3 of the way down the page
  const titleY = 4;
  doc.text(titlePageData.title || 'Untitled', 4.25, titleY, { align: 'center' });
  
  // Add "Written by" and author
  doc.setFontSize(12);
  doc.setFont('Courier', 'normal');
  doc.text('Written by', 4.25, titleY + 1, { align: 'center' });
  doc.text(titlePageData.author || '', 4.25, titleY + 1.5, { align: 'center' });
  
  // Add "Based on" if available
  if (titlePageData.basedOn) {
    doc.text('Based on:', 4.25, titleY + 2.5, { align: 'center' });
    doc.text(titlePageData.basedOn, 4.25, titleY + 3, { align: 'center' });
  }
  
  // Add contact information in bottom left
  if (titlePageData.contact) {
    doc.text(titlePageData.contact, 1.5, 9.5);
  }
  
  // Add a new page for the script content
  doc.addPage();
};

/**
 * Calculates the height of text based on element type and width
 */
const calculateTextHeight = (text: string, type: string, maxWidth: number): number => {
  // Simple calculation based on character count and available width
  // In a real implementation, this would be more sophisticated
  const charsPerLine = maxWidth * 6; // ~6 chars per inch in 12pt Courier
  const lines = Math.ceil(text.length / charsPerLine) || 1;
  
  // Add extra spacing for certain element types
  switch (type) {
    case 'scene-heading':
    case 'transition':
      return lines + 1; // Extra space after scene headings and transitions
    default:
      return lines;
  }
};
