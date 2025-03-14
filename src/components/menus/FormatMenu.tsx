
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut,
  MenubarCheckboxItem
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';
import { ElementType } from '@/lib/types';

const FormatMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };
  
  const handleElementChange = (elementType: ElementType) => {
    toast({
      title: `Changed to ${elementType}`,
      description: `The current element has been changed to ${elementType}.`,
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
        <MenubarCheckboxItem onClick={handleNotImplemented}>
          Scene Numbers
        </MenubarCheckboxItem>
        <MenubarItem onClick={handleNotImplemented}>
          Page Break
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Font Settings...
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Spacing Options...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FormatMenu;
