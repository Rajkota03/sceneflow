import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.3';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Beat {
  id: number;
  title: string;
  type: string;
  summary: string;
  source_id?: number;
  alternatives?: Array<{
    summary: string;
    source_id: number;
  }>;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { beats_json, changed_index, model } = await req.json();
    
    console.log('Regenerating downstream beats:', { changed_index, model, beats_count: beats_json?.length });

    if (!beats_json || !Array.isArray(beats_json) || changed_index === undefined) {
      throw new Error('Invalid input: beats_json must be an array and changed_index must be provided');
    }

    // Initialize Supabase client
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Get the beat that was changed
    const changedBeat = beats_json.find((b: Beat) => b.id === changed_index);
    if (!changedBeat || !changedBeat.source_id) {
      throw new Error('Changed beat not found or missing source_id');
    }

    console.log('Changed beat:', changedBeat);

    // Query conflict_situations for lead_outs to determine next conflict path
    const { data: conflictData, error: conflictError } = await supabase
      .from('conflict_situations')
      .select('lead_outs, description')
      .eq('id', changedBeat.source_id)
      .single();

    if (conflictError) {
      console.error('Error fetching conflict situation:', conflictError);
      throw new Error(`Failed to fetch conflict situation: ${conflictError.message}`);
    }

    console.log('Conflict data:', conflictData);

    // Parse lead_outs to get potential next conflicts
    let nextConflictIds: number[] = [];
    if (conflictData.lead_outs) {
      try {
        nextConflictIds = JSON.parse(conflictData.lead_outs);
      } catch {
        // If lead_outs is not JSON, treat as comma-separated string
        nextConflictIds = conflictData.lead_outs.split(',').map((id: string) => parseInt(id.trim())).filter((id: number) => !isNaN(id));
      }
    }

    console.log('Next conflict IDs:', nextConflictIds);

    // Prepare beats context for the AI
    const keepBeats = beats_json.slice(0, beats_json.findIndex((b: Beat) => b.id === changed_index) + 1);
    const beatsToRegenerate = beats_json.slice(beats_json.findIndex((b: Beat) => b.id === changed_index) + 1);

    console.log('Keeping beats 1-' + keepBeats.length + ', regenerating remaining ' + beatsToRegenerate.length);

    // Prepare the prompt for Together AI
    const prompt = `You are a story-consistency AI helping to regenerate beats after a story change.

**Context:**
The story beats 1-${keepBeats.length} are finalized. Beat ${changed_index} was just changed to: "${changedBeat.summary}"

**Current Conflict Path:**
The changed beat (ID ${changed_index}) uses conflict ${changedBeat.source_id}: "${conflictData.description}"
Next possible conflicts: ${nextConflictIds.join(', ')}

**Task:**
Regenerate beats ${keepBeats.length + 1}-40 to maintain story consistency with the new beat ${changed_index}.

**Requirements:**
1. Keep the same macro functions for each beat position (Setup, Fun & Games, Bad Guys Close In, Finale)
2. Ensure logical story flow from the new beat ${changed_index}
3. Use the conflict path starting from conflict IDs: ${nextConflictIds.join(', ')}
4. Each beat should be 1-2 sentences, focusing on the key story moment
5. Maintain the original story structure and pacing

**Previous Beats for Context:**
${keepBeats.map((b: Beat) => `Beat ${b.id} (${b.type}): ${b.summary}`).join('\n')}

**Beats to Regenerate (keep same types):**
${beatsToRegenerate.map((b: Beat) => `Beat ${b.id} (${b.type}): [REGENERATE]`).join('\n')}

Return ONLY a JSON object with this structure:
{
  "beats": [
    // Include ALL beats 1-40, keeping beats 1-${keepBeats.length} unchanged
    ${keepBeats.map((b: Beat) => `{"id": ${b.id}, "title": "${b.title}", "type": "${b.type}", "summary": "${b.summary}", "source_id": ${b.source_id || 'null'}}`).join(',\n    ')}${beatsToRegenerate.length > 0 ? ',\n    // Regenerated beats with new summaries but same types' : ''}
  ]
}`;

    console.log('Sending prompt to Together AI...');

    // Call Together AI
    const togetherResponse = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('TOGETHER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model || 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional story development AI. You excel at maintaining story consistency and logical narrative flow. Always respond with valid JSON only.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 8000,
        temperature: 0.7,
      }),
    });

    if (!togetherResponse.ok) {
      const errorText = await togetherResponse.text();
      console.error('Together AI error:', errorText);
      throw new Error(`Together AI request failed: ${togetherResponse.status} ${errorText}`);
    }

    const aiResponse = await togetherResponse.json();
    console.log('Together AI response received');

    let generatedContent = aiResponse.choices[0].message.content;
    
    // Clean up the response to extract JSON
    generatedContent = generatedContent.replace(/```json\s*/, '').replace(/```\s*$/, '').trim();
    
    let parsedBeats;
    try {
      parsedBeats = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse AI response:', generatedContent);
      throw new Error(`Failed to parse AI response: ${parseError.message}`);
    }

    if (!parsedBeats.beats || !Array.isArray(parsedBeats.beats)) {
      throw new Error('AI response does not contain valid beats array');
    }

    console.log('Successfully regenerated', parsedBeats.beats.length, 'beats');

    // Assign source_ids to regenerated beats based on conflict progression
    const updatedBeats = parsedBeats.beats.map((beat: Beat, index: number) => {
      if (index < keepBeats.length) {
        // Keep original beats unchanged
        return beat;
      } else {
        // For regenerated beats, assign source_ids from the conflict progression
        const conflictIndex = (index - keepBeats.length) % nextConflictIds.length;
        return {
          ...beat,
          source_id: nextConflictIds[conflictIndex] || null
        };
      }
    });

    return new Response(
      JSON.stringify({ 
        beats: updatedBeats,
        changed_index,
        regenerated_count: beatsToRegenerate.length
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );

  } catch (error) {
    console.error('Error in regenerate-downstream-beats:', error);
    return new Response(
      JSON.stringify({ 
        error: error.message,
        details: 'Check function logs for more information'
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
