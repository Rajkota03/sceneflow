import { keymap } from 'prosemirror-keymap';
import { undo, redo } from 'prosemirror-history';
import { TextSelection } from 'prosemirror-state';
import { 
  changeElementType,
  handleEnterKey,
  handleTabKey,
  autoDetectElementType,
  insertNewElement
} from './ScreenplayCommands';
import { ElementTypes } from './ScreenplaySchema';

// Create the keymap for screenplay editor
export const screenplayKeymap = keymap({
  // Basic navigation
  'Enter': handleEnterKey(),
  'Shift-Enter': insertNewElement(),
  'Tab': handleTabKey(),
  
  // Element type shortcuts (Ctrl/Cmd + number)
  'Mod-1': changeElementType(ElementTypes.SCENE_HEADING),
  'Mod-2': changeElementType(ElementTypes.ACTION),
  'Mod-3': changeElementType(ElementTypes.CHARACTER),
  'Mod-4': changeElementType(ElementTypes.DIALOGUE),
  'Mod-5': changeElementType(ElementTypes.PARENTHETICAL),
  'Mod-6': changeElementType(ElementTypes.TRANSITION),
  
  // Auto-detect on space
  'Space': (state, dispatch, view) => {
    // First insert the space
    if (dispatch) {
      const tr = state.tr.insertText(' ');
      dispatch(tr);
    }
    
    // Then try to auto-detect element type
    setTimeout(() => {
      autoDetectElementType()(view!.state, view!.dispatch, view);
    }, 0);
    
    return true;
  },
  
  // History
  'Mod-z': undo,
  'Mod-y': redo,
  'Mod-Shift-z': redo,
  
  // Custom navigation shortcuts
  'Ctrl-ArrowUp': (state, dispatch) => {
    // Move to previous element
    const { $from } = state.selection;
    const prevPos = $from.before();
    if (prevPos > 0) {
      const prevResolve = state.doc.resolve(prevPos - 1);
      if (dispatch) {
        dispatch(state.tr.setSelection(TextSelection.near(prevResolve)));
      }
      return true;
    }
    return false;
  },
  
  'Ctrl-ArrowDown': (state, dispatch) => {
    // Move to next element
    const { $from } = state.selection;
    const nextPos = $from.after();
    if (nextPos < state.doc.content.size) {
      const nextResolve = state.doc.resolve(nextPos + 1);
      if (dispatch) {
        dispatch(state.tr.setSelection(TextSelection.near(nextResolve)));
      }
      return true;
    }
    return false;
  }
});

// Additional keymaps for specific contexts
export const characterSuggestionKeymap = keymap({
  'ArrowDown': (state, dispatch, view) => {
    // Handle character suggestion navigation
    // This will be implemented when we add character suggestions
    return false;
  },
  
  'ArrowUp': (state, dispatch, view) => {
    // Handle character suggestion navigation
    // This will be implemented when we add character suggestions
    return false;
  },
  
  'Escape': (state, dispatch, view) => {
    // Close character suggestions
    // This will be implemented when we add character suggestions
    return false;
  }
});