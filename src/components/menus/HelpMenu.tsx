
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const HelpMenu = () => {
  const showKeyboardShortcuts = () => {
    toast({
      title: "Keyboard Shortcuts",
      description: "Common shortcuts: ⌘N (New), ⌘O (Open), ⌘S (Save), ⌘F (Find), ⌘1-6 (Element types), ⌘+ (Zoom In), ⌘- (Zoom Out), ⌘0 (Reset Zoom)",
    });
  };

  const showUserGuide = () => {
    toast({
      title: "User Guide",
      description: "Scene Flow is a screenplay editor that helps you write professional scripts with proper formatting. Use the menus above to format your text and navigate your screenplay.",
    });
  };

  const showFAQs = () => {
    toast({
      title: "Frequently Asked Questions",
      description: "Q: How do I format dialogue? A: Write a character name, press Enter, and start typing. Q: How do I save my script? A: Use ⌘S or click File > Save.",
    });
  };

  const contactSupport = () => {
    toast({
      title: "Contact Support",
      description: "For help or to report issues, email support@sceneflow.com or visit our support forum at sceneflow.com/support",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Help</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={showUserGuide}>
          User Guide
        </MenubarItem>
        <MenubarItem onClick={showKeyboardShortcuts}>
          Keyboard Shortcuts
        </MenubarItem>
        <MenubarItem onClick={showFAQs}>
          FAQs
        </MenubarItem>
        <MenubarItem onClick={contactSupport}>
          Contact Support
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default HelpMenu;
