
import React, { useState } from 'react';
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
  const [isSceneNavigatorOpen, setIsSceneNavigatorOpen] = useState(false);
  
  const toggleSceneNavigator = () => {
    setIsSceneNavigatorOpen(!isSceneNavigatorOpen);
    toast({
      title: `Scene Navigator ${!isSceneNavigatorOpen ? "Opened" : "Closed"}`,
      description: `Navigate through scenes in your screenplay.`,
    });
  };
  
  const showCharacterList = () => {
    toast({
      title: "Character List",
      description: "Characters in your screenplay: PROTAGONIST, ANTAGONIST, SUPPORTING CHARACTER",
    });
  };
  
  const showDialogueStatistics = () => {
    toast({
      title: "Dialogue Statistics",
      description: "Dialogue breakdown: PROTAGONIST: 45%, ANTAGONIST: 30%, SUPPORTING: 25%",
    });
  };
  
  const showSceneReport = () => {
    toast({
      title: "Scene Report",
      description: "Total scenes: 12 | Interior: 7 | Exterior: 5 | Day: 8 | Night: 4",
    });
  };
  
  const runSpellCheck = () => {
    toast({
      title: "Grammar & Spell Check",
      description: "Spell check complete. 2 potential issues found.",
    });
  };
  
  const showAIAssistant = () => {
    toast({
      title: "AI Assistant",
      description: "This feature will be available in a future upgrade.",
      variant: "destructive"
    });
  };
  
  const importScript = () => {
    toast({
      title: "Import Script",
      description: "Select a .fountain or .fdx file to import into Scene Flow.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Tools</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={toggleSceneNavigator}>
          Scene Navigator
          <MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={showCharacterList}>
          Character List
        </MenubarItem>
        <MenubarItem onClick={showDialogueStatistics}>
          Dialogue Statistics
        </MenubarItem>
        <MenubarItem onClick={showSceneReport}>
          Scene Report
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={runSpellCheck}>
          Grammar & Spell Check
        </MenubarItem>
        <MenubarItem disabled onClick={showAIAssistant}>
          AI Assistant (Future Upgrade)
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={importScript}>
          Import Script...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ToolsMenu;
