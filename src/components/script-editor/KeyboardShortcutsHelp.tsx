
import React from 'react';
import { X } from 'lucide-react';
import { useScriptEditor } from './ScriptEditorProvider';

const KeyboardShortcutsHelp: React.FC = () => {
  const { toggleKeyboardShortcuts } = useScriptEditor();

  return (
    <div className="keyboard-shortcuts-help fixed z-50 top-20 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 max-w-sm">
      <div className="flex justify-between items-center mb-2">
        <h3 className="text-lg font-medium">Keyboard Shortcuts</h3>
        <button 
          onClick={toggleKeyboardShortcuts}
          className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={16} />
        </button>
      </div>
      
      <table className="keyboard-shortcuts-table w-full text-sm">
        <tbody>
          <tr className="border-b dark:border-gray-700">
            <td className="py-2 font-medium" colSpan={2}>Element Types</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘1</span></td>
            <td>Scene Heading</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘2</span></td>
            <td>Action</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘3</span></td>
            <td>Character</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘4</span></td>
            <td>Dialogue</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘5</span></td>
            <td>Parenthetical</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘6</span></td>
            <td>Transition</td>
          </tr>
          
          <tr className="border-b border-t dark:border-gray-700">
            <td className="py-2 font-medium" colSpan={2}>Navigation</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">Tab</span></td>
            <td>Cycle element type</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">Enter</span></td>
            <td>New element</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⇧Enter</span></td>
            <td>New line in dialogue</td>
          </tr>
          
          <tr className="border-b border-t dark:border-gray-700">
            <td className="py-2 font-medium" colSpan={2}>Other</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘E</span></td>
            <td>Export PDF</td>
          </tr>
          <tr>
            <td className="pr-4 py-1.5"><span className="keyboard-shortcut-key px-2 py-0.5 bg-gray-100 dark:bg-gray-700 rounded text-sm">⌘/</span></td>
            <td>Show/hide this help</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default KeyboardShortcutsHelp;
