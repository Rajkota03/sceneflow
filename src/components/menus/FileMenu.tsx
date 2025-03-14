
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut
} from '@/components/ui/menubar';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/components/ui/use-toast';

interface FileMenuProps {
  onSave: () => void;
}

const FileMenu = ({ onSave }: FileMenuProps) => {
  const navigate = useNavigate();

  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
    });
  };

  const handleNavigateToDashboard = () => {
    navigate('/dashboard');
  };

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">File</MenubarTrigger>
      <MenubarContent>
        <MenubarItem onClick={handleNotImplemented}>
          New
          <MenubarShortcut>⌘N</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNavigateToDashboard}>
          Open...
          <MenubarShortcut>⌘O</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Close
          <MenubarShortcut>⌘W</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={onSave}>
          Save
          <MenubarShortcut>⌘S</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Save As...
          <MenubarShortcut>⇧⌘S</MenubarShortcut>
        </MenubarItem>
        <MenubarItem onClick={handleNotImplemented}>
          Revert to Saved
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNotImplemented}>
          Print...
          <MenubarShortcut>⌘P</MenubarShortcut>
        </MenubarItem>
        <MenubarSeparator />
        <MenubarItem onClick={handleNavigateToDashboard}>
          Exit
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default FileMenu;
