
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarSub,
  MenubarSubContent,
  MenubarSubTrigger,
  MenubarShortcut
} from '@/components/ui/menubar';
import { toast } from '@/components/ui/use-toast';

const FormatMenu = () => {
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">Format</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          Elements...
          <MenubarSub>
            <MenubarSubTrigger>Change Element To</MenubarSubTrigger>
            <MenubarSubContent>
              <MenubarItem onClick={handleNotImplemented}>Scene Heading</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Action</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Character</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Dialogue</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Parenthetical</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Transition</MenubarItem>
              <MenubarItem onClick={handleNotImplemented}>Note</MenubarItem>
            </MenubarSubContent>
          </MenubarSub>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Cast List Element Options...
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Highlight Characters...
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Set Font...
        </MenubarItem>
        <MenubarSub>
          <MenubarSubTrigger>Font</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Courier Prime</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Courier Final Draft</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Courier New</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Size</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>10</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>12</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>14</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>16</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Style</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Bold</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Italic</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Underline</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Strikethrough</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Color</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Black</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Red</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Blue</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Green</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Highlight</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Yellow</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Blue</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Green</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Pink</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarItem onClick={handleNotImplemented}>
          TOGGLE CASE
        </MenubarItem>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Alignment</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Left</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Center</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Right</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Spacing</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Single</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>1.5 Lines</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Double</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Space Before</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>0 pt</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>6 pt</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>12 pt</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSub>
          <MenubarSubTrigger>Leading</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Auto</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Tight</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Normal</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Loose</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarSub>
          <MenubarSubTrigger>Beat Board</MenubarSubTrigger>
          <MenubarSubContent>
            <MenubarItem onClick={handleNotImplemented}>Show Beat Labels</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Show Ruler</MenubarItem>
            <MenubarItem onClick={handleNotImplemented}>Snap Beats to Grid</MenubarItem>
          </MenubarSubContent>
        </MenubarSub>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Dual Dialogue
          <MenubarShortcut>⌘D</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Edit Dual Dialogue
          <MenubarShortcut>⇧⌘D</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FormatMenu;
