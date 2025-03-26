
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
  page?: number; // Page number this element appears on
  continued?: boolean; // Indicates this element is continued from previous page
}

// Slate specific types
export type SlateElementType = {
  type: ElementType;
  children: SlateText[];
  id: string;
  tags?: string[];
  act?: ActType;
  beat?: string;
  page?: number;
  continued?: boolean; // Indicates this element is continued from previous page
}

export type SlateText = {
  text: string;
}

export type SlateDocument = SlateElementType[];

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

// Pagination-related types
export interface PageBreak {
  elementId: string; // ID of the element before the page break
  position: number; // Position within the element if it's split across pages
}

export interface ScriptPage {
  elements: ScriptElement[];
  pageNumber: number;
}
