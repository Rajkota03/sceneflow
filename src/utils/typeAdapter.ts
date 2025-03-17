
import { 
  ScriptContent, 
  ScriptElement, 
  ElementType, 
  ActType, 
  Structure as ScriptTypeStructure,
  Act as ScriptTypeAct,
  Beat as ScriptTypeBeat,
  ScriptElement as ScriptTypeScriptElement
} from '@/types/scriptTypes';
import { 
  Project as LibProject,
  Note as LibNote,
  Structure as LibStructure,
  Act as LibAct,
  Beat as LibBeat,
  ScriptContent as LibScriptContent,
  ScriptElement as LibScriptElement,
  ElementType as LibElementType
} from '@/lib/types';

export function convertLibToScriptTypes(libScript: LibScriptContent): ScriptContent {
  if (!libScript || !libScript.elements) {
    return { elements: [] };
  }

  const elements: ScriptElement[] = libScript.elements.map(element => ({
    id: element.id,
    type: convertLibElementTypeToScriptType(element.type),
    text: element.text,
    tags: element.tags || [],
    beatId: element.beat || undefined,
    actId: element.act || undefined
  }));

  return { elements };
}

export function convertScriptTypesToLib(scriptScript: ScriptContent): LibScriptContent {
  if (!scriptScript || !scriptScript.elements) {
    return { elements: [] };
  }

  const elements: LibScriptElement[] = scriptScript.elements.map(element => ({
    id: element.id,
    type: convertScriptTypeToLibElementType(element.type),
    text: element.text,
    tags: element.tags || [],
    beat: element.beatId || undefined,
    act: element.actId || undefined
  }));

  return { elements };
}

export function convertScriptTypeToLibElementType(
  scriptType: ElementType
): LibElementType {
  // Simple pass-through since the string values are the same
  return scriptType as unknown as LibElementType;
}

export function convertStructures(libStructures: LibStructure[]): ScriptTypeStructure[] {
  if (!libStructures) return [];
  
  return libStructures.map(structure => {
    // Ensure structure is valid and acts is an array
    if (!structure || !Array.isArray(structure.acts)) {
      return {
        id: structure.id || '',
        name: structure.name || '',
        description: structure.description || '',
        structure_type: structure.structure_type || 'three_act',
        projectTitle: structure.projectTitle || '',
        author_id: structure.author_id || '',
        created_at: structure.createdAt || new Date().toISOString(),
        updated_at: structure.updatedAt || new Date().toISOString(),
        acts: []
      };
    }
    
    return {
      id: structure.id,
      name: structure.name,
      description: structure.description || '',
      structure_type: structure.structure_type || 'three_act',
      projectTitle: structure.projectTitle || '',
      author_id: structure.author_id || '',
      created_at: structure.createdAt || new Date().toISOString(),
      updated_at: structure.updatedAt || new Date().toISOString(),
      acts: structure.acts.map(act => ({
        id: act.id,
        structure_id: structure.id,
        act_type: convertToActType(act.act_type),
        title: act.title || '',
        order: 0, // Default order
        colorHex: act.colorHex || '#000000',
        beats: Array.isArray(act.beats) ? act.beats.map(beat => ({
          id: beat.id,
          act_id: act.id,
          title: beat.title || '',
          description: beat.description || '',
          order: 0, // Default order
          is_complete: beat.complete || false,
          notes: beat.notes || ''
        })) : []
      }))
    };
  });
}

function convertToActType(actType: any): ActType {
  if (typeof actType === 'string') {
    switch(actType) {
      case 'act1': return ActType.ACT_1;
      case 'act2a': return ActType.ACT_2A;
      case 'midpoint': return ActType.MIDPOINT;
      case 'act2b': return ActType.ACT_2B;
      case 'act3': return ActType.ACT_3;
      default: return ActType.ACT_1;
    }
  }
  return ActType.ACT_1;
}

export function convertLibSceneHeadingToScriptType(
  libSceneHeading: LibScriptElement
): ScriptElement {
  return {
    id: libSceneHeading.id,
    type: ElementType.SCENE_HEADING,
    text: libSceneHeading.text,
    tags: libSceneHeading.tags || [],
    beatId: libSceneHeading.beat || undefined,
    actId: libSceneHeading.act || undefined
  };
}

export function convertLibElementTypeToScriptType(
  libType: LibElementType
): ElementType {
  switch (libType) {
    case 'scene-heading':
      return ElementType.SCENE_HEADING;
    case 'action':
      return ElementType.ACTION;
    case 'character':
      return ElementType.CHARACTER;
    case 'dialogue':
      return ElementType.DIALOGUE;
    case 'parenthetical':
      return ElementType.PARENTHETICAL;
    case 'transition':
      return ElementType.TRANSITION;
    case 'note':
      return ElementType.NOTE;
    default:
      return ElementType.ACTION;
  }
}

// Helper function to convert lib script elements to script type elements
export function convertLibScriptElementsToScriptType(
  elements: LibScriptElement[]
): ScriptTypeScriptElement[] {
  if (!elements || !Array.isArray(elements)) {
    return [];
  }
  
  return elements.map(element => ({
    id: element.id,
    type: convertLibElementTypeToScriptType(element.type),
    text: element.text,
    tags: element.tags || [],
    beatId: element.beat || undefined,
    actId: element.act || undefined
  }));
}

// Add a function to convert script type elements back to lib type
export function convertScriptElementsToLibType(
  elements: ScriptTypeScriptElement[]
): LibScriptElement[] {
  if (!elements || !Array.isArray(elements)) {
    return [];
  }
  
  return elements.map(element => ({
    id: element.id,
    type: convertScriptTypeToLibElementType(element.type),
    text: element.text,
    tags: element.tags || [],
    beat: element.beatId,
    act: element.actId
  }));
}

// Add this function to support the Editor.tsx import
export function convertScriptTypeTitlePageToLib(titlePage: any): any {
  return titlePage; // Simple pass-through for now
}
