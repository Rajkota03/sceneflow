
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
import ToolsMenu from './menus/ToolsMenu';
import ProductionMenu from './menus/ProductionMenu';
import HelpMenu from './menus/HelpMenu';
import { toast } from '@/components/ui/use-toast';
import { TitlePageData } from './TitlePageEditor';

interface EditorMenuBarProps {
  onSave: () => void;
  onSaveAs: (newTitle: string) => void;
  onTitlePage?: () => void;
  onEditTitlePage?: (data: TitlePageData) => void;
  titlePageData?: TitlePageData;
}

const EditorMenuBar = ({ onSave, onSaveAs, onTitlePage, onEditTitlePage, titlePageData }: EditorMenuBarProps) => {
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
        <MenubarContent>
          <MenubarItem onClick={() => navigate('/dashboard')}>
            Dashboard
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={handleNotImplemented}>
            About Scene Flow
          </MenubarItem>
          <MenubarItem onClick={handleNotImplemented}>
            Check for Updates
          </MenubarItem>
          <MenubarSeparator />
          <MenubarItem onClick={() => navigate('/')}>
            Sign Out
          </MenubarItem>
        </MenubarContent>
      </MenubarMenu>
      
      <FileMenu onSave={onSave} onSaveAs={onSaveAs} />
      <EditMenu onTitlePage={onTitlePage} onEditTitlePage={onEditTitlePage} titlePageData={titlePageData} />
      <FormatMenu />
      <ToolsMenu />
      <ViewMenu />
      <ProductionMenu />
      <HelpMenu />
    </Menubar>
  );
};

export default EditorMenuBar;
