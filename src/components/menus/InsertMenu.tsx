
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const InsertMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Insert</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          Add Alt
          <MenubarShortcut>⌥⌘</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Remove Alt
          <MenubarShortcut>⌥⌘,</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          New Beat
          <MenubarShortcut>⌥⌘⏎</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Page Break
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          New Scene
          <MenubarShortcut>⌥⌘!</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Bookmark
          <MenubarShortcut>⌘\</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          ScriptNote
          <MenubarShortcut>⇧⌘K</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Label...
          <MenubarShortcut>⇧⌘L</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Image...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Non-Speaking Character
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled onClick={handleNotImplemented}>
          Send to Script
          <MenubarShortcut>⌥⌘C</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default InsertMenu;
