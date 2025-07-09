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
    console.log('Starting 40-beat sheet generation...');
    const { genre, logline, characters, model = 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo' } = await req.json();
    console.log('Request params:', { genre, logline, characters, model });

    if (!genre || !logline) {
      console.log('Missing required parameters');
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: genre and logline are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Initialize Supabase client
    const supabaseUrl = Deno.env.get('SUPABASE_URL');
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    console.log('Supabase config:', { 
      hasUrl: !!supabaseUrl, 
      hasKey: !!supabaseKey,
      urlPrefix: supabaseUrl?.substring(0, 20) 
    });
    
    if (!supabaseUrl || !supabaseKey) {
      throw new Error('Supabase configuration missing');
    }
    
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Step 1: Get all 40 beats from beat_template
    console.log('Fetching beat templates...');
    const { data: beatTemplates, error: beatError } = await supabase
      .from('beat_template')
      .select('*')
      .order('id');

    if (beatError) {
      console.error('Beat template error:', beatError);
      throw new Error(`Failed to fetch beat templates: ${beatError.message}`);
    }

    console.log(`Found ${beatTemplates?.length || 0} beat templates`);
    if (!beatTemplates || beatTemplates.length !== 40) {
      throw new Error(`Expected 40 beats but found ${beatTemplates?.length || 0}`);
    }

    // Step 2: Query conflict_situations for matching genre (since masterplot_conflict_view has null story_types)
    const { data: conflicts, error: conflictError } = await supabase
      .from('conflict_situations')
      .select('*')
      .ilike('story_type', `%${genre}%`)
      .limit(1);

    if (conflictError) {
      throw new Error(`Failed to fetch conflicts: ${conflictError.message}`);
    }

    if (!conflicts || conflicts.length === 0) {
      throw new Error(`No conflicts found for genre: ${genre}`);
    }

    const selectedConflict = conflicts[0];

    // Get a random masterplot for the structure
    const { data: masterplots, error: masterplotError } = await supabase
      .from('masterplots')
      .select('*')
      .limit(1);

    if (masterplotError) {
      throw new Error(`Failed to fetch masterplots: ${masterplotError.message}`);
    }

    if (!masterplots || masterplots.length === 0) {
      throw new Error(`No masterplots found`);
    }

    const selectedMasterplot = masterplots[0];

    // Step 3: Build conflict chain using lead_outs from selected conflict
    let conflictChain = [selectedConflict.description || ''];
    
    if (selectedConflict.lead_outs) {
      const leadOutIds = selectedConflict.lead_outs.split(',').map(id => parseInt(id.trim()));
      
      for (const leadOutId of leadOutIds.slice(0, 2)) {
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

    // Step 4: Get alternative conflicts for same story type  
    const { data: alternativeConflicts, error: altError } = await supabase
      .from('conflict_situations')
      .select('id, description')
      .ilike('story_type', `%${genre}%`)
      .neq('id', selectedConflict.id)
      .limit(10);

    if (altError) {
      console.warn('Failed to fetch alternative conflicts:', altError.message);
    }

    // Step 5: Build the prompt for AI generation
    const prompt = `You are a professional story-development AI.

**Inputs**
Genre: ${genre}
Logline: ${logline}
Character Names (optional): ${characters || 'Not provided'}

**Data Sources**
1. beat_template: ${JSON.stringify(beatTemplates)}
2. selected_masterplot: ${JSON.stringify(selectedMasterplot)}
3. selected_conflict: ${JSON.stringify(selectedConflict)}
4. conflict_chain: ${JSON.stringify(conflictChain)}
5. alternative_conflicts: ${JSON.stringify(alternativeConflicts || [])}

**Logic**
For each of the 40 beats:
• Use beat_template.function as scaffold
• Weave in plot content derived from:
  - a_clause_text: "${selectedMasterplot.a_clause_text || ''}"
  - b_clause_text: "${selectedMasterplot.b_clause_text || ''}"
  - c_clause_text: "${selectedMasterplot.c_clause_text || ''}"
  - conflict_description and lead_outs from conflict chain
• If characters provided, replace generic roles with: ${characters || 'generic protagonist'}
• Provide 2-3 alternatives (summaries + source_id) drawn from alternative_conflicts

Return JSON exactly in this format:
{
  "beats": [
    {
      "id": 1,
      "title": "Opening Image",
      "type": "Setup",
      "summary": "...",
      "alternatives": [
        {"summary": "...", "source_id": 110},
        {"summary": "...", "source_id": 112}
      ]
    },
    ... (continue for all 40 beats)
  ]
}

**Rules**
- Keep each summary ≤ 50 words, cinematic & specific
- Never invent beats outside the 1-40 list
- Maintain internal logic/tone
- Use the exact beat titles and types from beat_template
- Generate realistic alternatives using the provided alternative_conflicts data`;

    console.log('Sending request to Together.ai for 40-beat generation');

    const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
    console.log('Together API Key available:', !!togetherApiKey);
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
        model,
        messages: [
          {
            role: 'system',
            content: 'You are a professional screenplay and story structure expert. Generate detailed 40-beat sheets with alternatives. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 4000,
        temperature: 0.7
      }),
    });

    if (!response.ok) {
      throw new Error(`Together AI API error: ${response.statusText}`);
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('Failed to generate 40-beat sheet');
    }

    // Try to parse the JSON response
    let parsedBeats;
    try {
      console.log('Attempting to parse AI response...');
      console.log('Raw response length:', generatedContent.length);
      console.log('First 500 chars:', generatedContent.substring(0, 500));
      
      // Try multiple JSON extraction methods
      let jsonContent = generatedContent;
      
      // Method 1: Extract from markdown code blocks
      const jsonMatch = generatedContent.match(/```(?:json)?\n?([\s\S]*?)\n?```/);
      if (jsonMatch) {
        console.log('Found JSON in markdown block');
        jsonContent = jsonMatch[1];
      } else {
        // Method 2: Look for JSON object starting with {
        const objMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (objMatch) {
          console.log('Found JSON object in response');
          jsonContent = objMatch[0];
        }
      }
      
      console.log('Parsing JSON content:', jsonContent.substring(0, 200));
      parsedBeats = JSON.parse(jsonContent);
      
      // Validate the structure
      if (!parsedBeats.beats || !Array.isArray(parsedBeats.beats)) {
        throw new Error('Invalid response structure: missing beats array');
      }
      
      console.log('Successfully parsed', parsedBeats.beats.length, 'beats');
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', generatedContent);
      
      // Create a fallback response using the beat templates
      console.log('Creating fallback response...');
      const fallbackBeats = beatTemplates.map((template, index) => ({
        id: template.id,
        title: template.title || `Beat ${template.id}`,
        type: template.type || 'Unknown',
        summary: `${template.function || 'Story development'} - Generated for ${genre} story`,
        alternatives: []
      }));
      
      parsedBeats = { beats: fallbackBeats };
      console.log('Created fallback with', fallbackBeats.length, 'beats');
    }

    return new Response(JSON.stringify({ 
      success: true, 
      beats: parsedBeats,
      masterplotUsed: {
        id: selectedMasterplot.masterplot_id,
        story_type: selectedConflict.story_type
      },
      rawResponse: generatedContent
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-40-beat-sheet function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});