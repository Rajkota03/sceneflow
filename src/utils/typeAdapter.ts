
import { 
  ScriptContent as LibScriptContent,
  ScriptElement as LibScriptElement,
  Structure as LibStructure,
  ElementType as LibElementType,
  ActType as LibActType,
  Act as LibAct,
  Beat as LibBeat,
  TitlePageData as LibTitlePageData
} from '@/lib/types';

import {
  ScriptContent as ScriptTypeScriptContent,
  ScriptElement as ScriptTypeScriptElement,
  Structure as ScriptTypeStructure,
  ElementType as ScriptTypeElementType,
  ActType as ScriptTypeActType,
  Act as ScriptTypeAct,
  Beat as ScriptTypeBeat,
  TitlePageData as ScriptTypeTitlePageData
} from '@/types/scriptTypes';

// Convert lib types to script types
export function convertLibToScriptTypes(content: LibScriptContent): ScriptTypeScriptContent {
  if (!content || !content.elements) {
    return { elements: [] };
  }
  
  return {
    elements: content.elements.map((element) => ({
      id: element.id,
      type: convertLibElementTypeToScriptType(element.type),
      text: element.text,
      tags: element.tags || [],
      beatId: element.beat || undefined,
      actId: undefined
    }))
  };
}

export function convertLibElementTypeToScriptType(type: LibElementType): ScriptTypeElementType {
  // Map the string literal types to enum values
  switch (type) {
    case 'scene-heading':
      return ScriptTypeElementType.SCENE_HEADING;
    case 'action':
      return ScriptTypeElementType.ACTION;
    case 'character':
      return ScriptTypeElementType.CHARACTER;
    case 'dialogue':
      return ScriptTypeElementType.DIALOGUE;
    case 'parenthetical':
      return ScriptTypeElementType.PARENTHETICAL;
    case 'transition':
      return ScriptTypeElementType.TRANSITION;
    case 'note':
      return ScriptTypeElementType.NOTE;
    default:
      return ScriptTypeElementType.ACTION;
  }
}

// Convert script types to lib types
export function convertScriptTypesToLib(content: ScriptTypeScriptContent): LibScriptContent {
  return {
    elements: content.elements.map((element) => ({
      id: element.id,
      type: convertScriptTypeToLibElementType(element.type),
      text: element.text,
      tags: element.tags || [],
      beat: element.beatId || undefined
    }))
  };
}

export function convertScriptTypeToLibElementType(type: ScriptTypeElementType): LibElementType {
  // Map enum values to string literal types
  switch (type) {
    case ScriptTypeElementType.SCENE_HEADING:
      return 'scene-heading';
    case ScriptTypeElementType.ACTION:
      return 'action';
    case ScriptTypeElementType.CHARACTER:
      return 'character';
    case ScriptTypeElementType.DIALOGUE:
      return 'dialogue';
    case ScriptTypeElementType.PARENTHETICAL:
      return 'parenthetical';
    case ScriptTypeElementType.TRANSITION:
      return 'transition';
    case ScriptTypeElementType.NOTE:
      return 'note';
    default:
      return 'action';
  }
}

// Convert LibActType to ScriptTypeActType
export function convertLibActTypeToScriptType(actType: LibActType): ScriptTypeActType {
  switch (actType) {
    case 'act1':
      return ScriptTypeActType.ACT_1;
    case 'act2a':
      return ScriptTypeActType.ACT_2A;
    case 'midpoint':
      return ScriptTypeActType.MIDPOINT;
    case 'act2b':
      return ScriptTypeActType.ACT_2B;
    case 'act3':
      return ScriptTypeActType.ACT_3;
    default:
      return ScriptTypeActType.ACT_1;
  }
}

// Convert ScriptTypeActType to LibActType
export function convertScriptTypeToLibActType(actType: ScriptTypeActType): LibActType {
  switch (actType) {
    case ScriptTypeActType.ACT_1:
      return 'act1' as LibActType;
    case ScriptTypeActType.ACT_2A:
      return 'act2a' as LibActType;
    case ScriptTypeActType.MIDPOINT:
      return 'midpoint' as LibActType;
    case ScriptTypeActType.ACT_2B:
      return 'act2b' as LibActType;
    case ScriptTypeActType.ACT_3:
      return 'act3' as LibActType;
    default:
      return 'act1' as LibActType;
  }
}

// Convert lib Structure to script Structure
export function convertStructures(structures: LibStructure[]): ScriptTypeStructure[] {
  if (!structures || !Array.isArray(structures)) {
    return [];
  }

  return structures.map(structure => {
    if (!structure || typeof structure !== 'object') {
      return {
        id: '',
        name: '',
        description: '',
        structure_type: 'three_act',
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
      // Only use projectId if it exists on the structure
      ...(structure.projectId ? { projectId: structure.projectId } : {}),
      ...(structure.projectTitle ? { projectTitle: structure.projectTitle } : {}),
      author_id: '',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      acts: Array.isArray(structure.acts) ? structure.acts.map(act => ({
        id: act.id,
        title: act.title,
        description: act.description || '',
        act_type: convertLibActTypeToScriptType(act.act_type),
        colorHex: act.colorHex || '#000000',
        structure_id: '',
        order: 0,
        startPosition: act.startPosition || 0,
        endPosition: act.endPosition || 100,
        beats: Array.isArray(act.beats) ? act.beats.map(beat => ({
          id: beat.id,
          title: beat.title,
          description: beat.description || '',
          act_id: '',
          order: 0,
          timePosition: beat.timePosition || 0,
          pageRange: beat.pageRange || '',
          notes: beat.notes || '',
          complete: beat.complete || false
        })) : []
      })) : []
    };
  });
}

// Convert title page data
export function convertTitlePageData(titlePage: LibTitlePageData): ScriptTypeTitlePageData {
  return {
    title: titlePage.title || '',
    author: titlePage.author || '',
    contact: titlePage.contact || '',
    basedOn: titlePage.basedOn || ''
  };
}

export function convertScriptTypeTitlePageToLib(titlePage: ScriptTypeTitlePageData): LibTitlePageData {
  return {
    title: titlePage.title || '',
    author: titlePage.author || '',
    contact: titlePage.contact || '',
    basedOn: titlePage.basedOn || ''
  };
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
    actId: undefined
  }));
}
