
import { useState, useEffect } from 'react';
import { ScriptContent, ActType, ActCountsRecord } from '@/lib/types';

const useActCounts = (scriptContent: ScriptContent) => {
  const [availableTags, setAvailableTags] = useState<string[]>([]);
  const [actCounts, setActCounts] = useState<ActCountsRecord>({
    // Three Act Structure
    [ActType.ACT_1]: 0,
    [ActType.ACT_2A]: 0,
    [ActType.MIDPOINT]: 0,
    [ActType.ACT_2B]: 0,
    [ActType.ACT_3]: 0,
    
    // Save The Cat
    [ActType.OPENING_IMAGE]: 0,
    [ActType.SETUP]: 0,
    [ActType.CATALYST]: 0,
    [ActType.DEBATE]: 0,
    [ActType.BREAK_INTO_2]: 0,
    [ActType.B_STORY]: 0,
    [ActType.FUN_AND_GAMES]: 0,
    [ActType.BAD_GUYS_CLOSE_IN]: 0,
    [ActType.ALL_IS_LOST]: 0,
    [ActType.DARK_NIGHT_OF_SOUL]: 0,
    [ActType.BREAK_INTO_3]: 0,
    [ActType.FINALE]: 0,
    
    // Hero's Journey
    [ActType.ORDINARY_WORLD]: 0,
    [ActType.CALL_TO_ADVENTURE]: 0,
    [ActType.REFUSAL]: 0,
    [ActType.MENTOR]: 0,
    [ActType.CROSSING_THRESHOLD]: 0,
    [ActType.TESTS_ALLIES_ENEMIES]: 0,
    [ActType.APPROACH]: 0,
    [ActType.ORDEAL]: 0,
    [ActType.REWARD]: 0,
    [ActType.ROAD_BACK]: 0,
    [ActType.RESURRECTION]: 0,
    [ActType.RETURN]: 0,
    
    // Story Circle
    [ActType.YOU]: 0,
    [ActType.NEED]: 0,
    [ActType.GO]: 0,
    [ActType.SEARCH]: 0,
    [ActType.FIND]: 0,
    [ActType.TAKE]: 0,
    [ActType.CHANGE]: 0
  });

  useEffect(() => {
    if (!scriptContent.elements) return;

    const tags: string[] = [];
    const actCountsTemp: ActCountsRecord = { ...actCounts };
    
    // Reset all counts to 0
    Object.keys(actCountsTemp).forEach(key => {
      actCountsTemp[key as ActType] = 0;
    });

    scriptContent.elements.forEach(element => {
      if (element.type === 'scene-heading' && element.tags && element.tags.length > 0) {
        // Add unique tags to the availableTags array
        element.tags.forEach(tag => {
          if (!tags.includes(tag)) {
            tags.push(tag);
          }
          
          // Count scenes by act type based on tags
          // Three Act Structure
          if (tag.startsWith('Act 1:')) {
            actCountsTemp[ActType.ACT_1]++;
          } else if (tag.startsWith('Act 2A:')) {
            actCountsTemp[ActType.ACT_2A]++;
          } else if (tag.startsWith('Midpoint:')) {
            actCountsTemp[ActType.MIDPOINT]++;
          } else if (tag.startsWith('Act 2B:')) {
            actCountsTemp[ActType.ACT_2B]++;
          } else if (tag.startsWith('Act 3:')) {
            actCountsTemp[ActType.ACT_3]++;
          }
          
          // Save The Cat
          else if (tag.startsWith('Opening Image:')) {
            actCountsTemp[ActType.OPENING_IMAGE]++;
          } else if (tag.startsWith('Setup:')) {
            actCountsTemp[ActType.SETUP]++;
          } else if (tag.startsWith('Catalyst:')) {
            actCountsTemp[ActType.CATALYST]++;
          } else if (tag.startsWith('Debate:')) {
            actCountsTemp[ActType.DEBATE]++;
          } else if (tag.startsWith('Break Into 2:')) {
            actCountsTemp[ActType.BREAK_INTO_2]++;
          } else if (tag.startsWith('B Story:')) {
            actCountsTemp[ActType.B_STORY]++;
          } else if (tag.startsWith('Fun & Games:')) {
            actCountsTemp[ActType.FUN_AND_GAMES]++;
          } else if (tag.startsWith('Bad Guys Close In:')) {
            actCountsTemp[ActType.BAD_GUYS_CLOSE_IN]++;
          } else if (tag.startsWith('All Is Lost:')) {
            actCountsTemp[ActType.ALL_IS_LOST]++;
          } else if (tag.startsWith('Dark Night of Soul:')) {
            actCountsTemp[ActType.DARK_NIGHT_OF_SOUL]++;
          } else if (tag.startsWith('Break Into 3:')) {
            actCountsTemp[ActType.BREAK_INTO_3]++;
          } else if (tag.startsWith('Finale:')) {
            actCountsTemp[ActType.FINALE]++;
          }
          
          // Hero's Journey
          else if (tag.startsWith('Ordinary World:')) {
            actCountsTemp[ActType.ORDINARY_WORLD]++;
          } else if (tag.startsWith('Call to Adventure:')) {
            actCountsTemp[ActType.CALL_TO_ADVENTURE]++;
          } else if (tag.startsWith('Refusal of the Call:')) {
            actCountsTemp[ActType.REFUSAL]++;
          } else if (tag.startsWith('Meeting the Mentor:')) {
            actCountsTemp[ActType.MENTOR]++;
          } else if (tag.startsWith('Crossing the Threshold:')) {
            actCountsTemp[ActType.CROSSING_THRESHOLD]++;
          } else if (tag.startsWith('Tests, Allies, Enemies:')) {
            actCountsTemp[ActType.TESTS_ALLIES_ENEMIES]++;
          } else if (tag.startsWith('Approach to Inmost Cave:')) {
            actCountsTemp[ActType.APPROACH]++;
          } else if (tag.startsWith('Ordeal:')) {
            actCountsTemp[ActType.ORDEAL]++;
          } else if (tag.startsWith('Reward:')) {
            actCountsTemp[ActType.REWARD]++;
          } else if (tag.startsWith('Road Back:')) {
            actCountsTemp[ActType.ROAD_BACK]++;
          } else if (tag.startsWith('Resurrection:')) {
            actCountsTemp[ActType.RESURRECTION]++;
          } else if (tag.startsWith('Return with Elixir:')) {
            actCountsTemp[ActType.RETURN]++;
          }
          
          // Story Circle
          else if (tag.startsWith('You:')) {
            actCountsTemp[ActType.YOU]++;
          } else if (tag.startsWith('Need:')) {
            actCountsTemp[ActType.NEED]++;
          } else if (tag.startsWith('Go:')) {
            actCountsTemp[ActType.GO]++;
          } else if (tag.startsWith('Search:')) {
            actCountsTemp[ActType.SEARCH]++;
          } else if (tag.startsWith('Find:')) {
            actCountsTemp[ActType.FIND]++;
          } else if (tag.startsWith('Take:')) {
            actCountsTemp[ActType.TAKE]++;
          } else if (tag.startsWith('Return:')) {
            actCountsTemp[ActType.RETURN]++;
          } else if (tag.startsWith('Change:')) {
            actCountsTemp[ActType.CHANGE]++;
          }
        });
      }
    });

    setAvailableTags(tags);
    setActCounts(actCountsTemp);
  }, [scriptContent]);

  return { availableTags, actCounts };
};

export default useActCounts;
