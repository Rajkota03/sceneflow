
import { Json } from '@/integrations/supabase/types';
import { ScriptContent } from './elementTypes';
import { Structure, Act } from './structureTypes';
import { ActType } from './elementTypes';

// Helper functions for converting between formats
export const jsonToScriptContent = (jsonData: string | Json): ScriptContent => {
  try {
    if (typeof jsonData === 'string') {
      // Parse JSON string
      return JSON.parse(jsonData);
    } else if (jsonData && typeof jsonData === 'object') {
      // Use the JSON object directly
      return jsonData as unknown as ScriptContent;
    } else {
      console.error('Invalid input to jsonToScriptContent:', jsonData);
      return { elements: [] };
    }
  } catch (e) {
    console.error('Error parsing script content:', e);
    return { elements: [] };
  }
};

export const scriptContentToJson = (content: ScriptContent): string => {
  try {
    return JSON.stringify(content);
  } catch (e) {
    console.error('Error stringifying script content:', e);
    return '{"elements":[]}';
  }
};
