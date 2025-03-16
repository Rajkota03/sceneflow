
import { v4 as uuidv4 } from 'uuid';

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

export function createDefaultStructure(projectId?: string, projectTitle?: string): Structure {
  // Create default three-act structure with standard beat points
  const now = new Date();
  
  return {
    id: uuidv4(),
    name: projectTitle ? `${projectTitle} Structure` : 'Three-Act Structure',
    description: 'Standard three-act structure with key story beats',
    projectId,
    projectTitle,
    createdAt: now,
    updatedAt: now,
    acts: [
      {
        id: uuidv4(),
        title: 'Act 1: Setup',
        colorHex: '#4A90E2', // Blue
        startPosition: 0,
        endPosition: 25,
        beats: [
          {
            id: uuidv4(),
            title: 'Hook',
            description: 'The opening moment that grabs attention.',
            timePosition: 1,
          },
          {
            id: uuidv4(),
            title: 'Set-Up',
            description: 'Introduce characters, their world, and their desires.',
            timePosition: 6,
          },
          {
            id: uuidv4(),
            title: 'Inciting Incident',
            description: 'A major disruption, Call to Adventure.',
            timePosition: 12,
          },
          {
            id: uuidv4(),
            title: 'Build-Up',
            description: 'Prepares protagonist for the major decision.',
            timePosition: 18,
          },
          {
            id: uuidv4(),
            title: 'First Plot Point',
            description: 'The protagonist commits to the journey, entering Act 2A.',
            timePosition: 25,
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'Act 2A: Reaction',
        colorHex: '#F5A623', // Yellow
        startPosition: 25,
        endPosition: 50,
        beats: [
          {
            id: uuidv4(),
            title: 'Reaction Phase',
            description: 'The protagonist reacts to the new world.',
            timePosition: 31,
          },
          {
            id: uuidv4(),
            title: 'First Pinch Point',
            description: 'A reminder of antagonist\'s power.',
            timePosition: 37,
          },
          {
            id: uuidv4(),
            title: 'Realization Phase',
            description: 'The protagonist learns from early failures.',
            timePosition: 43,
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'Midpoint',
        colorHex: '#FFCCCB', // Soft Red
        startPosition: 50,
        endPosition: 50,
        beats: [
          {
            id: uuidv4(),
            title: 'Major Turning Point',
            description: 'The protagonist shifts from reactive to proactive.',
            timePosition: 50,
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'Act 2B: Action',
        colorHex: '#F57C00', // Orange
        startPosition: 50,
        endPosition: 75,
        beats: [
          {
            id: uuidv4(),
            title: 'Action Phase',
            description: 'The protagonist starts taking control.',
            timePosition: 56,
          },
          {
            id: uuidv4(),
            title: 'Second Pinch Point',
            description: 'Foreshadows the next major conflict.',
            timePosition: 62,
          },
          {
            id: uuidv4(),
            title: 'Renewed Push',
            description: 'The protagonist fights harder, gaining confidence.',
            timePosition: 68,
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'Act 3: Resolution',
        colorHex: '#009688', // Green
        startPosition: 75,
        endPosition: 100,
        beats: [
          {
            id: uuidv4(),
            title: 'Third Plot Point',
            description: 'A dark moment, everything seems lost.',
            timePosition: 75,
          },
          {
            id: uuidv4(),
            title: 'Climax Begins',
            description: 'The final showdown begins.',
            timePosition: 88,
          },
          {
            id: uuidv4(),
            title: 'Climactic Moment',
            description: 'The decisive confrontation happens.',
            timePosition: 98,
          },
          {
            id: uuidv4(),
            title: 'Resolution',
            description: 'The final emotional beat, wrapping up the story.',
            timePosition: 99,
          },
        ],
      },
    ],
  };
}
