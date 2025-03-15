
import React, { createContext, useContext, useState, ReactNode } from 'react';

interface FormatState {
  font: string;
  fontSize: number;
  isBold: boolean;
  isItalic: boolean;
  isUnderline: boolean;
  isStrikethrough: boolean;
  textColor: string;
  highlightColor: string | null;
  alignment: 'left' | 'center' | 'right';
  lineSpacing: 'single' | '1.5' | 'double';
  spaceBefore: number; // in pt
  zoomLevel: number;
}

interface FormatContextType {
  formatState: FormatState;
  setFont: (font: string) => void;
  setFontSize: (size: number) => void;
  toggleBold: () => void;
  toggleItalic: () => void;
  toggleUnderline: () => void;
  toggleStrikethrough: () => void;
  setTextColor: (color: string) => void;
  setHighlightColor: (color: string | null) => void;
  setAlignment: (alignment: 'left' | 'center' | 'right') => void;
  setLineSpacing: (spacing: 'single' | '1.5' | 'double') => void;
  setSpaceBefore: (space: number) => void;
  zoomIn: () => void;
  zoomOut: () => void;
  resetZoom: () => void;
}

const initialFormatState: FormatState = {
  font: 'Courier Final Draft',
  fontSize: 12,
  isBold: false,
  isItalic: false,
  isUnderline: false,
  isStrikethrough: false,
  textColor: 'black',
  highlightColor: null,
  alignment: 'left',
  lineSpacing: 'single',
  spaceBefore: 0,
  zoomLevel: 1,
};

const FormatContext = createContext<FormatContextType | undefined>(undefined);

export const FormatProvider = ({ children }: { children: ReactNode }) => {
  const [formatState, setFormatState] = useState<FormatState>(initialFormatState);

  const setFont = (font: string) => {
    setFormatState(prev => ({ ...prev, font }));
  };

  const setFontSize = (fontSize: number) => {
    setFormatState(prev => ({ ...prev, fontSize }));
  };

  const toggleBold = () => {
    setFormatState(prev => ({ ...prev, isBold: !prev.isBold }));
  };

  const toggleItalic = () => {
    setFormatState(prev => ({ ...prev, isItalic: !prev.isItalic }));
  };

  const toggleUnderline = () => {
    setFormatState(prev => ({ ...prev, isUnderline: !prev.isUnderline }));
  };

  const toggleStrikethrough = () => {
    setFormatState(prev => ({ ...prev, isStrikethrough: !prev.isStrikethrough }));
  };

  const setTextColor = (textColor: string) => {
    setFormatState(prev => ({ ...prev, textColor }));
  };

  const setHighlightColor = (highlightColor: string | null) => {
    setFormatState(prev => ({ ...prev, highlightColor }));
  };

  const setAlignment = (alignment: 'left' | 'center' | 'right') => {
    setFormatState(prev => ({ ...prev, alignment }));
  };

  const setLineSpacing = (lineSpacing: 'single' | '1.5' | 'double') => {
    setFormatState(prev => ({ ...prev, lineSpacing }));
  };

  const setSpaceBefore = (spaceBefore: number) => {
    setFormatState(prev => ({ ...prev, spaceBefore }));
  };

  const zoomIn = () => {
    setFormatState(prev => ({ 
      ...prev, 
      zoomLevel: Math.min(prev.zoomLevel + 0.1, 1.5) 
    }));
  };

  const zoomOut = () => {
    setFormatState(prev => ({ 
      ...prev, 
      zoomLevel: Math.max(prev.zoomLevel - 0.1, 0.5) 
    }));
  };

  const resetZoom = () => {
    setFormatState(prev => ({ ...prev, zoomLevel: 1 }));
  };

  return (
    <FormatContext.Provider
      value={{
        formatState,
        setFont,
        setFontSize,
        toggleBold,
        toggleItalic,
        toggleUnderline,
        toggleStrikethrough,
        setTextColor,
        setHighlightColor,
        setAlignment,
        setLineSpacing,
        setSpaceBefore,
        zoomIn,
        zoomOut,
        resetZoom
      }}
    >
      {children}
    </FormatContext.Provider>
  );
};

export const useFormat = (): FormatContextType => {
  const context = useContext(FormatContext);
  if (context === undefined) {
    throw new Error('useFormat must be used within a FormatProvider');
  }
  return context;
};
