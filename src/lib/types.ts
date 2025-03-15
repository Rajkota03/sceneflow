
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

export type ActType = 1 | '2A' | 'midpoint' | '2B' | 3;

export interface StoryBeat {
  id: string;
  title: string;
  description: string;
  position: number;
  actNumber: ActType;
  isMidpoint?: boolean;
}

export interface ThreeActStructure {
  id: string;
  projectId: string;
  projectTitle?: string;
  beats: StoryBeat[];
  createdAt: Date | string;
  updatedAt: Date | string;
}

export const defaultStoryBeats: StoryBeat[] = [
  // Act 1
  {
    id: 'beat-1',
    title: 'Hook',
    description: "Grab the audience's attention with an intriguing opening scene.",
    position: 0,
    actNumber: 1
  },
  {
    id: 'beat-2',
    title: 'Setup',
    description: 'Introduce main characters, setting, and the world of the story.',
    position: 1,
    actNumber: 1
  },
  {
    id: 'beat-3',
    title: 'Inciting Incident',
    description: 'The event that sets the story in motion and disrupts the status quo.',
    position: 2,
    actNumber: 1
  },
  {
    id: 'beat-4',
    title: 'First Plot Point',
    description: 'The protagonist commits to the central conflict, leaving their ordinary world behind.',
    position: 3,
    actNumber: 1
  },
  
  // Act 2A
  {
    id: 'beat-5',
    title: 'First Pinch Point',
    description: 'The protagonist faces the first real encounter with the antagonistic forces.',
    position: 4,
    actNumber: '2A'
  },
  {
    id: 'beat-6',
    title: 'Rising Action',
    description: 'The protagonist faces increasing challenges and complications.',
    position: 5,
    actNumber: '2A'
  },
  
  // Midpoint
  {
    id: 'beat-7',
    title: 'Midpoint',
    description: 'A major reversal, revelation, or shift in perspective that changes everything.',
    position: 6,
    actNumber: 'midpoint',
    isMidpoint: true
  },
  
  // Act 2B
  {
    id: 'beat-8',
    title: 'Second Pinch Point',
    description: 'Another reminder of the antagonistic forces, often with increased intensity.',
    position: 7,
    actNumber: '2B'
  },
  {
    id: 'beat-9',
    title: 'Pre-Climax',
    description: 'Events build toward the final confrontation as stakes continue to rise.',
    position: 8,
    actNumber: '2B'
  },
  
  // Act 3
  {
    id: 'beat-10',
    title: 'Third Plot Point',
    description: 'The darkest moment where all seems lost for the protagonist.',
    position: 9,
    actNumber: 3
  },
  {
    id: 'beat-11',
    title: 'Climax',
    description: "The final confrontation where the story's central conflict is resolved.",
    position: 10,
    actNumber: 3
  },
  {
    id: 'beat-12',
    title: 'Resolution',
    description: 'Tying up loose ends and showing the new normal after the conflict is resolved.',
    position: 11,
    actNumber: 3
  }
];

export function createDefaultStructure(projectId: string, projectTitle?: string): ThreeActStructure {
  return {
    id: `structure-${Date.now()}`,
    projectId,
    projectTitle,
    beats: [...defaultStoryBeats],
    createdAt: new Date(),
    updatedAt: new Date()
  };
}
