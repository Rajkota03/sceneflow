import { Extension } from '@tiptap/core';
import { Plugin, PluginKey } from '@tiptap/pm/state';
import { Decoration, DecorationSet } from '@tiptap/pm/view';

export interface PlaceholderSuggestionsOptions {
  characterNames?: string[];
}

const placeholderPluginKey = new PluginKey('placeholderSuggestions');

export const PlaceholderSuggestionsExtension = Extension.create<PlaceholderSuggestionsOptions>({
  name: 'placeholderSuggestions',

  addOptions() {
    return {
      characterNames: [],
    };
  },

  addProseMirrorPlugins() {
    return [
      new Plugin({
        key: placeholderPluginKey,
        
        props: {
          decorations: (state) => {
            const { selection } = state;
            const { $from } = selection;
            const currentNode = $from.parent;
            
            if (!currentNode || currentNode.textContent.length > 0) {
              return DecorationSet.empty;
            }
            
            const nodeType = currentNode.type.name;
            let placeholderText = '';
            
            switch (nodeType) {
              case 'sceneHeading':
                placeholderText = 'INT. LOCATION - DAY';
                break;
              case 'action':
                placeholderText = 'Describe what happens in the scene...';
                break;
              case 'character':
                const characterNames = this.options.characterNames || [];
                if (characterNames.length > 0) {
                  placeholderText = characterNames[0]; // Show first character as suggestion
                } else {
                  placeholderText = 'CHARACTER NAME';
                }
                break;
              case 'dialogue':
                placeholderText = 'What does the character say?';
                break;
              case 'parenthetical':
                placeholderText = '(beat)';
                break;
              case 'transition':
                placeholderText = 'CUT TO:';
                break;
              default:
                return DecorationSet.empty;
            }
            
            const decoration = Decoration.node($from.start(), $from.end(), {
              class: 'screenplay-placeholder',
              'data-placeholder': placeholderText,
            });
            
            return DecorationSet.create(state.doc, [decoration]);
          },
        },
      }),
    ];
  },

  addGlobalAttributes() {
    return [
      {
        types: ['sceneHeading', 'action', 'character', 'dialogue', 'parenthetical', 'transition'],
        attributes: {
          'data-placeholder': {
            default: null,
            renderHTML: attributes => {
              if (!attributes['data-placeholder']) {
                return {};
              }
              return {
                'data-placeholder': attributes['data-placeholder'],
              };
            },
          },
        },
      },
    ];
  },
});