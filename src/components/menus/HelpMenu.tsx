
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
      description: "Common shortcuts: ⌘N (New), ⌘O (Open), ⌘S (Save), ⌘F (Find), ⌘1-6 (Element types), ⌘+ (Zoom In), ⌘- (Zoom Out), ⌘0 (Reset Zoom), ⌘C/⌘V/⌘X (Copy/Paste/Cut), Arrow keys (Navigate)"
    });
  };

  const showUserGuide = () => {
    toast({
      title: "User Guide",
      description: "Scene Flow is a screenplay editor that helps you write professional scripts with proper formatting. Use the menus above to format your text and navigate your screenplay. Use arrow keys to move cursor between lines, Tab to cycle element types, Enter to create new elements.",
    });
  };

  const showFAQs = () => {
    toast({
      title: "Frequently Asked Questions",
      description: "Q: How do I format dialogue? A: Write a character name, press Enter, and start typing. Q: How do I save my script? A: Use ⌘S or click File > Save. Q: How do I copy/paste? A: Use standard ⌘C/⌘V shortcuts or Edit menu. Q: How do I navigate? A: Use arrow keys to move between lines.",
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
