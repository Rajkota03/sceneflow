
import React from 'react';
import { 
  Menubar, 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem, 
  MenubarSeparator,
  MenubarShortcut
} from '@/components/ui/menubar';
import { useNavigate } from 'react-router-dom';
import FileMenu from './menus/FileMenu';
import EditMenu from './menus/EditMenu';
import ViewMenu from './menus/ViewMenu';
import FormatMenu from './menus/FormatMenu';
import InsertMenu from './menus/InsertMenu';
import { toast } from '@/components/ui/use-toast';

interface EditorMenuBarProps {
  onSave: () => void;
}

const EditorMenuBar = ({ onSave }: EditorMenuBarProps) => {
  const navigate = useNavigate();

  const handleNotImplemented = () => {
    toast({
      title: "Not implemented",
      description: "This feature is not yet implemented.",
      variant: "destructive"
    });
  };

  return (
    <Menubar className="rounded-none border-none border-b border-[#333333] h-8 bg-[#222222] text-white">
      <MenubarMenu>
        <MenubarTrigger className="font-bold text-white hover:bg-[#333333]">Scene Flow</MenubarTrigger>
      </MenubarMenu>
      
      <FileMenu onSave={onSave} />
      <EditMenu />
      <ViewMenu />
      <FormatMenu />
      <InsertMenu />
      
      <MenubarMenu>
        <MenubarTrigger className="text-white hover:bg-[#333333]">Document</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleNotImplemented}>Script Properties...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleNotImplemented}>Smart Type</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger className="text-white hover:bg-[#333333]">Tools</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleNotImplemented}>Reports...</MenubarItem>
          <MenubarItem onClick={handleNotImplemented}>Name Database...</MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleNotImplemented}>Auto-Backup Options...</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <MenubarMenu>
        <MenubarTrigger className="text-white hover:bg-[#333333]">Production</MenubarTrigger>
        <MenubarContent>
          <MenubarItem onClick={handleNotImplemented}>Scenes</MenubarItem>
          <MenubarItem onClick={handleNotImplemented}>Breakdown</MenubarItem>
          <MenubarItem onClick={handleNotImplemented}>Tags</MenubarItem>
        </MenubarContent>
      </MenubarMenu>
    </Menubar>
  );
};

export default EditorMenuBar;
