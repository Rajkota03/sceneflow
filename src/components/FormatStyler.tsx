
import React from 'react';
import { useFormat } from '@/lib/formatContext';
import { useTheme } from '@/lib/themeContext';

interface FormatStylerProps {
  children: React.ReactNode;
}

const FormatStyler: React.FC<FormatStylerProps> = ({
  children
}) => {
  const { formatState } = useFormat();
  const { theme } = useTheme();
  const isDarkMode = theme === 'dark';
  
  // Simplified styling without Final Draft specific formatting
  const style: React.CSSProperties = {
    fontFamily: '"Courier Prime", monospace',
    fontSize: '12pt',
    fontWeight: formatState.isBold ? 'bold' : 'normal',
    fontStyle: formatState.isItalic ? 'italic' : 'normal',
    textDecoration: [
      formatState.isUnderline ? 'underline' : '', 
      formatState.isStrikethrough ? 'line-through' : ''
    ].filter(Boolean).join(' '),
    color: isDarkMode ? '#F6F6F7' : formatState.textColor || '#000000',
    backgroundColor: isDarkMode ? '#1A1F2C' : 'white',
    width: '100%',
    padding: '1rem',
    boxShadow: isDarkMode ? '0 4px 12px rgba(0,0,0,0.4)' : '0 4px 12px rgba(0,0,0,0.15)',
    border: `1px solid ${isDarkMode ? '#333' : '#ddd'}`,
    position: 'relative',
    boxSizing: 'border-box',
    transition: 'all 0.2s ease',
    lineHeight: formatState.lineSpacing === 'single' ? '1.0' : 
                formatState.lineSpacing === '1.5' ? '1.5' : '2.0',
    direction: 'ltr',
    overflowX: 'hidden',
    overflowWrap: 'break-word',
    wordWrap: 'break-word',
    maxWidth: '100%'
  };

  return (
    <div style={style} className="format-styler" dir="ltr">
      {children}
    </div>
  );
};

export default FormatStyler;
