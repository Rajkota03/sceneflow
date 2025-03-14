
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
import { useFormat } from '@/lib/formatContext';

const ViewMenu = () => {
  const { zoomIn, zoomOut, resetZoom } = useFormat();
  
  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  const handleFullScreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => {
        toast({
          title: "Error",
          description: `Error attempting to enable full-screen mode: ${err.message}`,
          variant: "destructive"
        });
      });
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
    }
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">View</MenubarTrigger>
      <MenubarContent>
        <MenubarCheckboxItem onClick={handleNotImplemented}>
          Dark Mode
        </MenubarCheckboxItem>
        <MenubarItem onClick={handleFullScreen}>
          Full Screen
          <MenubarShortcut>F11</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={zoomIn}>
          Zoom In
          <MenubarShortcut>⌘+</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={zoomOut}>
          Zoom Out
          <MenubarShortcut>⌘-</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={resetZoom}>
          Default Zoom
          <MenubarShortcut>⌘0</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarCheckboxItem onClick={handleNotImplemented}>
          Show Ruler
        </MenubarCheckboxItem>
        <MenubarCheckboxItem onClick={handleNotImplemented}>
          Show Page Numbers
        </MenubarCheckboxItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Editor Preferences...
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ViewMenu;
