
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || "https://cxnmgrtcguwpwoueqwyl.supabase.co";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImN4bm1ncnRjZ3V3cHdvdWVxd3lsIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDE5Nzg1MzksImV4cCI6MjA1NzU1NDUzOX0.sh1GrJK8cI9e3vgurUjN3deVJaGX7Js1BzMAAQcvwa4";

export const supabase = createClient<Database>(supabaseUrl, supabaseAnonKey);

// Helper function to check if a note exists by ID
export async function checkNoteExists(noteId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('standalone_notes')
    .select('id')
    .eq('id', noteId)
    .single();
    
  if (error && error.code !== 'PGRST116') {
    console.error('Error checking note existence:', error);
    return false;
  }
  
  return !!data;
}

// Helper function to generate unique note ID
export function generateUniqueNoteId(): string {
  return `note-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
}
