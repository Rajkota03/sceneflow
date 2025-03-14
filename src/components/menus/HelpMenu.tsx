
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const HelpMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  const showKeyboardShortcuts = () => {
    toast({
      title: "Keyboard Shortcuts",
      description: "Common shortcuts: ⌘N (New), ⌘O (Open), ⌘S (Save), ⌘F (Find), ⌘1-6 (Element types), ⌘+ (Zoom In), ⌘- (Zoom Out), ⌘0 (Reset Zoom)",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Help</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          User Guide
        </MenubarItem>
        <MenubarItem onClick={showKeyboardShortcuts}>
          Keyboard Shortcuts
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          FAQs
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Contact Support
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default HelpMenu;
