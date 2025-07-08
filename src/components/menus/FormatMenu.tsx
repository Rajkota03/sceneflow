
import React, { useState } from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';
import { ElementType } from '@/lib/types';
import { useFormat } from '@/lib/formatContext';
import { useScriptEditor } from '../script-editor/ScriptEditorProvider';


const FormatMenu = () => {
  const { formatState, setFont, setFontSize, setLineSpacing } = useFormat();
  const { activeElementId, changeElementType, elements, setElements } = useScriptEditor();
  const [showSceneNumbers, setShowSceneNumbers] = useState(false);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  
  const handleElementChange = (elementType: ElementType) => {
    if (!activeElementId) {
      toast({
        title: "No element selected",
        description: "Please select an element first",
        variant: "destructive"
      });
      return;
    }
    
    changeElementType(activeElementId, elementType);
    
    toast({
      title: `Changed to ${elementType}`,
      description: `The current element has been changed to ${elementType}.`,
    });
  };

  const toggleSceneNumbers = () => {
    setShowSceneNumbers(!showSceneNumbers);
    toast({
      title: `Scene Numbers ${!showSceneNumbers ? "Enabled" : "Disabled"}`,
      description: `Scene numbers are now ${!showSceneNumbers ? "visible" : "hidden"} in the script.`,
    });
  };

  const togglePageNumbers = () => {
    setShowPageNumbers(!showPageNumbers);
    toast({
      title: `Page Numbers ${!showPageNumbers ? "Enabled" : "Disabled"}`,
      description: `Page numbers are now ${!showPageNumbers ? "visible" : "hidden"} in the script.`,
    });
  };

  const handlePageBreak = () => {
    if (!elements || !activeElementId) {
      toast({
        title: "No element selected",
        description: "Please select an element first",
        variant: "destructive"
      });
      return;
    }
    
    // Find the index of the active element
    const activeIndex = elements.findIndex(element => element.id === activeElementId);
    if (activeIndex === -1) return;
    
    // Create a new array with a page break inserted after the active element
    const newElements = [
      ...elements.slice(0, activeIndex + 1),
      {
        id: crypto.randomUUID(),
        type: 'action' as ElementType,
        text: '',
        pageBreak: true
      },
      ...elements.slice(activeIndex + 1)
    ];
    
    setElements(newElements);
    
    toast({
      title: "Page Break Inserted",
      description: "A manual page break has been added to the script.",
    });
  };

  const handleFontSettings = () => {
    // Industry standard fonts for screenplays
    const fonts = ["Courier Prime", "Courier New", "Courier Final Draft"];
    const randomFont = fonts[Math.floor(Math.random() * fonts.length)];
    setFont(randomFont);
    
    toast({
      title: "Font Settings Updated",
      description: `Font changed to ${randomFont}`,
    });
  };

  const handleSpacingOptions = () => {
    // Industry standard is 12pt
    setFontSize(12);
    
    // Set line spacing to industry standard (1.2)
    setLineSpacing('single');
    
    toast({
      title: "Spacing Updated to Industry Standard",
      description: "Font size set to 12pt with single (1.2) line spacing",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Format</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={() => handleElementChange('scene-heading')}>
          Scene Heading
          <MenubarShortcut>⌘1</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('action')}>
          Action
          <MenubarShortcut>⌘2</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('character')}>
          Character
          <MenubarShortcut>⌘3</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('dialogue')}>
          Dialogue
          <MenubarShortcut>⌘4</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('parenthetical')}>
          Parenthetical
          <MenubarShortcut>⌘5</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={() => handleElementChange('transition')}>
          Transition
          <MenubarShortcut>⌘6</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarCheckboxItem checked={showSceneNumbers} onClick={toggleSceneNumbers}>
          Scene Numbers
        </MenubarCheckboxItem>
        <MenubarCheckboxItem checked={showPageNumbers} onClick={togglePageNumbers}>
          Page Numbers
        </MenubarCheckboxItem>
        <MenubarItem onClick={handlePageBreak}>
          Page Break
          <MenubarShortcut>⌘⏎</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Screenplay Format</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleFontSettings}>
              Industry Standard Font
            </MenubarItem>
            <MenubarItem onClick={handleSpacingOptions}>
              Industry Standard Spacing
            </MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FormatMenu;
