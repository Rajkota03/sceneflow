
// Element-related types
export type ElementType = 
  'scene-heading' | 
  'action' | 
  'character' | 
  'dialogue' | 
  'parenthetical' | 
  'transition' | 
  'note';

export enum ActType {
  ACT_1 = 'act1',
  ACT_2A = 'act2a',
  MIDPOINT = 'midpoint',
  ACT_2B = 'act2b',
  ACT_3 = 'act3'
}

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  tags?: string[];
  act?: ActType;
  beat?: string; // Beat identifier
  page?: number; // Added for page tracking
}

export interface ScriptContent {
  elements: ScriptElement[];
}

export type ActCountsRecord = {
  [key in ActType]: number;
};

export type BeatMode = 'on' | 'off';

export interface BeatSceneCount {
  beatId: string;
  actId: string;
  count: number;
  pageRange?: string;
  sceneIds?: string[]; // Added to keep track of which scenes are tagged with this beat
}
