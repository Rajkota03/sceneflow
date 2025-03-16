
import { ScriptContent, Project } from './types';

export const mockScript: ScriptContent = {
  elements: [
    {
      id: '1',
      type: 'scene-heading',
      text: 'INT. COFFEE SHOP - DAY'
    },
    {
      id: '2',
      type: 'action',
      text: 'SARAH, 30s, sits at a corner table, typing furiously on her laptop. The coffee shop is busy, but she seems lost in her own world.'
    },
    {
      id: '3',
      type: 'character',
      text: 'SARAH'
    },
    {
      id: '4',
      type: 'dialogue',
      text: 'Come on, come on... work with me here.'
    },
    {
      id: '5',
      type: 'action',
      text: 'She sighs, deletes a paragraph, then continues typing.'
    },
    {
      id: '6',
      type: 'character',
      text: 'BARISTA'
    },
    {
      id: '7',
      type: 'parenthetical',
      text: 'calling out'
    },
    {
      id: '8',
      type: 'dialogue',
      text: 'Vanilla latte for Sarah!'
    },
    {
      id: '9',
      type: 'action',
      text: 'Sarah doesn\'t hear, too focused on her screen.'
    },
    {
      id: '10',
      type: 'character',
      text: 'BARISTA'
    },
    {
      id: '11',
      type: 'dialogue',
      text: 'Sarah? Vanilla latte?'
    },
    {
      id: '12',
      type: 'action',
      text: 'ALEX, mid-30s, casual but professional, approaches Sarah\'s table.'
    },
    {
      id: '13',
      type: 'character',
      text: 'ALEX'
    },
    {
      id: '14',
      type: 'dialogue',
      text: 'I think they\'re calling you.'
    },
    {
      id: '15',
      type: 'action',
      text: 'Sarah looks up, startled.'
    }
  ]
};

// Default empty project for new projects
export const emptyProject: Project = {
  id: '',
  title: 'Untitled Project',
  content: { elements: [] },
  author_id: '',
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString()
};
