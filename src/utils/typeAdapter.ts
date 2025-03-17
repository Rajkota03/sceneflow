
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
    type: element.type as LibElementType,
    text: element.text,
    tags: element.tags || [],
    beat: element.beatId || undefined,
    act: element.actId ? element.actId.toString() : undefined
  }));

  return { elements };
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
        author_id: '',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        acts: []
      };
    }
    
    return {
      id: structure.id,
      name: structure.name,
      description: structure.description || '',
      structure_type: structure.structure_type || 'three_act',
      projectTitle: structure.projectTitle || '',
      author_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      acts: structure.acts.map(act => ({
        id: act.id,
        structure_id: structure.id,
        act_type: act.act_type || ActType.ACT_1,
        title: act.title,
        order: 0, // Default value since act.order is missing
        colorHex: act.colorHex || '#000000',
        beats: Array.isArray(act.beats) ? act.beats.map(beat => ({
          id: beat.id,
          act_id: act.id,
          title: beat.title || '',
          description: beat.description || '',
          order: 0, // Default value since beat.order is missing
          is_complete: beat.complete || false,
          notes: beat.notes || ''
        })) : []
      }))
    };
  });
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
    actId: libSceneHeading.act ? libSceneHeading.act.toString() : undefined
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
    actId: element.act ? element.act.toString() : undefined
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
    type: element.type === ElementType.SCENE_HEADING ? 'scene-heading' :
          element.type === ElementType.ACTION ? 'action' :
          element.type === ElementType.CHARACTER ? 'character' :
          element.type === ElementType.DIALOGUE ? 'dialogue' :
          element.type === ElementType.PARENTHETICAL ? 'parenthetical' :
          element.type === ElementType.TRANSITION ? 'transition' :
          element.type === ElementType.NOTE ? 'note' : 'action',
    text: element.text,
    tags: element.tags || [],
    beat: element.beatId
  }));
}

// Add this function to support the Editor.tsx import
export function convertScriptTypeTitlePageToLib(titlePage: any): any {
  return titlePage; // Simple pass-through for now
}
