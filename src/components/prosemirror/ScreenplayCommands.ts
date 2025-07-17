import { Command } from 'prosemirror-state';
import { NodeType } from 'prosemirror-model';
import { Selection, TextSelection } from 'prosemirror-state';
import { ElementType, ElementTypes, detectElementType } from './ScreenplaySchema';
import { generateUniqueId } from '@/lib/formatScript';

// Command to change element type
export const changeElementType = (elementType: ElementType): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    if (dispatch) {
      const tr = state.tr.setNodeMarkup($from.before(), undefined, {
        ...node.attrs,
        elementType
      });
      dispatch(tr);
    }
    return true;
  };
};

// Command to create new element
export const insertNewElement = (elementType: ElementType = ElementTypes.ACTION): Command => {
  return (state, dispatch) => {
    const { schema } = state;
    const { $to } = state.selection;
    
    if (dispatch) {
      const newNode = schema.nodes.screenplay_element.create({
        elementType,
        elementId: generateUniqueId(),
        tags: [],
        beat: null,
        actId: null
      });
      
      const tr = state.tr.insert($to.after(), newNode);
      // Move cursor to the new element
      const newPos = $to.after() + 1;
      tr.setSelection(TextSelection.near(tr.doc.resolve(newPos)));
      dispatch(tr);
    }
    return true;
  };
};

// Command to auto-detect element type based on content
export const autoDetectElementType = (): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    const text = node.textContent;
    const previousNode = $from.before() > 1 ? state.doc.resolve($from.before() - 1).node() : null;
    const previousElementType = previousNode?.attrs?.elementType;
    
    const detectedType = detectElementType(text, previousElementType);
    
    // Only change if different from current type
    if (detectedType !== node.attrs.elementType) {
      if (dispatch) {
        const tr = state.tr.setNodeMarkup($from.before(), undefined, {
          ...node.attrs,
          elementType: detectedType
        });
        dispatch(tr);
      }
      return true;
    }
    return false;
  };
};

// Command to handle Enter key behavior
export const handleEnterKey = (): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    // Determine the next element type based on current type
    let nextElementType: ElementType = ElementTypes.ACTION;
    
    switch (node.attrs.elementType) {
      case ElementTypes.SCENE_HEADING:
        nextElementType = ElementTypes.ACTION;
        break;
      case ElementTypes.ACTION:
        nextElementType = ElementTypes.ACTION;
        break;
      case ElementTypes.CHARACTER:
        nextElementType = ElementTypes.DIALOGUE;
        break;
      case ElementTypes.DIALOGUE:
        nextElementType = ElementTypes.ACTION;
        break;
      case ElementTypes.PARENTHETICAL:
        nextElementType = ElementTypes.DIALOGUE;
        break;
      case ElementTypes.TRANSITION:
        nextElementType = ElementTypes.SCENE_HEADING;
        break;
    }

    return insertNewElement(nextElementType)(state, dispatch);
  };
};

// Command to handle Tab key behavior
export const handleTabKey = (): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    // Cycle through element types with Tab
    const elementTypes = [
      ElementTypes.SCENE_HEADING,
      ElementTypes.ACTION,
      ElementTypes.CHARACTER,
      ElementTypes.DIALOGUE,
      ElementTypes.PARENTHETICAL,
      ElementTypes.TRANSITION
    ];
    
    const currentIndex = elementTypes.indexOf(node.attrs.elementType);
    const nextIndex = (currentIndex + 1) % elementTypes.length;
    const nextElementType = elementTypes[nextIndex];
    
    return changeElementType(nextElementType)(state, dispatch);
  };
};

// Command to add tag to current element
export const addTagToElement = (tag: string): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    const currentTags = node.attrs.tags || [];
    if (currentTags.includes(tag)) {
      return false; // Tag already exists
    }

    if (dispatch) {
      const tr = state.tr.setNodeMarkup($from.before(), undefined, {
        ...node.attrs,
        tags: [...currentTags, tag]
      });
      dispatch(tr);
    }
    return true;
  };
};

// Command to remove tag from current element
export const removeTagFromElement = (tag: string): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    const currentTags = node.attrs.tags || [];
    if (!currentTags.includes(tag)) {
      return false; // Tag doesn't exist
    }

    if (dispatch) {
      const tr = state.tr.setNodeMarkup($from.before(), undefined, {
        ...node.attrs,
        tags: currentTags.filter(t => t !== tag)
      });
      dispatch(tr);
    }
    return true;
  };
};

// Command to set beat for current element
export const setBeatForElement = (beatId: string, actId: string): Command => {
  return (state, dispatch) => {
    const { $from } = state.selection;
    const node = $from.node();
    
    if (node.type.name !== 'screenplay_element') {
      return false;
    }

    if (dispatch) {
      const tr = state.tr.setNodeMarkup($from.before(), undefined, {
        ...node.attrs,
        beat: beatId,
        actId: actId
      });
      dispatch(tr);
    }
    return true;
  };
};