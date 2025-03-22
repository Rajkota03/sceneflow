
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { useTheme } from '@/lib/themeContext';

interface FormatStylerProps {
  children: React.ReactNode;
  forPrint?: boolean;
  forExport?: boolean;
  currentPage?: number;
}

const FormatStyler: React.FC<FormatStylerProps> = ({
  children,
  forPrint = false,
  forExport = false,
  currentPage = 1
}) => {
  const { formatState } = useFormat();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Standard Final Draft page styling (not element styling)
  const style: React.CSSProperties = {
    fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
    fontSize: '12pt',
    fontWeight: formatState.isBold ? 'bold' : 'normal',
    fontStyle: formatState.isItalic ? 'italic' : 'normal',
    textDecoration: [
      formatState.isUnderline ? 'underline' : '', 
      formatState.isStrikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    color: isDarkMode ? '#F6F6F7' : formatState.textColor || '#000000',
    backgroundColor: isDarkMode ? '#1A1F2C' : 'white',
    width: '8.5in', // US Letter width - Final Draft standard
    height: forPrint || forExport ? '11in' : 'auto',
    minHeight: forPrint || forExport ? '11in' : '11in',
    margin: '0 auto',
    padding: '1in', // Standard 1-inch margins all around
    boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
    border: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
    position: 'relative',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    // Line spacing based on format state
    lineHeight: formatState.lineSpacing === 'single' ? '1.0' : 
                formatState.lineSpacing === '1.5' ? '1.5' : '2.0',
    // Force LTR direction for screenplay text - fixing direction issues
    direction: 'ltr',
    // Removed unicodeBidi which was causing reversal issues
    overflowX: 'hidden', // Prevent horizontal overflow
    overflowWrap: 'break-word', // Break words to prevent overflow
    wordWrap: 'break-word', // For better browser compatibility
    maxWidth: '100%' // Ensure it doesn't exceed container width
  };

  // Add a page number in Final Draft style
  const pageNumberStyle: React.CSSProperties = {
    position: 'absolute',
    top: '0.5in',
    right: '1in',
    fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
    fontSize: '12pt',
    color: isDarkMode ? '#aaa' : '#666',
    pointerEvents: 'none' // Don't block interaction with the page number
  };

  return (
    <div style={style} className="format-styler" dir="ltr">
      {children}
      {(forPrint || forExport || currentPage > 0) && (
        <div style={pageNumberStyle}>{currentPage}</div>
      )}
    </div>
  );
};

export default FormatStyler;
