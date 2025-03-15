
import { useMemo } from 'react';
import { StoryBeat, ActType } from '@/lib/types';

export const useStructureBeatsOrganizer = (beats: StoryBeat[]) => {
  // Group beats by act
  const beatsByAct = useMemo(() => {
    return beats.reduce((acc, beat) => {
      const actNumber = beat.actNumber;
      if (!acc[actNumber]) {
        acc[actNumber] = [];
      }
      acc[actNumber].push(beat);
      return acc;
    }, {} as Record<ActType | string, StoryBeat[]>);
  }, [beats]);

  // Ensure all acts are represented, even if they have no beats
  const organizedBeats = useMemo(() => {
    const allActs: ActType[] = [1, '2A', 'midpoint', '2B', 3];
    const result = [];
    
    for (const act of allActs) {
      const beatsForAct = beatsByAct[act] || [];
      result.push({
        act,
        beats: beatsForAct.sort((a, b) => a.position - b.position)
      });
    }
    
    return result;
  }, [beatsByAct]);

  return { beatsByAct, organizedBeats };
};

export default useStructureBeatsOrganizer;
