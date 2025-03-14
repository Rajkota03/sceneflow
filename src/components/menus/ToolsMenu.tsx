
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

const ToolsMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Tools</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          Scene Navigator
          <MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Character List
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Dialogue Statistics
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Scene Report
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Grammar & Spell Check
        </MenubarItem>
        <MenubarItem disabled onClick={handleNotImplemented}>
          AI Assistant (Future Upgrade)
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Import Script...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ToolsMenu;
