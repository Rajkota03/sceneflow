
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
      ...element,
      type: convertLibElementTypeToScriptType(element.type),
      tags: element.tags || [],
      beatId: element.beatId || undefined
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
      ...element,
      type: convertScriptTypeToLibElementType(element.type),
      tags: element.tags || [],
      beatId: element.beatId || undefined
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
      return 'act1';
    case ScriptTypeActType.ACT_2A:
      return 'act2a';
    case ScriptTypeActType.MIDPOINT:
      return 'midpoint';
    case ScriptTypeActType.ACT_2B:
      return 'act2b';
    case ScriptTypeActType.ACT_3:
      return 'act3';
    default:
      return 'act1';
  }
}

// Convert lib Structure to script Structure
export function convertStructures(structures: LibStructure[]): ScriptTypeStructure[] {
  return structures.map(structure => ({
    id: structure.id,
    name: structure.name,
    description: structure.description || '',
    structure_type: structure.structure_type || 'three_act',
    projectId: structure.projectId || '',
    projectTitle: structure.projectTitle || '',
    author_id: '',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    acts: structure.acts.map(act => ({
      id: act.id,
      title: act.title,
      description: act.description || '',
      act_type: convertLibActTypeToScriptType(act.act_type),
      colorHex: act.colorHex,
      startPosition: 0,
      endPosition: 100,
      beats: act.beats.map(beat => ({
        id: beat.id,
        title: beat.title,
        description: beat.description || '',
        timePosition: beat.timePosition || 0,
        pageRange: beat.pageRange || '',
        notes: beat.notes || '',
        complete: beat.complete || false
      }))
    }))
  }));
}

// Convert title page data
export function convertTitlePageData(titlePage: LibTitlePageData): ScriptTypeTitlePageData {
  return {
    title: titlePage.title || '',
    author: titlePage.author || '',
    contact: titlePage.contact || '',
    notes: titlePage.notes || ''
  };
}

export function convertScriptTypeTitlePageToLib(titlePage: ScriptTypeTitlePageData): LibTitlePageData {
  return {
    title: titlePage.title || '',
    author: titlePage.author || '',
    contact: titlePage.contact || '',
    notes: titlePage.notes || ''
  };
}
