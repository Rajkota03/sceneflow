import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { beat_id, beat_title, current_summary, story_type, conflict_start_id } = await req.json();

    console.log('Generate Alt Beats request:', { beat_id, beat_title, story_type, conflict_start_id });

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Get conflicts matching the story type
    const { data: matchingConflicts, error: conflictError } = await supabase
      .from('conflict_situations')
      .select('*')
      .ilike('story_type', `%${story_type}%`)
      .limit(5);

    if (conflictError) {
      throw new Error(`Failed to fetch conflicts: ${conflictError.message}`);
    }

    // Step 2: If we have a conflict_start_id, also get conflicts from its lead_outs
    let leadOutConflicts = [];
    if (conflict_start_id) {
      const { data: startConflict } = await supabase
        .from('conflict_situations')
        .select('lead_outs')
        .eq('id', conflict_start_id)
        .single();

      if (startConflict?.lead_outs) {
        const leadOutIds = startConflict.lead_outs.split(',').map(id => parseInt(id.trim()));
        
        const { data: leadOuts } = await supabase
          .from('conflict_situations')
          .select('*')
          .in('id', leadOutIds)
          .limit(3);
        
        if (leadOuts) {
          leadOutConflicts = leadOuts;
        }
      }
    }

    // Combine and select best 3 conflicts
    const allConflicts = [...(matchingConflicts || []), ...leadOutConflicts];
    const selectedConflicts = allConflicts.slice(0, 3);

    if (selectedConflicts.length === 0) {
      throw new Error(`No conflicts found for story type: ${story_type}`);
    }

    // Step 3: Generate alternatives using Together AI
    const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
    if (!togetherApiKey) {
      throw new Error('TOGETHER_API_KEY not configured');
    }

    const prompt = `You are a story-doctor AI. Return 2-3 alternative summaries for a single screenplay beat.

**Current Beat**
ID: ${beat_id}
Title: ${beat_title}
Current Summary: ${current_summary}
Story Type: ${story_type}

**Available Conflicts**
${selectedConflicts.map((c, i) => `${i + 1}. [ID: ${c.id}] ${c.description}`).join('\n')}

**Instructions**
- Create 2-3 alternative beat summaries (≤ 40 words each)
- Make them cinematic and present tense
- Vary tone and detail so writer has real choice
- Base each on a different conflict above
- Keep the core dramatic function but change the specifics

**Return JSON only**
{
  "alternatives": [
    {"summary": "Alternative summary 1", "source_id": ${selectedConflicts[0]?.id || 1}},
    {"summary": "Alternative summary 2", "source_id": ${selectedConflicts[1]?.id || 2}},
    {"summary": "Alternative summary 3", "source_id": ${selectedConflicts[2]?.id || 3}}
  ]
}`;

    console.log('Sending request to Together AI...');

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [
          { role: 'user', content: prompt }
        ],
        max_tokens: 1000,
        temperature: 0.8,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Together AI API error: ${response.status} - ${errorText}`);
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let parsedAlternatives;
    try {
      const jsonMatch = generatedContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsedAlternatives = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error('No JSON found in response');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON:', parseError);
      console.error('Raw content:', generatedContent);
      
      // Fallback: create alternatives from available conflicts
      parsedAlternatives = {
        alternatives: selectedConflicts.slice(0, 3).map((conflict, index) => ({
          summary: `Alternative approach: ${conflict.description?.substring(0, 60)}...`,
          source_id: conflict.id
        }))
      };
    }

    console.log('Parsed alternatives:', parsedAlternatives);

    return new Response(JSON.stringify({
      success: true,
      alternatives: parsedAlternatives.alternatives || [],
      rawResponse: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-alt-beats function:', error);
    return new Response(JSON.stringify({
      success: false,
      error: error.message,
      alternatives: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});