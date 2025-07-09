import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre, logline, characters } = await req.json();

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Search masterplot_conflict_view for matching genre
    const { data: masterplots, error: masterplotError } = await supabase
      .from('masterplot_conflict_view')
      .select('*')
      .ilike('story_type', `%${genre}%`);

    if (masterplotError) {
      throw new Error(`Failed to fetch masterplots: ${masterplotError.message}`);
    }

    if (!masterplots || masterplots.length === 0) {
      throw new Error(`No masterplots found for genre: ${genre}`);
    }

    // Step 2: Select a relevant or random masterplot
    const selectedMasterplot = masterplots[Math.floor(Math.random() * masterplots.length)];

    // Step 3 & 4: Extract A/B/C clauses and conflict description
    const aClauses = selectedMasterplot.a_clause_text || '';
    const bClauses = selectedMasterplot.b_clause_text || '';
    const cClauses = selectedMasterplot.c_clause_text || '';
    const conflictDescription = selectedMasterplot.conflict_description || '';

    // Step 5: Simulate conflict chain using lead_outs
    let conflictChain = [conflictDescription];
    
    if (selectedMasterplot.lead_outs) {
      const leadOutIds = selectedMasterplot.lead_outs.split(',').map(id => parseInt(id.trim()));
      
      for (const leadOutId of leadOutIds.slice(0, 2)) { // Limit to 1-2 more conflicts
        const { data: nextConflict } = await supabase
          .from('conflict_situations')
          .select('description')
          .eq('id', leadOutId)
          .single();
        
        if (nextConflict?.description) {
          conflictChain.push(nextConflict.description);
        }
      }
    }

    // Step 6: Build the beat sheet prompt
    const beatSheetPrompt = `You are a professional story developer helping build film narratives.

Given the following inputs:
- **Genre**: ${genre}
- **Logline**: ${logline}
- **Character Names** (optional): ${characters || 'Not provided'}

Story Structure Elements:
- **Setup Foundation**: ${aClauses}
- **Rising Action Foundation**: ${bClauses}
- **Resolution Foundation**: ${cClauses}
- **Core Conflicts**: ${conflictChain.join(' → ')}

Build a 7–10 step **beat sheet**, using:
- Setup (from A clause foundation)
- Rising action (from B clause foundation + conflicts)
- Climax (from conflict chain)
- Resolution (from C clause foundation)

${characters ? `Replace generic labels like "the protagonist" with the provided character names: ${characters}` : ''}

Output only the final beat sheet. Write cinematically and clearly. Format as numbered steps with brief, punchy descriptions.`;

    // Call Together AI API
    const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
    if (!togetherApiKey) {
      throw new Error('TOGETHER_API_KEY not configured');
    }

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a professional screenplay and story structure expert. Generate concise, cinematic beat sheets.'
          },
          {
            role: 'user',
            content: beatSheetPrompt
          }
        ],
        max_tokens: 1000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const beatSheet = aiResponse.choices[0]?.message?.content;

    if (!beatSheet) {
      throw new Error('Failed to generate beat sheet');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      beatSheet,
      masterplotUsed: {
        id: selectedMasterplot.masterplot_id,
        story_type: selectedMasterplot.story_type
      }
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-beat-sheet function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});