
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
}

// Define the ElementType union type which is used throughout the application
export type ElementType = 
  | 'scene-heading' 
  | 'action' 
  | 'character' 
  | 'dialogue' 
  | 'parenthetical' 
  | 'transition' 
  | 'note';

// Helper functions to convert between ScriptContent and Json
export const scriptContentToJson = (content: ScriptContent): Json => {
  return content as unknown as Json;
};

export const jsonToScriptContent = (json: Json | null): ScriptContent => {
  if (!json) {
    return { elements: [] };
  }
  
  // If it's already in the correct format with elements array
  if (typeof json === 'object' && json !== null && 'elements' in json) {
    return json as unknown as ScriptContent;
  }
  
  // Default empty content
  return { elements: [] };
};
