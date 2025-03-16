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

// Act Type
export enum ActType {
  ACT_1 = 'ACT_1',
  ACT_2A = 'ACT_2A',
  MIDPOINT = 'MIDPOINT',
  ACT_2B = 'ACT_2B',
  ACT_3 = 'ACT_3',
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
