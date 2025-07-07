import { v4 as uuidv4 } from 'uuid';

export const EMPTY_ACTION = {
  id: uuidv4(),
  type: 'action' as const,
  children: [{ text: '' }],
};

// Minimal document when new or blank
export const BLANK_DOCUMENT = [EMPTY_ACTION];