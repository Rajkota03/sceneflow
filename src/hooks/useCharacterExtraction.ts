import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

export function useCharacterExtraction(projectId: string) {
  const [characterNames, setCharacterNames] = useState<string[]>([]);

  const extractCharacterNames = (content: any): string[] => {
    if (!content || !content.content) return [];
    
    const characters = new Set<string>();
    
    const extractFromNode = (node: any) => {
      if (node.type === 'character' && node.content) {
        const text = node.content
          .map((child: any) => child.text || '')
          .join('')
          .trim()
          .toUpperCase();
        
        if (text) {
          // Remove (CONT'D) suffix if present
          const cleanName = text.replace(/\s*\(CONT'D\)\s*$/i, '').trim();
          if (cleanName) {
            characters.add(cleanName);
          }
        }
      }
      
      if (node.content) {
        node.content.forEach(extractFromNode);
      }
    };
    
    content.content.forEach(extractFromNode);
    
    return Array.from(characters).sort();
  };

  const updateCharacterNames = async () => {
    try {
      const { data: scene } = await supabase
        .from('scenes')
        .select('content_richtext')
        .eq('project_id', projectId)
        .single();
      
      if (scene?.content_richtext) {
        const names = extractCharacterNames(scene.content_richtext);
        setCharacterNames(names);
      }
    } catch (error) {
      console.error('Error extracting character names:', error);
    }
  };

  useEffect(() => {
    updateCharacterNames();
  }, [projectId]);

  const addCharacterName = (name: string) => {
    const cleanName = name.trim().toUpperCase();
    if (cleanName && !characterNames.includes(cleanName)) {
      setCharacterNames(prev => [...prev, cleanName].sort());
    }
  };

  return {
    characterNames,
    addCharacterName,
    updateCharacterNames,
  };
}