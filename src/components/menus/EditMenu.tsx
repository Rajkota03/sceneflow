
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
import TitlePageEditor, { TitlePageData } from '@/components/TitlePageEditor';

interface EditMenuProps {
  onTitlePage?: () => void;
  onEditTitlePage?: (data: TitlePageData) => void;
  titlePageData?: TitlePageData;
  showTitlePage?: boolean;
  onToggleTitlePage?: () => void;
}

const EditMenu: React.FC<EditMenuProps> = ({ 
  onTitlePage, 
  onEditTitlePage, 
  titlePageData,
  showTitlePage = false,
  onToggleTitlePage
}) => {
  const [showTitlePageEditor, setShowTitlePageEditor] = React.useState(false);
  
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
      if (navigator.clipboard) {
        const text = await navigator.clipboard.readText();
        const activeElement = document.activeElement as HTMLTextAreaElement;
        if (activeElement && 
            (activeElement.tagName === 'TEXTAREA' || activeElement.tagName === 'INPUT')) {
          const start = activeElement.selectionStart || 0;
          const end = activeElement.selectionEnd || 0;
          const value = activeElement.value;
          activeElement.value = value.substring(0, start) + text + value.substring(end);
          activeElement.selectionStart = activeElement.selectionEnd = start + text.length;
          const event = new Event('input', { bubbles: true });
          activeElement.dispatchEvent(event);
        }
      } else {
        document.execCommand('paste');
      }
      toast({
        title: "Paste",
        description: "Content pasted from clipboard",
      });
    } catch (error) {
      console.error("Paste failed:", error);
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
    const textToFind = prompt("Enter text to find:");
    if (textToFind) {
      const replaceWith = prompt("Replace with:");
      if (replaceWith !== null) {
        const textareas = document.querySelectorAll('textarea');
        let replacementsCount = 0;
        
        textareas.forEach(textarea => {
          if (textarea.value.includes(textToFind)) {
            const newValue = textarea.value.split(textToFind).join(replaceWith);
            textarea.value = newValue;
            
            const event = new Event('input', { bubbles: true });
            textarea.dispatchEvent(event);
            
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
    
    const sceneInput = prompt("Enter scene number to go to:");
    if (sceneInput) {
      const sceneNumber = parseInt(sceneInput);
      if (!isNaN(sceneNumber) && sceneNumber > 0) {
        const sceneHeadings = document.querySelectorAll('.scene-heading');
        if (sceneNumber <= sceneHeadings.length) {
          const targetScene = sceneHeadings[sceneNumber - 1];
          if (targetScene) {
            targetScene.scrollIntoView({ behavior: 'smooth', block: 'center' });
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

  const handleTitlePage = () => {
    setShowTitlePageEditor(true);
  };

  const handleSaveTitlePage = (data: TitlePageData) => {
    if (onEditTitlePage) {
      onEditTitlePage(data);
    }
  };

  return (
    <>
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
          <MenubarCheckboxItem 
            checked={showTitlePage}
            onClick={onToggleTitlePage}
          >
            Show Title Page
          </MenubarCheckboxItem>
          <MenubarItem onClick={handleTitlePage}>
            Edit Title Page...
            <MenubarShortcut>⌘T</MenubarShortcut>
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>

      {titlePageData && (
        <TitlePageEditor
          isOpen={showTitlePageEditor}
          onClose={() => setShowTitlePageEditor(false)}
          initialData={titlePageData}
          onSave={handleSaveTitlePage}
        />
      )}
    </>
  );
};

export default EditMenu;
