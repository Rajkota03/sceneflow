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
      console.log('=== PLANNER DEBUG: Starting generateStoryPlan ===');
      console.log('Input received:', JSON.stringify(input, null, 2));
      
      const { data, error } = await supabase.functions.invoke('story-planner', {
        body: input
      });

      console.log('=== PLANNER DEBUG: Raw response received ===');
      console.log('Error:', error);
      console.log('Data:', JSON.stringify(data, null, 2));

      setPlanningProgress(75);

      if (error) {
        console.error('Planner function error:', error);
        throw new Error(`Planning failed: ${error.message}`);
      }

      if (!data?.success) {
        console.error('Planner function returned error:', data);
        throw new Error(data?.error || 'Planning failed');
      }

      console.log('=== PLANNER DEBUG: Validating structure plan ===');
      const plan = data.plan;
      
      // Comprehensive validation
      if (!plan) {
        console.error('No plan in response');
        throw new Error('No plan returned from planner');
      }
      
      if (!plan.structure) {
        console.error('Plan missing structure property:', plan);
        throw new Error('Generated plan is missing the structure property');
      }
      
      const requiredActs = ['act_1', 'act_2a', 'act_2b', 'act_3'];
      for (const actKey of requiredActs) {
        if (!plan.structure[actKey]) {
          console.error(`Plan missing ${actKey}:`, plan.structure);
          throw new Error(`Generated plan is missing ${actKey}`);
        }
        if (!plan.structure[actKey].sequences) {
          console.error(`Act ${actKey} missing sequences:`, plan.structure[actKey]);
          throw new Error(`Act ${actKey} is missing sequences`);
        }
      }
      
      console.log('=== PLANNER DEBUG: Structure validation passed ===');
      console.log('Plan structure keys:', Object.keys(plan.structure));
      console.log('Story plan generated successfully:', plan);
      
      setPlanningProgress(100);
      return plan;

    } catch (error) {
      console.error('=== PLANNER DEBUG: Error in generateStoryPlan ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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
      console.log('=== WRITER DEBUG: Starting generateBeatsFromPlan ===');
      console.log('Structure plan received:', JSON.stringify(structurePlan, null, 2));
      
      // Validate structure plan
      if (!structurePlan || !structurePlan.structure) {
        console.error('Invalid structure plan - missing structure property');
        throw new Error('Invalid structure plan: missing structure property');
      }

      console.log('=== WRITER DEBUG: Extracting beat slots ===');
      
      // Extract all beat slots from the structure
      const allBeatSlots: BeatSlot[] = [];
      
      Object.entries(structurePlan.structure).forEach(([actKey, act]) => {
        console.log(`Processing act: ${actKey}`, act);
        if (act && act.sequences) {
          act.sequences.forEach((sequence, seqIndex) => {
            console.log(`  Processing sequence ${seqIndex}: ${sequence.sequence_name}`, sequence);
            if (sequence && sequence.beat_slots) {
              console.log(`    Adding ${sequence.beat_slots.length} beat slots`);
              allBeatSlots.push(...sequence.beat_slots);
            } else {
              console.warn(`    Sequence missing beat_slots:`, sequence);
            }
          });
        } else {
          console.warn(`Act ${actKey} missing sequences:`, act);
        }
      });

      console.log('=== WRITER DEBUG: Beat slots extraction complete ===');
      console.log('Total beat slots to write:', allBeatSlots.length);
      console.log('Sample beat slots:', allBeatSlots.slice(0, 3));

      if (allBeatSlots.length === 0) {
        throw new Error('No beat slots found in structure plan');
      }

      const allBeats: GeneratedBeat[] = [];
      const batchSize = 8; // Process beats in smaller batches
      let currentIndex = 0;

      while (currentIndex < allBeatSlots.length) {
        console.log(`=== WRITER DEBUG: Processing batch ${Math.floor(currentIndex / batchSize) + 1} ===`);
        console.log(`Writing beats batch: ${currentIndex + 1}-${Math.min(currentIndex + batchSize, allBeatSlots.length)}`);

        const batchSlots = allBeatSlots.slice(currentIndex, currentIndex + batchSize);
        console.log('Batch slots:', batchSlots);

        const { data, error } = await supabase.functions.invoke('story-writer', {
          body: {
            structurePlan,
            beatSlots: allBeatSlots,
            startIndex: currentIndex,
            batchSize
          }
        });

        console.log('=== WRITER DEBUG: Writer response ===');
        console.log('Error:', error);
        console.log('Data:', JSON.stringify(data, null, 2));

        if (error) {
          console.error('Writer function error:', error);
          throw new Error(`Writing failed: ${error.message}`);
        }

        if (!data?.success) {
          console.error('Writer function returned error:', data);
          throw new Error(data?.error || 'Writing failed');
        }

        const newBeats = data.beats || [];
        console.log(`Generated ${newBeats.length} beats in this batch`);
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

      console.log('=== WRITER DEBUG: Beat generation complete ===');
      console.log(`Total beats generated: ${allBeats.length}`);
      setWritingProgress(100);
      return allBeats;

    } catch (error) {
      console.error('=== WRITER DEBUG: Error in generateBeatsFromPlan ===');
      console.error('Error type:', error.constructor.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
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