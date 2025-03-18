
import React from 'react';

interface KeyboardShortcutsHelpProps {
  onClose?: () => void;
}

const KeyboardShortcutsHelp: React.FC<KeyboardShortcutsHelpProps> = ({ onClose }) => {
  return (
    <div className="keyboard-shortcuts-help fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-white p-4 rounded-md shadow-md z-50 border border-gray-200">
      <h3 className="text-lg font-medium mb-2">Keyboard Shortcuts</h3>
      <table className="keyboard-shortcuts-table">
        <tbody>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘1</span></td>
            <td>Scene Heading</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘2</span></td>
            <td>Action</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘3</span></td>
            <td>Character</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘4</span></td>
            <td>Dialogue</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘5</span></td>
            <td>Parenthetical</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⇧⌘R</span></td>
            <td>Transition</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">Tab</span></td>
            <td>Cycle element type</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">Enter</span></td>
            <td>New element</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⇧Enter</span></td>
            <td>New line in dialogue</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘E</span></td>
            <td>Export PDF</td>
          </tr>
          <tr>
            <td><span className="keyboard-shortcut-key">⌘/</span></td>
            <td>Show/hide this help</td>
          </tr>
        </tbody>
      </table>
      
      {onClose && (
        <div className="mt-4 text-right">
          <button 
            onClick={onClose}
            className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded text-sm"
          >
            Close
          </button>
        </div>
      )}
    </div>
  );
};

export default KeyboardShortcutsHelp;
