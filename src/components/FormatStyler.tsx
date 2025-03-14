
import React from 'react';
import { useFormat } from '@/lib/formatContext';

interface FormatStylerProps {
  children: React.ReactNode;
}

const FormatStyler: React.FC<FormatStylerProps> = ({ children }) => {
  const { formatState } = useFormat();
  
  const style = {
    fontFamily: formatState.font,
    fontSize: `${formatState.fontSize}pt`,
    fontWeight: formatState.isBold ? 'bold' : 'normal',
    fontStyle: formatState.isItalic ? 'italic' : 'normal',
    textDecoration: [
      formatState.isUnderline ? 'underline' : '',
      formatState.isStrikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    color: formatState.textColor,
    backgroundColor: formatState.highlightColor || 'transparent',
    textAlign: formatState.alignment,
    lineHeight: formatState.lineSpacing === 'single' ? '1.2' : 
                formatState.lineSpacing === '1.5' ? '1.5' : '2',
    marginTop: `${formatState.spaceBefore}pt`,
  };

  return (
    <div style={style} className="script-format-styler">
      {children}
    </div>
  );
};

export default FormatStyler;
