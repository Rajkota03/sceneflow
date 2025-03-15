
import { Json } from '@/integrations/supabase/types';

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
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
