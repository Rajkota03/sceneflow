import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface PlannerInput {
  logline: string;
  genre: string;
  characters?: string;
  additionalContext?: string;
}

interface BeatSlot {
  slot_id: number;
  slot_type: string;
  function: string;
  guidance: string;
}

interface StructurePlan {
  title: string;
  genre: string;
  theme: string;
  character_arcs: Array<{
    character: string;
    arc_type: string;
    starting_state: string;
    ending_state: string;
  }>;
  structure: {
    act_1: ActStructure;
    act_2a: ActStructure;
    act_2b: ActStructure;
    act_3: ActStructure;
  };
  key_moments: Array<{
    moment: string;
    slot_reference: number;
    significance: string;
  }>;
}

interface ActStructure {
  purpose: string;
  sequences: Array<{
    sequence_name: string;
    purpose: string;
    beat_slots: BeatSlot[];
  }>;
}

interface GeneratedBeat {
  id: number;
  title: string;
  type: string;
  summary: string;
}

export function usePlannerWriterGeneration() {
  const [isPlanning, setIsPlanning] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [planningProgress, setPlanningProgress] = useState(0);
  const [writingProgress, setWritingProgress] = useState(0);

  const generateStoryPlan = async (input: PlannerInput): Promise<StructurePlan> => {
    setIsPlanning(true);
    setPlanningProgress(25);

    try {
      console.log('Calling story-planner function with:', input);
      
      const { data, error } = await supabase.functions.invoke('story-planner', {
        body: input
      });

      setPlanningProgress(75);

      if (error) {
        console.error('Planner function error:', error);
        throw new Error(`Planning failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('Planner function returned error:', data);
        throw new Error(data?.error || 'Planning failed');
      }

      setPlanningProgress(100);
      return data.plan;

    } catch (error) {
      console.error('Error in generateStoryPlan:', error);
      throw error;
    } finally {
      setIsPlanning(false);
      setPlanningProgress(0);
    }
  };

  const generateBeatsFromPlan = async (
    structurePlan: StructurePlan,
    onProgress?: (progress: number, beats: GeneratedBeat[]) => void
  ): Promise<GeneratedBeat[]> => {
    setIsWriting(true);
    setWritingProgress(0);

    try {
      // Extract all beat slots from the structure
      const allBeatSlots: BeatSlot[] = [];
      
      Object.values(structurePlan.structure).forEach(act => {
        act.sequences.forEach(sequence => {
          allBeatSlots.push(...sequence.beat_slots);
        });
      });

      console.log('Total beat slots to write:', allBeatSlots.length);

      const allBeats: GeneratedBeat[] = [];
      const batchSize = 8; // Process beats in smaller batches
      let currentIndex = 0;

      while (currentIndex < allBeatSlots.length) {
        console.log(`Writing beats batch: ${currentIndex + 1}-${Math.min(currentIndex + batchSize, allBeatSlots.length)}`);

        const { data, error } = await supabase.functions.invoke('story-writer', {
          body: {
            structurePlan,
            beatSlots: allBeatSlots,
            startIndex: currentIndex,
            batchSize
          }
        });

        if (error) {
          console.error('Writer function error:', error);
          throw new Error(`Writing failed: ${error.message}`);
        }

        if (!data?.success) {
          console.error('Writer function returned error:', data);
          throw new Error(data?.error || 'Writing failed');
        }

        const newBeats = data.beats || [];
        allBeats.push(...newBeats);

        currentIndex += batchSize;
        const progress = Math.min((currentIndex / allBeatSlots.length) * 100, 100);
        setWritingProgress(progress);

        // Call progress callback if provided
        if (onProgress) {
          onProgress(progress, [...allBeats]);
        }

        // Small delay to prevent overwhelming the API
        if (currentIndex < allBeatSlots.length) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      setWritingProgress(100);
      return allBeats;

    } catch (error) {
      console.error('Error in generateBeatsFromPlan:', error);
      throw error;
    } finally {
      setIsWriting(false);
      setWritingProgress(0);
    }
  };

  const generateFullStory = async (
    input: PlannerInput,
    onPlanComplete?: (plan: StructurePlan) => void,
    onBeatsProgress?: (progress: number, beats: GeneratedBeat[]) => void
  ): Promise<{ plan: StructurePlan; beats: GeneratedBeat[] }> => {
    try {
      // Step 1: Generate the story plan
      const plan = await generateStoryPlan(input);
      
      if (onPlanComplete) {
        onPlanComplete(plan);
      }

      // Step 2: Generate beats from the plan
      const beats = await generateBeatsFromPlan(plan, onBeatsProgress);

      return { plan, beats };

    } catch (error) {
      console.error('Error in generateFullStory:', error);
      throw error;
    }
  };

  return {
    isPlanning,
    isWriting,
    planningProgress,
    writingProgress,
    generateStoryPlan,
    generateBeatsFromPlan,
    generateFullStory
  };
}