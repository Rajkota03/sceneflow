
// Define all types with proper exports

// Basic element types
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
}

export interface ScriptContent {
  elements: ScriptElement[];
}

export type ActCountsRecord = {
  [key in ActType]: number;
};

export type BeatMode = 'on' | 'off';

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
}

export interface ScriptElementProps {
  element: {
    id: string;
    type: string;
    text: string;
    tags?: string[];
  };
  previousElementType?: string;
  onChange: (id: string, text: string, type: string) => void;
  onFocus: () => void;
  isActive: boolean;
  onNavigate: (direction: 'up' | 'down', id: string) => void;
  onEnterKey: (id: string, shiftKey: boolean) => void;
  onFormatChange: (id: string, newType: string) => void;
  onTagsChange: (elementId: string, tags: string[]) => void;
  characterNames: string[];
  projectId?: string;
  beatMode?: BeatMode;
}

// Structure-related types
export interface Structure {
  id: string;
  name: string;
  description?: string;
  acts: Act[];
  createdAt: Date;
  updatedAt: Date;
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

// Note-related types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

// Project-related types
export interface Project {
  id: string;
  title: string;
  content: ScriptContent;
  updated_at: string; // Changed from Date to string to match what's coming from the DB
  created_at: string; // Changed from Date to string to match what's coming from the DB
  user_id?: string;
  author_id?: string; // Added this field that appears in the database
}

export interface TitlePageData {
  title: string;
  author: string;
  contact: string;
}

// Helper functions for converting between formats
export const jsonToScriptContent = (jsonString: string): ScriptContent => {
  try {
    return JSON.parse(jsonString);
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
