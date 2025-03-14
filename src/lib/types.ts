export interface ScriptElement {
  id: string;
  type: string;
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
