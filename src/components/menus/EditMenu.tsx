
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

const EditMenu = () => {
  const handleUndo = () => {
    document.execCommand('undo');
    toast({
      title: "Undo",
      description: "Last action undone",
    });
  };

  const handleRedo = () => {
    document.execCommand('redo');
    toast({
      title: "Redo",
      description: "Action redone",
    });
  };

  const handleCut = () => {
    document.execCommand('cut');
    toast({
      title: "Cut",
      description: "Selection cut to clipboard",
    });
  };

  const handleCopy = () => {
    document.execCommand('copy');
    toast({
      title: "Copy",
      description: "Selection copied to clipboard",
    });
  };

  const handlePaste = () => {
    document.execCommand('paste');
    toast({
      title: "Paste",
      description: "Content pasted from clipboard",
    });
  };

  const handleFindReplace = () => {
    toast({
      title: "Find & Replace",
      description: "Search for text in your script and replace it",
    });
  };

  const handleGoTo = () => {
    toast({
      title: "Go To",
      description: "Navigate to a specific scene or page",
    });
  };

  const handleSelectAll = () => {
    document.execCommand('selectAll');
    toast({
      title: "Select All",
      description: "All text selected",
    });
  };

  const handleSelectScene = () => {
    toast({
      title: "Select Scene",
      description: "Current scene selected",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Edit</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleUndo}>
          Undo
          <MenubarShortcut>⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleRedo}>
          Redo
          <MenubarShortcut>⇧⌘Z</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleCut}>
          Cut
          <MenubarShortcut>⌘X</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleCopy}>
          Copy
          <MenubarShortcut>⌘C</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handlePaste}>
          Paste
          <MenubarShortcut>⌘V</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleFindReplace}>
          Find & Replace...
          <MenubarShortcut>⌘F</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleGoTo}>
          Go To...
          <MenubarShortcut>⌘G</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleSelectAll}>
          Select All
          <MenubarShortcut>⌘A</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleSelectScene}>
          Select Scene
          <MenubarShortcut>⇧⌘A</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default EditMenu;
