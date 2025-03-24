
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
    textAlign: formatState.alignment || 'left',
    lineHeight: formatState.lineSpacing === 'single' ? '1.2' : 
                formatState.lineSpacing === '1.5' ? '1.5' : '2',
    width: '100%',
    maxWidth: '8.5in', // Standard screenplay width
    height: forPrint || forExport ? 'auto' : 'auto',
    minHeight: forPrint || forExport ? 'auto' : '11in', // Standard screenplay height
    margin: '0 auto',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box',
    overflow: 'visible',
    position: 'relative',
    direction: 'ltr',
    unicodeBidi: 'plaintext',
    padding: forPrint || forExport ? '0' : '1in', // Standard screenplay margins
    boxShadow: isDarkMode 
      ? '0 2px 10px rgba(0,0,0,0.3)' 
      : '0 2px 10px rgba(0,0,0,0.1)',
    touchAction: 'manipulation', // Better touch handling
  };

  return (
    <div 
      style={style} 
      className={`script-format-styler w-full h-full flex flex-col items-center ${forPrint || forExport ? 'print-version' : 'overflow-visible'}`}
      data-font="courier-final-draft"
      dir="ltr"
    >
      {children}
    </div>
  );
};

export default FormatStyler;
