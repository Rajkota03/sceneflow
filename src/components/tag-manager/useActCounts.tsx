
import { useState, useEffect } from 'react';
import { ActCountsRecord, ActType, ScriptContent } from '@/lib/types';

export default function useActCounts(scriptContent: ScriptContent) {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [actCounts, setActCounts] = useState<ActCountsRecord>({
    ACT_1: 0,
    ACT_2A: 0,
    MIDPOINT: 0,
    ACT_2B: 0,
    ACT_3: 0,
    
    // Save The Cat
    OPENING_IMAGE: 0,
    SETUP: 0,
    CATALYST: 0,
    DEBATE: 0,
    BREAK_INTO_2: 0,
    B_STORY: 0,
    FUN_AND_GAMES: 0,
    BAD_GUYS_CLOSE_IN: 0,
    ALL_IS_LOST: 0,
    DARK_NIGHT_OF_SOUL: 0,
    BREAK_INTO_3: 0,
    FINALE: 0,
    
    // Hero's Journey
    ORDINARY_WORLD: 0,
    CALL_TO_ADVENTURE: 0,
    REFUSAL: 0,
    MENTOR: 0,
    CROSSING_THRESHOLD: 0,
    TESTS_ALLIES_ENEMIES: 0,
    APPROACH: 0,
    ORDEAL: 0,
    REWARD: 0,
    ROAD_BACK: 0,
    RESURRECTION: 0,
    RETURN: 0,
    
    // Story Circle
    YOU: 0,
    NEED: 0,
    GO: 0,
    SEARCH: 0,
    FIND: 0,
    TAKE: 0,
    CHANGE: 0
  });

  useEffect(() => {
    if (!scriptContent || !scriptContent.elements) return;
    
    // Collect all unique tags
    const allTags = new Set<string>();
    const counts: ActCountsRecord = { ...actCounts };

    // Reset counts
    Object.keys(counts).forEach(key => {
      counts[key as ActType] = 0;
    });
    
    scriptContent.elements.forEach(element => {
      if (element.tags && element.tags.length > 0) {
        element.tags.forEach(tag => {
          allTags.add(tag);
          
          // Count by act - Three Act Structure
          if (tag.startsWith('Act 1:')) counts[ActType.ACT_1]++;
          else if (tag.startsWith('Act 2A:')) counts[ActType.ACT_2A]++;
          else if (tag.startsWith('Midpoint:')) counts[ActType.MIDPOINT]++;
          else if (tag.startsWith('Act 2B:')) counts[ActType.ACT_2B]++;
          else if (tag.startsWith('Act 3:')) counts[ActType.ACT_3]++;
          
          // Save The Cat
          else if (tag.startsWith('Opening Image:')) counts[ActType.OPENING_IMAGE]++;
          else if (tag.startsWith('Setup:')) counts[ActType.SETUP]++;
          else if (tag.startsWith('Catalyst:')) counts[ActType.CATALYST]++;
          else if (tag.startsWith('Debate:')) counts[ActType.DEBATE]++;
          else if (tag.startsWith('Break Into 2:')) counts[ActType.BREAK_INTO_2]++;
          else if (tag.startsWith('B Story:')) counts[ActType.B_STORY]++;
          else if (tag.startsWith('Fun & Games:')) counts[ActType.FUN_AND_GAMES]++;
          else if (tag.startsWith('Bad Guys Close In:')) counts[ActType.BAD_GUYS_CLOSE_IN]++;
          else if (tag.startsWith('All Is Lost:')) counts[ActType.ALL_IS_LOST]++;
          else if (tag.startsWith('Dark Night of Soul:')) counts[ActType.DARK_NIGHT_OF_SOUL]++;
          else if (tag.startsWith('Break Into 3:')) counts[ActType.BREAK_INTO_3]++;
          else if (tag.startsWith('Finale:')) counts[ActType.FINALE]++;
          
          // Hero's Journey
          else if (tag.startsWith('Ordinary World:')) counts[ActType.ORDINARY_WORLD]++;
          else if (tag.startsWith('Call to Adventure:')) counts[ActType.CALL_TO_ADVENTURE]++;
          else if (tag.startsWith('Refusal of the Call:') || tag.startsWith('Refusal:')) counts[ActType.REFUSAL]++;
          else if (tag.startsWith('Meeting the Mentor:') || tag.startsWith('Mentor:')) counts[ActType.MENTOR]++;
          else if (tag.startsWith('Crossing the Threshold:') || tag.startsWith('Crossing Threshold:')) counts[ActType.CROSSING_THRESHOLD]++;
          else if (tag.startsWith('Tests, Allies, Enemies:')) counts[ActType.TESTS_ALLIES_ENEMIES]++;
          else if (tag.startsWith('Approach to Inmost Cave:') || tag.startsWith('Approach:')) counts[ActType.APPROACH]++;
          else if (tag.startsWith('Ordeal:')) counts[ActType.ORDEAL]++;
          else if (tag.startsWith('Reward:')) counts[ActType.REWARD]++;
          else if (tag.startsWith('Road Back:')) counts[ActType.ROAD_BACK]++;
          else if (tag.startsWith('Resurrection:')) counts[ActType.RESURRECTION]++;
          else if (tag.startsWith('Return with Elixir:') || tag.startsWith('Return:')) counts[ActType.RETURN]++;
          
          // Story Circle
          else if (tag.startsWith('You:')) counts[ActType.YOU]++;
          else if (tag.startsWith('Need:')) counts[ActType.NEED]++;
          else if (tag.startsWith('Go:')) counts[ActType.GO]++;
          else if (tag.startsWith('Search:')) counts[ActType.SEARCH]++;
          else if (tag.startsWith('Find:')) counts[ActType.FIND]++;
          else if (tag.startsWith('Take:')) counts[ActType.TAKE]++;
          else if (tag.startsWith('Change:')) counts[ActType.CHANGE]++;
        });
      }
    });
    
    setAvailableTags(Array.from(allTags));
    setActCounts(counts);
  }, [scriptContent]);

  return { availableTags, actCounts };
}
