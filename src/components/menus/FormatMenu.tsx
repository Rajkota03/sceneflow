import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarShortcut,
  MenubarCheckboxItem
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';
import { useFormat } from '@/lib/formatContext';
import { 
  Bold, 
  Italic, 
  Underline, 
  StrikeThrough, 
  AlignLeft, 
  AlignCenter, 
  AlignRight 
} from 'lucide-react';

const FormatMenu = () => {
  const { 
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
    setSpaceBefore
  } = useFormat();

  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  const handleFormat = (action: () => void, message: string) => {
    action();
    toast({
      title: "Format applied",
      description: message,
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Format</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          Elements...
          <MenubarSub>
            <MenubarSubTrigger>Change Element To</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={handleNotImplemented}>Scene Heading</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Action</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Character</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Dialogue</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Parenthetical</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Transition</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Note</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Cast List Element Options...
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Highlight Characters...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Set Font...
        </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Font</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.font === 'Courier Prime'}
              onClick={() => handleFormat(() => setFont('Courier Prime'), "Font set to Courier Prime")}
            >
              Courier Prime
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.font === 'Courier Final Draft'}
              onClick={() => handleFormat(() => setFont('Courier Final Draft'), "Font set to Courier Final Draft")}
            >
              Courier Final Draft
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.font === 'Courier New'}
              onClick={() => handleFormat(() => setFont('Courier New'), "Font set to Courier New")}
            >
              Courier New
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Size</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.fontSize === 10}
              onClick={() => handleFormat(() => setFontSize(10), "Font size set to 10pt")}
            >
              10
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.fontSize === 12}
              onClick={() => handleFormat(() => setFontSize(12), "Font size set to 12pt")}
            >
              12
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.fontSize === 14}
              onClick={() => handleFormat(() => setFontSize(14), "Font size set to 14pt")}
            >
              14
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.fontSize === 16}
              onClick={() => handleFormat(() => setFontSize(16), "Font size set to 16pt")}
            >
              16
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Style</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.isBold}
              onClick={() => handleFormat(toggleBold, formatState.isBold ? "Bold formatting removed" : "Bold formatting applied")}
            >
              <Bold className="mr-2 h-4 w-4" />
              Bold
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.isItalic}
              onClick={() => handleFormat(toggleItalic, formatState.isItalic ? "Italic formatting removed" : "Italic formatting applied")}
            >
              <Italic className="mr-2 h-4 w-4" />
              Italic
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.isUnderline}
              onClick={() => handleFormat(toggleUnderline, formatState.isUnderline ? "Underline formatting removed" : "Underline formatting applied")}
            >
              <Underline className="mr-2 h-4 w-4" />
              Underline
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.isStrikethrough}
              onClick={() => handleFormat(toggleStrikethrough, formatState.isStrikethrough ? "Strikethrough formatting removed" : "Strikethrough formatting applied")}
            >
              <StrikeThrough className="mr-2 h-4 w-4" />
              Strikethrough
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Color</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.textColor === 'black'}
              onClick={() => handleFormat(() => setTextColor('black'), "Text color set to black")}
            >
              Black
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.textColor === 'red'}
              onClick={() => handleFormat(() => setTextColor('red'), "Text color set to red")}
            >
              Red
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.textColor === 'blue'}
              onClick={() => handleFormat(() => setTextColor('blue'), "Text color set to blue")}
            >
              Blue
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.textColor === 'green'}
              onClick={() => handleFormat(() => setTextColor('green'), "Text color set to green")}
            >
              Green
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Highlight</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.highlightColor === 'yellow'}
              onClick={() => handleFormat(() => setHighlightColor(formatState.highlightColor === 'yellow' ? null : 'yellow'), 
                formatState.highlightColor === 'yellow' ? "Highlight removed" : "Highlighted in yellow")}
            >
              Yellow
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.highlightColor === 'blue'}
              onClick={() => handleFormat(() => setHighlightColor(formatState.highlightColor === 'blue' ? null : 'blue'), 
                formatState.highlightColor === 'blue' ? "Highlight removed" : "Highlighted in blue")}
            >
              Blue
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.highlightColor === 'green'}
              onClick={() => handleFormat(() => setHighlightColor(formatState.highlightColor === 'green' ? null : 'green'), 
                formatState.highlightColor === 'green' ? "Highlight removed" : "Highlighted in green")}
            >
              Green
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.highlightColor === 'pink'}
              onClick={() => handleFormat(() => setHighlightColor(formatState.highlightColor === 'pink' ? null : 'pink'), 
                formatState.highlightColor === 'pink' ? "Highlight removed" : "Highlighted in pink")}
            >
              Pink
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem onClick={handleNotImplemented}>
          TOGGLE CASE
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Alignment</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.alignment === 'left'}
              onClick={() => handleFormat(() => setAlignment('left'), "Text aligned left")}
            >
              <AlignLeft className="mr-2 h-4 w-4" />
              Left
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.alignment === 'center'}
              onClick={() => handleFormat(() => setAlignment('center'), "Text aligned center")}
            >
              <AlignCenter className="mr-2 h-4 w-4" />
              Center
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.alignment === 'right'}
              onClick={() => handleFormat(() => setAlignment('right'), "Text aligned right")}
            >
              <AlignRight className="mr-2 h-4 w-4" />
              Right
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Spacing</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.lineSpacing === 'single'}
              onClick={() => handleFormat(() => setLineSpacing('single'), "Line spacing set to single")}
            >
              Single
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.lineSpacing === '1.5'}
              onClick={() => handleFormat(() => setLineSpacing('1.5'), "Line spacing set to 1.5")}
            >
              1.5 Lines
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.lineSpacing === 'double'}
              onClick={() => handleFormat(() => setLineSpacing('double'), "Line spacing set to double")}
            >
              Double
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Space Before</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarCheckboxItem 
              checked={formatState.spaceBefore === 0}
              onClick={() => handleFormat(() => setSpaceBefore(0), "Space before set to 0pt")}
            >
              0 pt
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.spaceBefore === 6}
              onClick={() => handleFormat(() => setSpaceBefore(6), "Space before set to 6pt")}
            >
              6 pt
            </MenubarCheckboxItem>
            <MenubarCheckboxItem 
              checked={formatState.spaceBefore === 12}
              onClick={() => handleFormat(() => setSpaceBefore(12), "Space before set to 12pt")}
            >
              12 pt
            </MenubarCheckboxItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Leading</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Auto</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Tight</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Normal</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Loose</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Beat Board</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Show Beat Labels</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Show Ruler</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Snap Beats to Grid</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Dual Dialogue
          <MenubarShortcut>⌘D</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Edit Dual Dialogue
          <MenubarShortcut>⇧⌘D</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FormatMenu;
