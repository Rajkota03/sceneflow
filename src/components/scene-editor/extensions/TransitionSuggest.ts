import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const transitionSuggestKey = new PluginKey('transitionSuggest');

function showTransitionSuggestions(view: any) {
  const suggestions = [
    { label: 'CUT TO:' },
    { label: 'FADE TO:' },
    { label: 'SMASH CUT:' },
    { label: 'FADE IN:' },
    { label: 'FADE OUT:' },
    { label: 'DISSOLVE TO:' },
  ];
  
  // Create popup
  const popup = document.createElement('div');
  popup.className = 'suggestion-popup';
  popup.style.cssText = `
    position: absolute;
    background: white;
    border: 1px solid #ccc;
    border-radius: 4px;
    box-shadow: 0 2px 8px rgba(0,0,0,0.1);
    z-index: 1000;
    min-width: 150px;
  `;
  
  suggestions.forEach((suggestion, index) => {
    const item = document.createElement('div');
    item.style.cssText = `
      padding: 8px 12px;
      cursor: pointer;
      font-family: monospace;
      ${index === 0 ? 'background: #f0f0f0;' : ''}
    `;
    item.textContent = suggestion.label;
    
    item.addEventListener('click', () => {
      // Replace current node content
      const { state } = view;
      const { $from } = state.selection;
      const nodeStart = $from.start();
      const nodeEnd = $from.end();
      
      view.dispatch(
        state.tr.replaceRangeWith(
          nodeStart,
          nodeEnd,
          state.schema.text(suggestion.label + ' ')
        )
      );
      
      document.body.removeChild(popup);
    });
    
    item.addEventListener('mouseenter', () => {
      item.style.backgroundColor = '#f0f0f0';
    });
    
    item.addEventListener('mouseleave', () => {
      item.style.backgroundColor = index === 0 ? '#f0f0f0' : 'white';
    });
    
    popup.appendChild(item);
  });
  
  // Position popup
  const rect = view.dom.getBoundingClientRect();
  popup.style.left = `${rect.left}px`;
  popup.style.top = `${rect.bottom + 5}px`;
  
  document.body.appendChild(popup);
  
  // Remove popup on click outside
  setTimeout(() => {
    const removePopup = (e: Event) => {
      if (!popup.contains(e.target as Node)) {
        if (popup.parentNode) {
          document.body.removeChild(popup);
        }
        document.removeEventListener('click', removePopup);
      }
    };
    document.addEventListener('click', removePopup);
  }, 100);
}

export const TransitionSuggest = Extension.create({
  name: 'transitionSuggest',
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: transitionSuggestKey,
        
        props: {
          handleKeyDown: (view, event) => {
            const { state } = view;
            const { $from } = state.selection;
            const currentNode = $from.parent;
            
            // Only trigger in transitions
            if (currentNode.type.name !== 'transition') return false;
            
            const nodeText = currentNode.textContent;
            
            // Show suggestions when typing "C", "F", "S" at the start or when node is empty
            if ((nodeText.length <= 2 || nodeText === 'C' || nodeText === 'F' || nodeText === 'S') && event.key === ' ') {
              event.preventDefault();
              showTransitionSuggestions(view);
              return true;
            }
            
            return false;
          },
        },
      }),
    ];
  },
});