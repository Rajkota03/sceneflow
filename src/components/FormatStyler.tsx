
import React from 'react';
import { useFormat } from '@/lib/formatContext';

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
  
  const style: React.CSSProperties = {
    fontFamily: '"Courier Final Draft", "Courier Prime", monospace',
    fontSize: '12pt',
    fontWeight: formatState.isBold ? 'bold' : 'normal',
    fontStyle: formatState.isItalic ? 'italic' : 'normal',
    textDecoration: [
      formatState.isUnderline ? 'underline' : '',
      formatState.isStrikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    color: formatState.textColor || '#000000',
    backgroundColor: formatState.highlightColor || 'transparent',
    textAlign: formatState.alignment || 'left',
    lineHeight: formatState.lineSpacing === 'single' ? '1.2' : 
                formatState.lineSpacing === '1.5' ? '1.5' : '2',
    width: '100%',
    maxWidth: '8.5in',
    height: forPrint || forExport ? 'auto' : 'auto',
    minHeight: forPrint || forExport ? 'auto' : '11in',
    margin: '0 auto',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as 'border-box',
    overflow: 'visible',
    position: 'relative',
  };

  return (
    <div 
      style={style} 
      className={`script-format-styler w-full h-full flex flex-col items-center ${forPrint || forExport ? 'print-version' : 'overflow-visible'}`}
    >
      {children}
    </div>
  );
};

export default FormatStyler;
