
import React, { useState } from 'react';
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

interface ViewMenuProps {
  showTitlePage?: boolean;
  onToggleTitlePage?: () => void;
}

const ViewMenu = ({ showTitlePage, onToggleTitlePage }: ViewMenuProps) => {
  const { zoomIn, zoomOut, resetZoom } = useFormat();
  const [darkMode, setDarkMode] = useState(false);
  const [showRuler, setShowRuler] = useState(false);
  const [showPageNumbers, setShowPageNumbers] = useState(true);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    document.documentElement.classList.toggle('dark');
    toast({
      title: `${!darkMode ? "Dark" : "Light"} Mode Enabled`,
      description: `The editor is now in ${!darkMode ? "dark" : "light"} mode`,
    });
  };

  const toggleRuler = () => {
    setShowRuler(!showRuler);
    toast({
      title: `Ruler ${!showRuler ? "Shown" : "Hidden"}`,
      description: `The ruler is now ${!showRuler ? "visible" : "hidden"}`,
    });
  };

  const togglePageNumbers = () => {
    setShowPageNumbers(!showPageNumbers);
    toast({
      title: `Page Numbers ${!showPageNumbers ? "Shown" : "Hidden"}`,
      description: `Page numbers are now ${!showPageNumbers ? "visible" : "hidden"}`,
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
        <MenubarCheckboxItem checked={darkMode} onClick={toggleDarkMode}>
          Dark Mode
        </MenubarCheckboxItem>
        <MenubarItem onClick={handleFullScreen}>
          Full Screen
          <MenubarShortcut>F11</MenubarShortcut>
        </MenubarItem>
        {onToggleTitlePage && (
          <MenubarCheckboxItem checked={!!showTitlePage} onClick={onToggleTitlePage}>
            Show Title Page
          </MenubarCheckboxItem>
        )}
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
        <MenubarCheckboxItem checked={showRuler} onClick={toggleRuler}>
          Show Ruler
        </MenubarCheckboxItem>
        <MenubarCheckboxItem checked={showPageNumbers} onClick={togglePageNumbers}>
          Show Page Numbers
        </MenubarCheckboxItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ViewMenu;
