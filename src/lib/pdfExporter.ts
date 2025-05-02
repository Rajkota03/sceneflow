
import jsPDF from 'jspdf';
import { ScriptElement, ElementType } from './types';

// Standard Screenplay Formatting Constants (approximations in points)
const PAGE_WIDTH_PT = 612; // 8.5 inches * 72 points/inch
const PAGE_HEIGHT_PT = 792; // 11 inches * 72 points/inch
const LEFT_MARGIN_PT = 108; // 1.5 inches * 72 points/inch
const RIGHT_MARGIN_PT = 72; // 1 inch * 72 points/inch
const TOP_MARGIN_PT = 72; // 1 inch * 72 points/inch
const BOTTOM_MARGIN_PT = 72; // 1 inch * 72 points/inch
const FONT_SIZE_PT = 12;
const LINE_HEIGHT_PT = 12; // Courier 12pt is roughly 12pt line height
const LINES_PER_PAGE_ESTIMATE = 54; // Target lines per page

// Indentations from the left margin (1.5 inches)
const SCENE_HEADING_INDENT_PT = 0;
const ACTION_INDENT_PT = 0;
const CHARACTER_INDENT_PT = 158.4; // Centered approx (3.7" * 72) - 1.5" margin = 2.2" * 72
const PARENTHETICAL_INDENT_PT = 115.2; // 3.1" * 72 - 1.5" margin = 1.6" * 72
const DIALOGUE_INDENT_PT = 72; // 2.5" * 72 - 1.5" margin = 1.0" * 72
const DIALOGUE_WIDTH_PT = 252; // Approx 3.5 inches wide
const TRANSITION_INDENT_PT = 288; // Right aligned approx (5.5" * 72) - 1.5" margin = 4.0" * 72

// Available width for text within margins
const AVAILABLE_WIDTH_PT = PAGE_WIDTH_PT - LEFT_MARGIN_PT - RIGHT_MARGIN_PT;

export const exportToPdf = (elements: ScriptElement[], filename: string = 'screenplay.pdf') => {
    const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'pt',
        format: 'letter' // Standard US Letter size
    });

    // Set font - Courier is a standard PDF font
    doc.setFont('Courier', 'normal');
    doc.setFontSize(FONT_SIZE_PT);

    let currentY = TOP_MARGIN_PT;
    let currentPage = 1;
    let lineCountOnPage = 0;

    const addPageNumber = () => {
        if (currentPage > 1) { // Page numbers usually start from page 2
            doc.setFontSize(10);
            const pageNumStr = String(currentPage -1) + '.';
            const pageNumWidth = doc.getStringUnitWidth(pageNumStr) * 10 / doc.internal.scaleFactor;
            doc.text(pageNumStr, PAGE_WIDTH_PT - RIGHT_MARGIN_PT - pageNumWidth, TOP_MARGIN_PT - 30); // Position top right
            doc.setFontSize(FONT_SIZE_PT); // Reset font size
        }
    };

    const checkNewPage = (linesToAdd: number = 1) => {
        if (currentY + (linesToAdd * LINE_HEIGHT_PT) > PAGE_HEIGHT_PT - BOTTOM_MARGIN_PT) {
            addPageNumber();
            doc.addPage();
            currentPage++;
            currentY = TOP_MARGIN_PT;
            lineCountOnPage = 0;
            return true;
        }
        return false;
    };

    elements.forEach((element, index) => {
        let indentPt = 0;
        let text = element.text || '';
        let elementWidthPt = AVAILABLE_WIDTH_PT;
        let align: 'left' | 'center' | 'right' = 'left';
        let addExtraLine = false; // Add extra space after certain elements

        switch (element.type) {
            case 'scene-heading':
                indentPt = SCENE_HEADING_INDENT_PT;
                text = text.toUpperCase();
                addExtraLine = true;
                break;
            case 'action':
                indentPt = ACTION_INDENT_PT;
                addExtraLine = true;
                break;
            case 'character':
                indentPt = CHARACTER_INDENT_PT;
                text = text.toUpperCase(); 
                // Check if next element is dialogue, avoid page break between them
                if (elements[index + 1]?.type === 'dialogue') {
                    const charLines = doc.splitTextToSize(text, elementWidthPt).length;
                    const dialogueLines = doc.splitTextToSize(elements[index + 1].text || '', DIALOGUE_WIDTH_PT).length;
                    checkNewPage(charLines + dialogueLines);
                }
                break;
            case 'parenthetical':
                indentPt = PARENTHETICAL_INDENT_PT;
                break;
            case 'dialogue':
                indentPt = DIALOGUE_INDENT_PT;
                elementWidthPt = DIALOGUE_WIDTH_PT;
                addExtraLine = true;
                break;
            case 'transition':
                indentPt = TRANSITION_INDENT_PT;
                text = text.toUpperCase();
                align = 'right'; // jsPDF doesn't directly support right align with splitTextToSize easily
                addExtraLine = true;
                break;
            default:
                indentPt = ACTION_INDENT_PT; // Default to action style
        }

        const lines = doc.splitTextToSize(text, elementWidthPt);
        checkNewPage(lines.length + (addExtraLine ? 1 : 0));

        // Manual right alignment for transitions
        if (align === 'right') {
            lines.forEach((line: string) => {
                const lineWidth = doc.getStringUnitWidth(line) * FONT_SIZE_PT / doc.internal.scaleFactor;
                const lineX = PAGE_WIDTH_PT - RIGHT_MARGIN_PT - lineWidth;
                doc.text(line, lineX, currentY);
                currentY += LINE_HEIGHT_PT;
                lineCountOnPage++;
                checkNewPage(); // Check after each line for safety
            });
        } else {
            doc.text(lines, LEFT_MARGIN_PT + indentPt, currentY);
            currentY += lines.length * LINE_HEIGHT_PT;
            lineCountOnPage += lines.length;
        }

        if (addExtraLine) {
            currentY += LINE_HEIGHT_PT; // Add extra line spacing
            lineCountOnPage++;
        }
    });

    // Add page number to the last page
    addPageNumber();

    doc.save(filename);
    console.log('PDF exported:', filename);
};

