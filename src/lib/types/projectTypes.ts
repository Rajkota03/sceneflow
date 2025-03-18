
import { Json } from '@/integrations/supabase/types';
import { ScriptContent } from './elementTypes';

// Project-related types
export interface Project {
  id: string;
  title: string;
  content: ScriptContent;
  updated_at: string; 
  created_at: string;
  user_id?: string;
  author_id?: string;
}

// Note-related types
export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: string | Date; // Support both string and Date
  updatedAt: string | Date; // Support both string and Date
}

// Update TitlePageData to match the one in TitlePageEditor.tsx
export interface TitlePageData {
  title: string;
  author: string;
  contact?: string;
  basedOn?: string;
  [key: string]: string | undefined; // Add index signature for Json compatibility
}
