import { Schema, NodeSpec, MarkSpec } from 'prosemirror-model';

// Define node specs for each screenplay element type
const screenplayNodes: { [key: string]: NodeSpec } = {
  doc: {
    content: "screenplay_element+",
  },

  screenplay_element: {
    content: "text*",
    attrs: {
      elementType: { default: "action" },
      elementId: { default: null },
      tags: { default: [] },
      beat: { default: null },
      actId: { default: null }
    },
    group: "block",
    defining: true,
    parseDOM: [
      {
        tag: "div[data-element-type]",
        getAttrs: (dom) => {
          const element = dom as HTMLElement;
          return {
            elementType: element.getAttribute("data-element-type") || "action",
            elementId: element.getAttribute("data-element-id") || null,
            tags: JSON.parse(element.getAttribute("data-tags") || "[]"),
            beat: element.getAttribute("data-beat") || null,
            actId: element.getAttribute("data-act-id") || null
          };
        }
      }
    ],
    toDOM: (node) => {
      const attrs: any = {
        "data-element-type": node.attrs.elementType,
        "data-element-id": node.attrs.elementId,
        "data-tags": JSON.stringify(node.attrs.tags || []),
        class: `screenplay-element screenplay-${node.attrs.elementType}`
      };
      
      if (node.attrs.beat) {
        attrs["data-beat"] = node.attrs.beat;
      }
      if (node.attrs.actId) {
        attrs["data-act-id"] = node.attrs.actId;
      }

      return ["div", attrs, 0];
    }
  },

  text: {
    group: "inline"
  }
};

// Define mark specs (for formatting within elements)
const screenplayMarks: { [key: string]: MarkSpec } = {
  // We can add marks here if needed for formatting
  // For now, screenplay formatting is primarily structural
};

// Create the schema
export const screenplaySchema = new Schema({
  nodes: screenplayNodes,
  marks: screenplayMarks
});

// Helper functions for element types
export const ElementTypes = {
  SCENE_HEADING: 'scene-heading',
  ACTION: 'action',
  CHARACTER: 'character',
  DIALOGUE: 'dialogue',
  PARENTHETICAL: 'parenthetical',
  TRANSITION: 'transition'
} as const;

export type ElementType = typeof ElementTypes[keyof typeof ElementTypes];

// Element type detection patterns (same as existing formatScript.ts)
export const detectElementType = (text: string, previousElementType?: ElementType): ElementType => {
  // Detect scene headings (INT./EXT.)
  if (/^(INT|EXT|INT\/EXT|I\/E)[\s\.]/.test(text.toUpperCase())) {
    return ElementTypes.SCENE_HEADING;
  }
  
  // Detect transitions (TO:)
  if (/^[A-Z\s]+TO:$/.test(text)) {
    return ElementTypes.TRANSITION;
  }
  
  // Detect character names (ALL CAPS) - ignoring (CONT'D)
  if (/^[A-Z][A-Z\s']+(\s*\(CONT'D\))?$/.test(text) && 
      previousElementType !== ElementTypes.CHARACTER) {
    return ElementTypes.CHARACTER;
  }
  
  // Detect parentheticals
  if (/^\(.+\)$/.test(text)) {
    return ElementTypes.PARENTHETICAL;
  }
  
  // If the previous element was a character or parenthetical, treat this as dialogue
  if (previousElementType === ElementTypes.CHARACTER || 
      previousElementType === ElementTypes.PARENTHETICAL || 
      previousElementType === ElementTypes.DIALOGUE) {
    return ElementTypes.DIALOGUE;
  }
  
  // Default to action
  return ElementTypes.ACTION;
};

// CSS classes for element types
export const getElementClasses = (elementType: ElementType): string => {
  const baseClasses = "screenplay-element";
  
  switch (elementType) {
    case ElementTypes.SCENE_HEADING:
      return `${baseClasses} scene-heading`;
    case ElementTypes.ACTION:
      return `${baseClasses} action`;
    case ElementTypes.CHARACTER:
      return `${baseClasses} character`;
    case ElementTypes.DIALOGUE:
      return `${baseClasses} dialogue`;
    case ElementTypes.PARENTHETICAL:
      return `${baseClasses} parenthetical`;
    case ElementTypes.TRANSITION:
      return `${baseClasses} transition`;
    default:
      return `${baseClasses} action`;
  }
};