
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Project {
  id: string;
  title: string;
  content: any;
  author_id: string;
  created_at: string;
  updated_at: string;
}

// Script element types
export type ElementType = 'scene-heading' | 'action' | 'character' | 'dialogue' | 'parenthetical' | 'transition' | 'note';

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  tags?: string[];
}

export interface ScriptContent {
  elements: ScriptElement[];
}

// Helper functions for serialization
export const jsonToScriptContent = (json: any): ScriptContent => {
  if (!json) return { elements: [] };
  
  // Handle if it's already a script content object
  if (json.elements && Array.isArray(json.elements)) {
    return json;
  }
  
  // Handle if it's a string
  if (typeof json === 'string') {
    try {
      const parsed = JSON.parse(json);
      return parsed;
    } catch (e) {
      console.error('Failed to parse script content', e);
      return { elements: [] };
    }
  }
  
  // Default return
  return { elements: [] };
};

export const scriptContentToJson = (content: ScriptContent): string => {
  return JSON.stringify(content);
};

export const serializeNotes = (notes: Note[]): string => {
  return JSON.stringify(notes);
};

export const deserializeNotes = (notesJson: string | null): Note[] => {
  if (!notesJson) return [];
  try {
    return JSON.parse(notesJson);
  } catch (e) {
    console.error('Failed to parse notes', e);
    return [];
  }
};

// Act Type as a string enum to fix the type errors
export enum ActType {
  ACT_1 = "ACT_1",
  ACT_2A = "ACT_2A",
  MIDPOINT = "MIDPOINT",
  ACT_2B = "ACT_2B",
  ACT_3 = "ACT_3"
}

// Story Beat Type
export interface StoryBeat {
  id: string;
  name: string;
  position: number; // percentage position in the story (0-100)
  actType: ActType;
  description?: string;
}

// Three Act Structure Type
export interface ThreeActStructure {
  id: string;
  name: string;
  beats: StoryBeat[];
}

// Structure Types (for the new feature)
export interface Beat {
  id: string;
  title: string;
  description: string;
  timePosition: number; // percentage (0-100)
}

export interface Act {
  id: string;
  title: string;
  colorHex: string;
  startPosition: number; // percentage (0-100)
  endPosition: number; // percentage (0-100)
  beats: Beat[];
}

export interface Structure {
  id: string;
  name: string;
  description?: string;
  projectId?: string;
  projectTitle?: string;
  acts: Act[];
  createdAt: Date;
  updatedAt: Date;
}
