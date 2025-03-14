
import React from 'react';
import { useFormat } from '@/lib/formatContext';

interface FormatStylerProps {
  children: React.ReactNode;
  forPrint?: boolean;
}

const FormatStyler: React.FC<FormatStylerProps> = ({ children, forPrint = false }) => {
  const { formatState } = useFormat();
  
  const style: React.CSSProperties = {
    fontFamily: formatState.font || 'Courier Prime, monospace',
    fontSize: `${formatState.fontSize}pt`,
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
    marginTop: `${formatState.spaceBefore}pt`,
    width: '100%',
    maxWidth: '8.5in',
    height: forPrint ? 'auto' : 'auto',
    minHeight: forPrint ? 'auto' : '11in',
    margin: '0 auto',
    padding: '0.5in',
    transition: 'all 0.2s ease',
    boxSizing: 'border-box' as 'border-box',
  };

  return (
    <div 
      style={style} 
      className={`script-format-styler w-full h-full flex flex-col items-center ${forPrint ? 'print-version' : 'overflow-visible'}`}
    >
      {children}
    </div>
  );
};

export default FormatStyler;
