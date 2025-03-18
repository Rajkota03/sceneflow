
// Define all types with proper exports
import { Json } from '@/integrations/supabase/types';

// Basic element types
export type ElementType = 
  'scene-heading' | 
  'action' | 
  'character' | 
  'dialogue' | 
  'parenthetical' | 
  'transition' | 
  'note';

// Script element related types
export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  tags?: string[];
  beat?: string;
}

export interface ScriptContent {
  elements: ScriptElement[];
  title?: string;
  author?: string;
}

export enum ActType {
  // Three Act Structure
  ACT_1 = 'ACT_1',
  ACT_2A = 'ACT_2A',
  MIDPOINT = 'MIDPOINT',
  ACT_2B = 'ACT_2B',
  ACT_3 = 'ACT_3',
  
  // Save The Cat
  OPENING_IMAGE = 'OPENING_IMAGE',
  SETUP = 'SETUP',
  CATALYST = 'CATALYST',
  DEBATE = 'DEBATE',
  BREAK_INTO_2 = 'BREAK_INTO_2',
  B_STORY = 'B_STORY',
  FUN_AND_GAMES = 'FUN_AND_GAMES',
  BAD_GUYS_CLOSE_IN = 'BAD_GUYS_CLOSE_IN',
  ALL_IS_LOST = 'ALL_IS_LOST',
  DARK_NIGHT_OF_SOUL = 'DARK_NIGHT_OF_SOUL',
  BREAK_INTO_3 = 'BREAK_INTO_3',
  FINALE = 'FINALE',
  
  // Hero's Journey
  ORDINARY_WORLD = 'ORDINARY_WORLD',
  CALL_TO_ADVENTURE = 'CALL_TO_ADVENTURE',
  REFUSAL = 'REFUSAL',
  MENTOR = 'MENTOR',
  CROSSING_THRESHOLD = 'CROSSING_THRESHOLD',
  TESTS_ALLIES_ENEMIES = 'TESTS_ALLIES_ENEMIES',
  APPROACH = 'APPROACH',
  ORDEAL = 'ORDEAL',
  REWARD = 'REWARD',
  ROAD_BACK = 'ROAD_BACK',
  RESURRECTION = 'RESURRECTION',
  RETURN = 'RETURN',
  
  // Story Circle
  YOU = 'YOU',
  NEED = 'NEED',
  GO = 'GO',
  SEARCH = 'SEARCH',
  FIND = 'FIND',
  TAKE = 'TAKE',
  CHANGE = 'CHANGE'
}

export type ActCountsRecord = Record<ActType, number>;

export type BeatMode = 'on' | 'off';

export type StructureType = 'three_act' | 'save_the_cat' | 'hero_journey' | 'story_circle';

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
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  structures?: Structure[];
}

// Note-related types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date; // Support both string and Date
  updatedAt: string | Date; // Support both string and Date
}

// Project-related types
export interface Project {
  id: string;
  title: string;
  content: ScriptContent;
  updated_at: string; 
  created_at: string;
  user_id?: string;
  author_id?: string;
}

export interface TitlePageData {
  title: string;
  author: string;
  contact: string;
  basedOn?: string;
}

// Structure-related types
export interface Structure {
  id: string;
  name: string;
  description?: string;
  acts: Act[];
  createdAt: string; // Changed from Date to string
  updatedAt: string; // Changed from Date to string
  structure_type?: string;
  projectTitle?: string;
}

export interface Act {
  id: string;
  title: string;
  colorHex: string;
  startPosition: number; // percentage (0-100)
  endPosition: number; // percentage (0-100)
  beats: Beat[];
}

export interface Beat {
  id: string;
  title: string;
  description: string;
  timePosition: number; // percentage (0-100)
  pageRange?: string;
  complete?: boolean;
  notes?: string;
}

// Helper functions for converting between formats
export const jsonToScriptContent = (jsonData: string | Json): ScriptContent => {
  try {
    if (typeof jsonData === 'string') {
      // Parse JSON string
      return JSON.parse(jsonData);
    } else if (jsonData && typeof jsonData === 'object') {
      // Use the JSON object directly
      return jsonData as unknown as ScriptContent;
    } else {
      console.error('Invalid input to jsonToScriptContent:', jsonData);
      return { elements: [] };
    }
  } catch (e) {
    console.error('Error parsing script content:', e);
    return { elements: [] };
  }
};

export const scriptContentToJson = (content: ScriptContent): string => {
  try {
    return JSON.stringify(content);
  } catch (e) {
    console.error('Error stringifying script content:', e);
    return '{"elements":[]}';
  }
};

// ThreeActStructure used in some components
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
