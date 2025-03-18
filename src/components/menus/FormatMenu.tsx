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

const FormatMenu = () => {
  const { formatState, setFont, setFontSize } = useFormat();
  const [showSceneNumbers, setShowSceneNumbers] = useState(false);
  
  const handleElementChange = (elementType: ElementType) => {
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

  const handlePageBreak = () => {
    toast({
      title: "Page Break Inserted",
      description: "A manual page break has been added to the script.",
    });
  };

  const handleFontSettings = () => {
    setFont("Courier Final Draft");
    
    toast({
      title: "Font Settings Updated",
      description: `Font changed to Courier Final Draft`,
    });
  };

  const handleSpacingOptions = () => {
    const newSize = formatState.fontSize === 12 ? 14 : 12;
    setFontSize(newSize);
    
    toast({
      title: "Spacing Options Updated",
      description: `Font size changed to ${newSize}pt`,
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
        <MenubarItem onClick={handlePageBreak}>
          Page Break
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleFontSettings}>
          Font Settings...
        </MenubarItem>
        <MenubarItem onClick={handleSpacingOptions}>
          Spacing Options...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FormatMenu;
