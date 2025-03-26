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
import { useScriptEditor } from '../script-editor/ScriptEditorProvider';
import { ElementType } from '@/lib/types';

const InsertMenu = () => {
  const handleAddAlt = () => {
    toast({
      title: "Add Alt",
      description: "Alternative dialogue or action added",
    });
  };

  const handleRemoveAlt = () => {
    toast({
      title: "Remove Alt",
      description: "Alternative removed",
    });
  };

  const handleNewBeat = () => {
    toast({
      title: "New Beat",
      description: "Beat added to the script",
    });
  };

  const handlePageBreak = () => {
    const { elements, setElements } = useScriptEditor();
    if (!elements) return;

    const newElements = [...elements];
    // Insert a special marker element that forces a page break
    newElements.push({
      id: crypto.randomUUID(),
      type: 'action' as ElementType,
      text: '',
      pageBreak: true
    });
    
    setElements(newElements);
    
    toast({
      title: "Page Break",
      description: "Manual page break inserted",
    });
  };

  const handleNewScene = () => {
    toast({
      title: "New Scene",
      description: "New scene added to the script",
    });
  };

  const handleBookmark = () => {
    toast({
      title: "Bookmark",
      description: "Bookmark added at the current position",
    });
  };

  const handleScriptNote = () => {
    toast({
      title: "Script Note",
      description: "Script note added for the selected text",
    });
  };

  const handleLabel = () => {
    toast({
      title: "Label",
      description: "Label added to the current element",
    });
  };

  const handleImage = () => {
    toast({
      title: "Insert Image",
      description: "Image will be inserted into the script",
    });
  };

  const handleNonSpeakingCharacter = () => {
    toast({
      title: "Non-Speaking Character",
      description: "Non-speaking character added to the scene",
    });
  };

  const handleSendToScript = () => {
    toast({
      title: "Send to Script",
      description: "This feature will be available in a future update",
      variant: "destructive"
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Insert</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleAddAlt}>
          Add Alt
          <MenubarShortcut>⌥⌘.</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleRemoveAlt}>
          Remove Alt
          <MenubarShortcut>⌥⌘,</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNewBeat}>
          New Beat
          <MenubarShortcut>⌥⌘⏎</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handlePageBreak}>
          Page Break
        </MenubarItem>
        <MenubarItem onClick={handleNewScene}>
          New Scene
          <MenubarShortcut>⌥⌘!</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleBookmark}>
          Bookmark
          <MenubarShortcut>⌘\</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleScriptNote}>
          ScriptNote
          <MenubarShortcut>⇧⌘K</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleLabel}>
          Label...
          <MenubarShortcut>⇧⌘L</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleImage}>
          Image...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNonSpeakingCharacter}>
          Non-Speaking Character
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem disabled onClick={handleSendToScript}>
          Send to Script
          <MenubarShortcut>⌥⌘C</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default InsertMenu;
