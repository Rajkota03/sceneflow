
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
  MenubarSubTrigger
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const EditMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          Undo Typing
          <MenubarShortcut>⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem disabled onClick={handleNotImplemented}>
          Can't Redo
          <MenubarShortcut>⇧⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Cut
          <MenubarShortcut>⌘X</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Copy
          <MenubarShortcut>⌘C</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Paste
          <MenubarShortcut>⌘V</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Delete
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Select All
          <MenubarShortcut>⌘A</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Select Scene
          <MenubarShortcut>⇧⌘A</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Track Changes
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Find...
          <MenubarShortcut>⌘F</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Go To...
          <MenubarShortcut>⌘G</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Find Selection
          <MenubarShortcut>⇧⌘F</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Replace Character...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          AutoFill
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Start Dictation
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Emoji & Symbols
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default EditMenu;
