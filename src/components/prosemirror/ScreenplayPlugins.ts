import { Plugin, PluginKey } from 'prosemirror-state';
import { Decoration, DecorationSet } from 'prosemirror-view';
import { history } from 'prosemirror-history';
import { screenplayKeymap } from './ScreenplayKeymap';
import { ElementTypes } from './ScreenplaySchema';

// Plugin key for element styling
const elementStylingKey = new PluginKey('elementStyling');

// Plugin for element-specific styling and behavior
export const elementStylingPlugin = new Plugin({
  key: elementStylingKey,
  
  props: {
    decorations(state) {
      const decorations: Decoration[] = [];
      
      state.doc.descendants((node, pos) => {
        if (node.type.name === 'screenplay_element') {
          const elementType = node.attrs.elementType;
          
          // Add CSS classes based on element type
          const className = `screenplay-element screenplay-${elementType}`;
          
          // Add active element highlighting if needed
          const decoration = Decoration.node(pos, pos + node.nodeSize, {
            class: className,
            'data-element-type': elementType,
            'data-element-id': node.attrs.elementId || '',
            'data-tags': JSON.stringify(node.attrs.tags || []),
            'data-beat': node.attrs.beat || '',
            'data-act-id': node.attrs.actId || ''
          });
          
          decorations.push(decoration);
        }
      });
      
      return DecorationSet.create(state.doc, decorations);
    },
    
    // Handle DOM events
    handleDOMEvents: {
      // Handle focus for element tracking
      focus: (view, event) => {
        const target = event.target as HTMLElement;
        const elementDiv = target.closest('.screenplay-element');
        if (elementDiv) {
          const elementId = elementDiv.getAttribute('data-element-id');
          // You can dispatch events here for element tracking
          if (elementId) {
            // Emit custom event for element focus
            window.dispatchEvent(new CustomEvent('screenplayElementFocus', {
              detail: { elementId }
            }));
          }
        }
        return false;
      },
      
      // Handle paste events
      paste: (view, event) => {
        const clipboardData = event.clipboardData;
        if (clipboardData) {
          const text = clipboardData.getData('text/plain');
          if (text) {
            // Handle screenplay-specific paste logic
            event.preventDefault();
            
            // Split by lines and create elements
            const lines = text.split('\n').filter(line => line.trim());
            if (lines.length > 1) {
              const { state, dispatch } = view;
              const { tr } = state;
              const { $from } = state.selection;
              
              lines.forEach((line, index) => {
                if (index === 0) {
                  // Replace current element content
                  const currentNode = $from.node();
                  tr.insertText(line, $from.start(), $from.end());
                } else {
                  // Create new elements for additional lines
                  const elementType = ElementTypes.ACTION; // Default to action
                  const newNode = state.schema.nodes.screenplay_element.create({
                    elementType,
                    elementId: `element-${Date.now()}-${index}`,
                    tags: [],
                    beat: null,
                    actId: null
                  }, state.schema.text(line));
                  
                  tr.insert(tr.mapping.map($from.after()), newNode);
                }
              });
              
              dispatch(tr);
              return true;
            }
          }
        }
        return false;
      }
    }
  }
});

// Plugin key for character suggestions
const characterSuggestionsKey = new PluginKey('characterSuggestions');

// Plugin for character name suggestions
export const characterSuggestionsPlugin = new Plugin({
  key: characterSuggestionsKey,
  
  state: {
    init() {
      return {
        suggestions: [],
        active: false,
        selectedIndex: 0
      };
    },
    
    apply(tr, state) {
      // Update character suggestions based on current element
      const selection = tr.selection;
      const node = selection.$from.node();
      
      if (node.type.name === 'screenplay_element' && 
          node.attrs.elementType === ElementTypes.CHARACTER) {
        const text = node.textContent;
        
        // Extract character names from document for suggestions
        const characterNames = new Set<string>();
        tr.doc.descendants((node) => {
          if (node.type.name === 'screenplay_element' && 
              node.attrs.elementType === ElementTypes.CHARACTER) {
            const name = node.textContent.replace(/\s*\(CONT'D\)\s*$/i, '').trim();
            if (name && name !== text) {
              characterNames.add(name);
            }
          }
        });
        
        return {
          suggestions: Array.from(characterNames),
          active: text.length > 0 && characterNames.size > 0,
          selectedIndex: 0
        };
      }
      
      return {
        suggestions: [],
        active: false,
        selectedIndex: 0
      };
    }
  },
  
  props: {
    decorations(state) {
      const pluginState = this.getState(state);
      if (!pluginState.active) {
        return null;
      }
      
      // Create decorations for character suggestions
      // This would typically render a dropdown, but we'll handle that in React
      return null;
    }
  }
});

// Plugin for beat and tag management
const beatTagKey = new PluginKey('beatTag');

export const beatTagPlugin = new Plugin({
  key: beatTagKey,
  
  state: {
    init() {
      return {
        selectedElement: null,
        beatMode: 'on'
      };
    },
    
    apply(tr, state) {
      // Track selected element for beat/tag operations
      const selection = tr.selection;
      const node = selection.$from.node();
      
      if (node.type.name === 'screenplay_element') {
        return {
          ...state,
          selectedElement: {
            id: node.attrs.elementId,
            type: node.attrs.elementType,
            tags: node.attrs.tags || [],
            beat: node.attrs.beat,
            actId: node.attrs.actId
          }
        };
      }
      
      return state;
    }
  }
});

// Combine all plugins
export const screenplayPlugins = [
  history(),
  screenplayKeymap,
  elementStylingPlugin,
  characterSuggestionsPlugin,
  beatTagPlugin
];