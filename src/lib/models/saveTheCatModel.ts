
import { v4 as uuidv4 } from 'uuid';
import { Structure, Act, Beat } from './structureModel';

export function createSaveTheCatStructure(projectId?: string, projectTitle?: string): Structure {
  // Create default Save the Cat! Beat Sheet structure with standard beat points
  const now = new Date();
  
  return {
    id: uuidv4(),
    name: projectTitle ? `${projectTitle} Save the Cat Structure` : 'Save the Cat! Beat Sheet',
    description: 'The famous Save the Cat! Beat Sheet structure with 15 key story beats',
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
            title: 'Opening Image',
            description: 'Sets the tone, mood, and scope of the story.',
            timePosition: 1,
          },
          {
            id: uuidv4(),
            title: 'Theme Stated',
            description: 'Someone tells the main character what the story is about, but they don\'t understand yet.',
            timePosition: 5,
          },
          {
            id: uuidv4(),
            title: 'Setup',
            description: 'Introduction to the character\'s world before the adventure starts.',
            timePosition: 10,
          },
          {
            id: uuidv4(),
            title: 'Catalyst',
            description: 'Something happens that changes the main character\'s life and starts them on their journey.',
            timePosition: 12,
          },
          {
            id: uuidv4(),
            title: 'Debate',
            description: 'The main character tries to decide what to do with the new opportunity.',
            timePosition: 20,
          },
          {
            id: uuidv4(),
            title: 'Break into Two',
            description: 'The main character decides to accept the challenge and enter a new world.',
            timePosition: 25,
          },
        ],
      },
      {
        id: uuidv4(),
        title: 'Act 2: Confrontation',
        colorHex: '#F5A623', // Yellow/Orange
        startPosition: 25,
        endPosition: 75,
        beats: [
          {
            id: uuidv4(),
            title: 'B Story',
            description: 'A secondary story that often carries the theme and involves a new relationship.',
            timePosition: 30,
          },
          {
            id: uuidv4(),
            title: 'Fun and Games',
            description: 'The promise of the premise is delivered. This is the heart of the movie.',
            timePosition: 35,
          },
          {
            id: uuidv4(),
            title: 'Midpoint',
            description: 'Stakes are raised, either a false victory or false defeat for the main character.',
            timePosition: 50,
          },
          {
            id: uuidv4(),
            title: 'Bad Guys Close In',
            description: 'The enemies regroup and start to close in on the main character.',
            timePosition: 62,
          },
          {
            id: uuidv4(),
            title: 'All Is Lost',
            description: 'The main character has a major setback, often involving a death or a "whiff of death".',
            timePosition: 70,
          },
          {
            id: uuidv4(),
            title: 'Dark Night of the Soul',
            description: 'The main character hits rock bottom and must decide how to proceed.',
            timePosition: 75,
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
            title: 'Break into Three',
            description: 'The main character discovers the solution and prepares for the final battle.',
            timePosition: 85,
          },
          {
            id: uuidv4(),
            title: 'Finale',
            description: 'The main character confronts the antagonist and resolves all storylines.',
            timePosition: 95,
          },
          {
            id: uuidv4(),
            title: 'Final Image',
            description: 'The opposite of the opening image, showing how much the world has changed.',
            timePosition: 99,
          },
        ],
      },
    ],
  };
}
