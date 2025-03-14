
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarCheckboxItem
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const ViewMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">View</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          Show Tab Bar
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Show All Tabs
          <MenubarShortcut>⇧⌘\</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Script - Normal View
        </MenubarItem>
        <MenubarCheckboxItem checked onClick={handleNotImplemented}>
          Script - Page View
        </MenubarCheckboxItem>
        <MenubarItem onClick={handleNotImplemented}>
          Script - Speed View
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Beat Board
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Scene View
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Index Cards - Script
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Index Cards - Summary
        </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Cards Across</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>1 Card</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>2 Cards</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>3 Cards</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>4 Cards</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem disabled onClick={handleNotImplemented}>
          Show Action
        </MenubarItem>
        <MenubarItem disabled onClick={handleNotImplemented}>
          Show Scene Title
        </MenubarItem>
        <MenubarItem disabled onClick={handleNotImplemented}>
          Show Summary
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Show Alts.
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Show Invisibles
          <MenubarShortcut>⌘J</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Show Ruler
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Hide ScriptNotes
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Hide Outline Editor
          <MenubarShortcut>⇧⌘M</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Hide Outline in Script
          <MenubarShortcut>⇧⌘O</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Split Vertically
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Split Horizontally
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Swap Panels
        </MenubarItem>
        <MenubarCheckboxItem checked onClick={handleNotImplemented}>
          Unsplit Panels
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Hide Toolbar
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Customize Toolbar...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Zoom</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Zoom In</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Zoom Out</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Actual Size</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Zoom Outline Editor</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Zoom In</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Zoom Out</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Actual Size</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Enter Full Screen
          <MenubarShortcut>⌃⌘F</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Focus Mode
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Night Mode
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ViewMenu;
