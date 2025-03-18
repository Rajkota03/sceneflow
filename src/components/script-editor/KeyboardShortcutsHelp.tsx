
import React from 'react';

const KeyboardShortcutsHelp: React.FC = () => {
  return (
    <div className="keyboard-shortcuts-help absolute z-50 top-20 right-4 bg-white p-4 rounded-lg shadow-lg border border-gray-200 max-w-sm">
      <h3 className="text-lg font-medium mb-2">Keyboard Shortcuts</h3>
      <table className="keyboard-shortcuts-table w-full">
        <tbody>
          <tr>
            <td className="pr-4"><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘1</span></td>
            <td>Scene Heading</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘2</span></td>
            <td>Action</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘3</span></td>
            <td>Character</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘4</span></td>
            <td>Dialogue</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘5</span></td>
            <td>Parenthetical</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⇧⌘R</span></td>
            <td>Transition</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">Tab</span></td>
            <td>Cycle element type</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">Enter</span></td>
            <td>New element</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⇧Enter</span></td>
            <td>New line in dialogue</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘E</span></td>
            <td>Export PDF</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key px-2 py-1 bg-gray-100 rounded text-sm">⌘/</span></td>
            <td>Show/hide this help</td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default KeyboardShortcutsHelp;
