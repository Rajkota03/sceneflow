import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';

const sceneHeadingSuggestKey = new PluginKey('sceneHeadingSuggest');

function showSceneHeadingSuggestions(view: any, query: string) {
  const suggestions = [
    { label: 'INT. ' },
    { label: 'EXT. ' }, 
    { label: 'INT./EXT. ' }
  ].filter(item => 
    item.label.toLowerCase().startsWith(query.toLowerCase())
  );
  
  if (suggestions.length === 0) return;
  
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
    min-width: 120px;
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
          state.schema.text(suggestion.label)
        )
      );
      
      document.body.removeChild(popup);
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

export const SceneHeadingSuggest = Extension.create({
  name: 'sceneHeadingSuggest',
  priority: 1000,

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: sceneHeadingSuggestKey,
        
        props: {
          handleKeyDown: (view, event) => {
            const { state } = view;
            const { $from } = state.selection;
            const currentNode = $from.parent;
            
            // Only trigger in scene headings
            if (currentNode.type.name !== 'sceneHeading') return false;
            
            const nodeText = currentNode.textContent;
            
            // Show suggestions when typing "I" or "E" at the start
            if ((nodeText === 'I' || nodeText === 'E' || nodeText === 'IN' || nodeText === 'EX') && event.key === ' ') {
              event.preventDefault();
              showSceneHeadingSuggestions(view, nodeText);
              return true;
            }
            
            return false;
          },
        },
      }),
    ];
  },
});