
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
