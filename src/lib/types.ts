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
  beat?: string; // Add beat identifier
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
  selectedStructureId?: string;
  onStructureChange?: (structureId: string) => void;
  structures?: Structure[];
  selectedStructure?: Structure | null;
}

export interface ScriptElementProps {
  element: {
    id: string;
    type: string;
    text: string;
    tags?: string[];
    beat?: string;
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
  structures?: Structure[];
  selectedStructure?: Structure | null;
  onBeatTag?: (elementId: string, beatId: string, actId: string) => void;
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
  act_type: ActType; // Added to match usage in code
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
