
import React from 'react';
import { 
  MenubarMenu, 
  MenubarTrigger, 
  MenubarContent, 
  MenubarItem,
  MenubarSeparator,
  MenubarCheckboxItem,
  MenubarShortcut
} from '@/components/ui/menubar';
import { useScriptEditor } from '../script-editor/ScriptEditorProvider';
import { KeyboardIcon } from 'lucide-react';

const ShortcutsMenu: React.FC = () => {
  const { showKeyboardShortcuts, toggleKeyboardShortcuts } = useScriptEditor();

  return (
    <MenubarMenu>
      <MenubarTrigger className="text-white hover:bg-[#333333]">
        <span className="flex items-center gap-1">
          <KeyboardIcon size={14} />
          <span>Shortcuts</span>
        </span>
      </MenubarTrigger>
      <MenubarContent>
        <MenubarCheckboxItem
          checked={showKeyboardShortcuts}
          onClick={toggleKeyboardShortcuts}
        >
          Show Keyboard Shortcuts
          <MenubarShortcut>⌘/</MenubarShortcut>
        </MenubarCheckboxItem>
        
        <MenubarSeparator />
        
        <MenubarItem disabled>Element Types</MenubarItem>
        <MenubarItem>
          Scene Heading
          <MenubarShortcut>⌘1</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Action
          <MenubarShortcut>⌘2</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Character
          <MenubarShortcut>⌘3</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Dialogue
          <MenubarShortcut>⌘4</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Parenthetical
          <MenubarShortcut>⌘5</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Transition
          <MenubarShortcut>⌘6</MenubarShortcut>
        </MenubarItem>
        
        <MenubarSeparator />
        
        <MenubarItem disabled>Navigation</MenubarItem>
        <MenubarItem>
          Next Element
          <MenubarShortcut>↓</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Previous Element
          <MenubarShortcut>↑</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          New Element
          <MenubarShortcut>Enter</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          New Line in Dialogue
          <MenubarShortcut>⇧Enter</MenubarShortcut>
        </MenubarItem>
        
        <MenubarSeparator />
        
        <MenubarItem disabled>Other</MenubarItem>
        <MenubarItem>
          Export PDF
          <MenubarShortcut>⌘E</MenubarShortcut>
        </MenubarItem>
        <MenubarItem>
          Toggle Shortcuts Help
          <MenubarShortcut>⌘/</MenubarShortcut>
        </MenubarItem>
      </MenubarContent>
    </MenubarMenu>
  );
};

export default ShortcutsMenu;
