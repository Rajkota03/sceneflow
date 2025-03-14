
import { Project, User } from './types';
import { generateUniqueId } from './formatScript';

export const currentUser: User = {
  id: '1',
  name: 'John Doe',
  email: 'john@example.com',
  avatar: 'https://i.pravatar.cc/150?img=8'
};

export const sampleProjects: Project[] = [
  {
    id: '1',
    title: 'Summer Days',
    createdAt: new Date('2023-07-15'),
    updatedAt: new Date('2023-08-01'),
    content: {
      elements: [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'INT. COFFEE SHOP - DAY'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'SARAH, 30s, stares out the window as rain trickles down the glass. She takes a sip of her coffee and sighs.'
        },
        {
          id: generateUniqueId(),
          type: 'character',
          text: 'SARAH'
        },
        {
          id: generateUniqueId(),
          type: 'dialogue',
          text: 'Another beautiful summer day.'
        }
      ]
    }
  },
  {
    id: '2',
    title: 'The Last Stand',
    createdAt: new Date('2023-09-10'),
    updatedAt: new Date('2023-09-12'),
    content: {
      elements: [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'EXT. BATTLEFIELD - NIGHT'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Thunder cracks. Lightning illuminates CAPTAIN JAMES and his small band of soldiers, taking cover behind a broken wall.'
        }
      ]
    }
  },
  {
    id: '3',
    title: 'City Lights',
    createdAt: new Date('2023-06-05'),
    updatedAt: new Date('2023-08-20'),
    content: {
      elements: [
        {
          id: generateUniqueId(),
          type: 'scene-heading',
          text: 'EXT. CITY SKYLINE - NIGHT'
        },
        {
          id: generateUniqueId(),
          type: 'action',
          text: 'Lights twinkle across the metropolis. A lone figure stands on a rooftop, watching.'
        }
      ]
    }
  }
];

export const emptyProject: Project = {
  id: generateUniqueId(),
  title: 'Untitled Project',
  createdAt: new Date(),
  updatedAt: new Date(),
  content: {
    elements: [
      {
        id: generateUniqueId(),
        type: 'scene-heading',
        text: 'INT. LOCATION - DAY'
      },
      {
        id: generateUniqueId(),
        type: 'action',
        text: ''
      }
    ]
  }
};
