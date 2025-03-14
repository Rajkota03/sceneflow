
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
    try {
      document.execCommand('undo');
      toast({
        title: "Undo",
        description: "Last action undone",
      });
    } catch (error) {
      console.error("Undo failed:", error);
      toast({
        title: "Undo Failed",
        description: "The undo operation could not be completed",
        variant: "destructive"
      });
    }
  };

  const handleRedo = () => {
    try {
      document.execCommand('redo');
      toast({
        title: "Redo",
        description: "Action redone",
      });
    } catch (error) {
      console.error("Redo failed:", error);
      toast({
        title: "Redo Failed",
        description: "The redo operation could not be completed",
        variant: "destructive"
      });
    }
  };

  const handleCut = () => {
    try {
      // If there's a selection, use execCommand
      if (window.getSelection()?.toString()) {
        document.execCommand('cut');
        toast({
          title: "Cut",
          description: "Selection cut to clipboard",
        });
      } else {
        toast({
          title: "Cut",
          description: "Please select text first",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Cut failed:", error);
      toast({
        title: "Cut Failed",
        description: "The cut operation could not be completed",
        variant: "destructive"
      });
    }
  };

  const handleCopy = () => {
    try {
      // If there's a selection, use execCommand
      if (window.getSelection()?.toString()) {
        document.execCommand('copy');
        toast({
          title: "Copy",
          description: "Selection copied to clipboard",
        });
      } else {
        toast({
          title: "Copy",
          description: "Please select text first",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error("Copy failed:", error);
      toast({
        title: "Copy Failed",
        description: "The copy operation could not be completed",
        variant: "destructive"
      });
    }
  };

  const handlePaste = async () => {
    try {
      // Try to use the Clipboard API first
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        // Insert at cursor position, if active element is a text input
        const activeElement = document.activeElement as HTMLTextAreaElement;
        if (activeElement && 
            (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
          const start = activeElement.selectionStart || 0;
          const end = activeElement.selectionEnd || 0;
          const value = activeElement.value;
          activeElement.value = value.substring(0, start) + text + value.substring(end);
          // Set cursor position after pasted text
          activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
          // Trigger input event to update state
          const event = new Event('input', { bubbles: true });
          activeElement.dispatchEvent(event);
        }
      } else {
        // Fallback to execCommand
        document.execCommand('paste');
      }
      toast({
        title: "Paste",
        description: "Content pasted from clipboard",
      });
    } catch (error) {
      console.error("Paste failed:", error);
      // Fallback to execCommand if Clipboard API fails
      try {
        document.execCommand('paste');
        toast({
          title: "Paste",
          description: "Content pasted from clipboard",
        });
      } catch (fallbackError) {
        console.error("Paste fallback failed:", fallbackError);
        toast({
          title: "Paste Failed",
          description: "The paste operation could not be completed. Please try using keyboard shortcut Ctrl+V or Cmd+V.",
          variant: "destructive"
        });
      }
    }
  };

  const handleFindReplace = () => {
    toast({
      title: "Find & Replace",
      description: "Search for text in your script and replace it",
    });
    // Open a dialog for find and replace
    const textToFind = prompt("Enter text to find:");
    if (textToFind) {
      const replaceWith = prompt("Replace with:");
      if (replaceWith !== null) { // User clicked OK
        // Find all active elements and replace text
        const textareas = document.querySelectorAll('textarea');
        let replacementsCount = 0;
        
        textareas.forEach(textarea => {
          if (textarea.value.includes(textToFind)) {
            // Use split and join instead of replaceAll for better compatibility
            const newValue = textarea.value.split(textToFind).join(replaceWith);
            textarea.value = newValue;
            
            // Trigger input event to update state
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
            
            // Count replacements (approximately)
            const occurrences = (textarea.value.match(new RegExp(textToFind, 'g')) || []).length;
            replacementsCount += occurrences;
          }
        });
        
        toast({
          title: "Replace Complete",
          description: `Made ${replacementsCount} replacements`,
        });
      }
    }
  };

  const handleGoTo = () => {
    toast({
      title: "Go To",
      description: "Navigate to a specific scene or page",
    });
    
    // Prompt for scene number
    const sceneInput = prompt("Enter scene number to go to:");
    if (sceneInput) {
      const sceneNumber = parseInt(sceneInput);
      if (!isNaN(sceneNumber) && sceneNumber > 0) {
        // Find scene headings
        const sceneHeadings = document.querySelectorAll('.scene-heading');
        if (sceneNumber <= sceneHeadings.length) {
          const targetScene = sceneHeadings[sceneNumber - 1];
          if (targetScene) {
            targetScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
            // Try to focus on the textarea
            const textarea = targetScene.querySelector('textarea');
            if (textarea) {
              textarea.focus();
            }
            toast({
              title: "Navigation",
              description: `Moved to scene ${sceneNumber}`,
            });
          }
        } else {
          toast({
            title: "Navigation Error",
            description: `Scene ${sceneNumber} not found. The script only has ${sceneHeadings.length} scenes.`,
            variant: "destructive"
          });
        }
      } else {
        toast({
          title: "Invalid Input",
          description: "Please enter a valid scene number",
          variant: "destructive"
        });
      }
    }
  };

  const handleSelectAll = () => {
    try {
      // Focus on the active element if it's a text input
      const activeElement = document.activeElement as HTMLTextAreaElement;
      if (activeElement && 
          (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
        activeElement.select();
      } else {
        document.execCommand('selectAll');
      }
      toast({
        title: "Select All",
        description: "All text selected",
      });
    } catch (error) {
      console.error("Select all failed:", error);
      toast({
        title: "Select All Failed",
        description: "The select all operation could not be completed",
        variant: "destructive"
      });
    }
  };

  const handleSelectScene = () => {
    // Find the active element
    const activeElement = document.activeElement as HTMLElement;
    if (!activeElement) {
      toast({
        title: "Select Scene",
        description: "No active element found",
        variant: "destructive"
      });
      return;
    }
    
    // Find the current scene element (closest scene-heading ancestor or previous scene-heading)
    let sceneHeading = activeElement.closest('.scene-heading');
    if (!sceneHeading) {
      // Look for the previous scene heading
      let currentElement = activeElement;
      while (currentElement && !sceneHeading) {
        currentElement = currentElement.previousElementSibling as HTMLElement;
        if (currentElement && currentElement.classList.contains('scene-heading')) {
          sceneHeading = currentElement;
        }
      }
    }
    
    if (sceneHeading) {
      // Find all elements until the next scene heading
      const sceneElements = [];
      let nextElement = sceneHeading as HTMLElement;
      sceneElements.push(nextElement);
      
      while (nextElement.nextElementSibling) {
        nextElement = nextElement.nextElementSibling as HTMLElement;
        if (nextElement.classList.contains('scene-heading')) {
          break;
        }
        sceneElements.push(nextElement);
      }
      
      // Select all text in these elements
      const selection = window.getSelection();
      if (selection) {
        selection.removeAllRanges();
        
        sceneElements.forEach(element => {
          const textarea = element.querySelector('textarea');
          if (textarea) {
            const range = document.createRange();
            range.selectNodeContents(textarea);
            selection.addRange(range);
          }
        });
      }
      
      toast({
        title: "Select Scene",
        description: "Current scene selected",
      });
    } else {
      toast({
        title: "Select Scene",
        description: "No scene found",
        variant: "destructive"
      });
    }
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
