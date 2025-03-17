
import * as LibTypes from '@/lib/types';
import * as ScriptTypes from '@/types/scriptTypes';

// Convert from lib/types to scriptTypes
export function convertLibToScriptTypes(content: LibTypes.ScriptContent): ScriptTypes.ScriptContent {
  return {
    elements: content.elements.map(element => ({
      id: element.id,
      type: convertElementType(element.type),
      text: element.text,
      tags: element.tags || [],
      beatId: element.beat,
      actId: element.act ? String(element.act) : undefined
    }))
  };
}

// Convert from scriptTypes to lib/types
export function convertScriptToLibTypes(content: ScriptTypes.ScriptContent): LibTypes.ScriptContent {
  return {
    elements: content.elements.map(element => ({
      id: element.id,
      type: element.type as LibTypes.ElementType,
      text: element.text,
      tags: element.tags,
      beat: element.beatId,
      act: element.actId ? element.actId as unknown as LibTypes.ActType : undefined
    }))
  };
}

// Convert element types between the two systems
function convertElementType(type: string): ScriptTypes.ElementType {
  switch (type) {
    case 'scene-heading':
      return ScriptTypes.ElementType.SCENE_HEADING;
    case 'action':
      return ScriptTypes.ElementType.ACTION;
    case 'character':
      return ScriptTypes.ElementType.CHARACTER;
    case 'dialogue':
      return ScriptTypes.ElementType.DIALOGUE;
    case 'parenthetical':
      return ScriptTypes.ElementType.PARENTHETICAL;
    case 'transition':
      return ScriptTypes.ElementType.TRANSITION;
    case 'note':
      return ScriptTypes.ElementType.NOTE;
    default:
      return ScriptTypes.ElementType.ACTION;
  }
}

// Convert ActType between the two systems
export function convertActType(act: LibTypes.ActType): ScriptTypes.ActType {
  switch (act) {
    case LibTypes.ActType.ACT_1:
      return ScriptTypes.ActType.ACT_1;
    case LibTypes.ActType.ACT_2A:
      return ScriptTypes.ActType.ACT_2A;
    case LibTypes.ActType.MIDPOINT:
      return ScriptTypes.ActType.MIDPOINT;
    case LibTypes.ActType.ACT_2B:
      return ScriptTypes.ActType.ACT_2B;
    case LibTypes.ActType.ACT_3:
      return ScriptTypes.ActType.ACT_3;
    default:
      return ScriptTypes.ActType.ACT_1;
  }
}

// Convert Structure between the two systems
export function convertStructure(structure: LibTypes.Structure): ScriptTypes.Structure {
  return {
    id: structure.id,
    name: structure.name,
    description: structure.description || '',
    author_id: structure.projectTitle || '',
    created_at: structure.createdAt,
    updated_at: structure.updatedAt,
    createdAt: structure.createdAt,
    updatedAt: structure.updatedAt,
    structure_type: structure.structure_type,
    acts: structure.acts?.map(act => ({
      id: act.id,
      structure_id: structure.id,
      act_type: convertActType(act.act_type),
      title: act.title,
      order: act.order || 0,
      colorHex: act.colorHex,
      startPosition: act.startPosition,
      endPosition: act.endPosition,
      beats: act.beats?.map(beat => ({
        id: beat.id,
        act_id: act.id,
        title: beat.title,
        description: beat.description,
        order: beat.order || 0,
        is_complete: beat.complete,
        pageRange: beat.pageRange,
        complete: beat.complete,
        notes: beat.notes
      }))
    }))
  };
}

// Convert Structure[] between the two systems
export function convertStructures(structures: LibTypes.Structure[]): ScriptTypes.Structure[] {
  return structures.map(convertStructure);
}
