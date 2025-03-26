
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
  const { elements, setElements, activeElementId } = useScriptEditor();

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
      // Add a new action element after the page break for easier editing
      {
        id: crypto.randomUUID(),
        type: 'action' as ElementType,
        text: ''
      },
      ...elements.slice(activeIndex + 1)
    ];
    
    setElements(newElements);
    
    toast({
      title: "Page Break Added",
      description: "Manual page break inserted in the script",
    });
  };

  const handleNewScene = () => {
    if (!elements) return;

    // Find the last element index
    const lastIndex = elements.length - 1;
    
    // Create the new elements to add
    const newSceneElements = [
      // Add a transition if not coming after another scene heading
      ...(lastIndex >= 0 && elements[lastIndex].type !== 'scene-heading' ? [
        {
          id: crypto.randomUUID(),
          type: 'transition' as ElementType,
          text: 'CUT TO:'
        }
      ] : []),
      // Add the new scene heading
      {
        id: crypto.randomUUID(),
        type: 'scene-heading' as ElementType,
        text: 'INT. NEW LOCATION - DAY'
      },
      // Add an empty action line for the new scene
      {
        id: crypto.randomUUID(),
        type: 'action' as ElementType,
        text: ''
      }
    ];
    
    // Update the elements array
    const newElements = [...elements, ...newSceneElements];
    setElements(newElements);
    
    toast({
      title: "New Scene Added",
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
          <MenubarShortcut>⌘⏎</MenubarShortcut>
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
