
export interface Project {
  id: string;
  title: string;
  createdAt: Date;
  updatedAt: Date;
  content: ScriptContent;
}

export interface ScriptContent {
  elements: ScriptElement[];
}

export type ElementType = 
  | 'scene-heading' 
  | 'action' 
  | 'character' 
  | 'dialogue' 
  | 'parenthetical' 
  | 'transition'
  | 'note';

export interface ScriptElement {
  id: string;
  type: ElementType;
  text: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}
