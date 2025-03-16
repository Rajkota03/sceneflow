
import { Json } from '@/integrations/supabase/types';

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
  tags?: string[]; // Add tags array to script elements
}

export interface ScriptContent {
  elements: ScriptElement[];
}

export interface Project {
  id: string;
  title: string;
  authorId?: string;
  createdAt: Date | string;
  updatedAt: Date | string;
  content: ScriptContent;
  notes?: Note[];
}

export type Note = {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
};

export type ElementType = 
  | 'scene-heading' 
  | 'action' 
  | 'character' 
  | 'dialogue' 
  | 'parenthetical' 
  | 'transition' 
  | 'note';

export const scriptContentToJson = (content: ScriptContent): Json => {
  return content as unknown as Json;
};

export const jsonToScriptContent = (json: Json | null): ScriptContent => {
  if (!json) {
    return { elements: [] };
  }
  
  if (typeof json === 'object' && json !== null && 'elements' in json) {
    return json as unknown as ScriptContent;
  }
  
  return { elements: [] };
};

export function serializeNotes(notes: Note[]): any[] {
  if (!notes || !Array.isArray(notes)) return [];
  
  return notes.map(note => ({
    ...note,
    createdAt: note.createdAt instanceof Date ? note.createdAt.toISOString() : note.createdAt,
    updatedAt: note.updatedAt instanceof Date ? note.updatedAt.toISOString() : note.updatedAt
  }));
}

export function deserializeNotes(jsonNotes: any[]): Note[] {
  if (!jsonNotes || !Array.isArray(jsonNotes)) return [];
  
  return jsonNotes.map(note => ({
    id: String(note.id || `note-${Date.now()}`),
    title: String(note.title || 'Untitled Note'),
    content: String(note.content || ''),
    createdAt: note.createdAt ? new Date(note.createdAt) : new Date(),
    updatedAt: note.updatedAt ? new Date(note.updatedAt) : new Date()
  }));
}
