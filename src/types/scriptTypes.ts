
export interface ScriptContent {
  elements: ScriptElement[];
}

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  tags?: string[];
  beatId?: string;
  actId?: string;
}

export enum ElementType {
  SCENE_HEADING = 'scene-heading',
  ACTION = 'action',
  CHARACTER = 'character',
  DIALOGUE = 'dialogue',
  PARENTHETICAL = 'parenthetical',
  TRANSITION = 'transition',
  NOTE = 'note'
}

export enum ActType {
  ACT_1 = 'act1',
  ACT_2A = 'act2a',
  MIDPOINT = 'midpoint',
  ACT_2B = 'act2b',
  ACT_3 = 'act3'
}

export interface Project {
  id: string;
  title: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  content: ScriptContent;
}

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Structure {
  id: string;
  name: string;
  description: string;
  author_id: string;
  created_at: string;
  updated_at: string;
  acts?: Act[];
  structure_type?: string;
  createdAt?: string;
  updatedAt?: string;
  projectTitle?: string;
}

export interface Act {
  id: string;
  structure_id: string;
  act_type: ActType;
  title: string;
  order: number;
  beats?: Beat[];
  colorHex: string; // Changed from optional to required
  startPosition?: number;
  endPosition?: number;
}

export interface Beat {
  id: string;
  act_id: string;
  title: string;
  description: string;
  order: number; // Required property 
  is_complete?: boolean;
  timePosition?: number;
  pageRange?: string;
  complete?: boolean;
  notes?: string;
}

export function jsonToScriptContent(json: any): ScriptContent {
  if (!json || !json.elements || !Array.isArray(json.elements)) {
    return { elements: [] };
  }

  const elements: ScriptElement[] = json.elements.map((element: any) => ({
    id: element.id || '',
    type: element.type || ElementType.ACTION,
    text: element.text || '',
    tags: element.tags || [],
    beatId: element.beatId || null,
    actId: element.actId || null,
  }));

  return { elements };
}

export function scriptContentToJson(scriptContent: ScriptContent): any {
  return {
    elements: scriptContent.elements.map(element => ({
      id: element.id,
      type: element.type,
      text: element.text,
      tags: element.tags || [],
      beatId: element.beatId || null,
      actId: element.actId || null,
    }))
  };
}

export type BeatMode = 'on' | 'off';

// Record to track counts of scenes by act type
export interface ActCountsRecord {
  [ActType.ACT_1]: number;
  [ActType.ACT_2A]: number;
  [ActType.MIDPOINT]: number;
  [ActType.ACT_2B]: number;
  [ActType.ACT_3]: number;
}

// Props for the TagManager component
export interface TagManagerProps {
  scriptContent: ScriptContent;
  onFilterByTag?: (tag: string | null) => void;
  onFilterByAct?: (act: ActType | null) => void;
  activeFilter?: string | null;
  activeActFilter?: ActType | null;
  projectName?: string;
  structureName?: string;
  beatMode?: BeatMode;
  onToggleBeatMode?: (mode: BeatMode) => void;
  structures?: Structure[];
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  selectedStructure?: Structure | null;
}

// Add ThreeActStructure type from lib/types.ts
export interface ThreeActStructure {
  id: string;
  name: string;
  acts: {
    setup: {
      name: string;
      description: string;
      beats: {
        name: string;
        description: string;
        position: number;
      }[];
    };
    confrontation: {
      name: string;
      description: string;
      beats: {
        name: string;
        description: string;
        position: number;
      }[];
    };
    resolution: {
      name: string;
      description: string;
      beats: {
        name: string;
        description: string;
        position: number;
      }[];
    };
  };
}

// Add TitlePageData for consistency
export interface TitlePageData {
  title: string;
  author: string;
  contact: string;
  basedOn?: string;
  [key: string]: string | undefined; // Add index signature
}

// Add ScriptElementProps for EditorElement component
export interface ScriptElementProps {
  element: ScriptElement;
  previousElementType?: ElementType;
  onChange: (id: string, text: string, type: ElementType) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: ElementType) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
  structures?: Structure[];
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
}
