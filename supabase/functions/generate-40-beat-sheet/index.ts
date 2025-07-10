import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Set function timeout to 25 seconds (Edge Functions have 30s limit)
  const timeoutPromise = new Promise((_, reject) => {
    setTimeout(() => reject(new Error('Function timeout after 25 seconds')), 25000);
  });

  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Wrap entire function in timeout
    const mainExecution = async () => {
      console.log('Starting 40-beat sheet generation...');
      const { genre, logline, characters, model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' } = await req.json();
      
      // Use faster model if not specified
      const optimizedModel = model.includes('70B') ? 'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo' : model;
      console.log('Request params:', { genre, logline, characters, optimizedModel });

      if (!genre || !logline) {
        console.log('Missing required parameters');
        throw new Error('Missing required parameters: genre and logline are required');
      }

      // Initialize Supabase client
      const supabaseUrl = Deno.env.get('SUPABASE_URL');
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
      const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');
      
      console.log('Environment check:', { 
        hasUrl: !!supabaseUrl, 
        hasKey: !!supabaseKey,
        hasTogetherKey: !!togetherApiKey,
        urlPrefix: supabaseUrl?.substring(0, 20) 
      });
      
      if (!supabaseUrl || !supabaseKey) {
        console.error('Missing Supabase configuration');
        throw new Error('Supabase configuration missing');
      }
      
      if (!togetherApiKey) {
        console.error('Missing Together API key');
        throw new Error('TOGETHER_API_KEY not configured');
      }
      
      const supabase = createClient(supabaseUrl, supabaseKey);

      // Optimized database queries - fetch only essential fields in parallel
      console.log('Fetching data from database...');
      
      const [beatTemplatesResult, conflictsResult, masterplotsResult] = await Promise.all([
        supabase
          .from('beat_template')
          .select('id, title, type, function')
          .order('id'),
        supabase
          .from('conflict_situations')
          .select('id, description, lead_outs, story_type')
          .ilike('story_type', `%${genre}%`)
          .limit(3),
        supabase
          .from('masterplots')
          .select('masterplot_id')
          .limit(1)
      ]);

      if (beatTemplatesResult.error) {
        console.error('Beat template error:', beatTemplatesResult.error);
        throw new Error(`Failed to fetch beat templates: ${beatTemplatesResult.error.message}`);
      }

      if (conflictsResult.error) {
        console.error('Conflicts error:', conflictsResult.error);
        throw new Error(`Failed to fetch conflicts: ${conflictsResult.error.message}`);
      }

      if (masterplotsResult.error) {
        console.error('Masterplots error:', masterplotsResult.error);
        throw new Error(`Failed to fetch masterplots: ${masterplotsResult.error.message}`);
      }

      const beatTemplates = beatTemplatesResult.data;
      const conflicts = conflictsResult.data;
      const masterplots = masterplotsResult.data;

      console.log(`Found ${beatTemplates?.length || 0} beat templates, ${conflicts?.length || 0} conflicts`);
      
      if (!beatTemplates || beatTemplates.length !== 40) {
        throw new Error(`Expected 40 beats but found ${beatTemplates?.length || 0}`);
      }

      if (!conflicts || conflicts.length === 0) {
        throw new Error(`No conflicts found for genre: ${genre}`);
      }

      if (!masterplots || masterplots.length === 0) {
        throw new Error(`No masterplots found`);
      }

      const selectedConflict = conflicts[0];
      const selectedMasterplot = masterplots[0];

      // Simplified conflict inspiration
      const conflictInspiration = selectedConflict.description || '';

      // Build story-specific prompt focusing on actual events, not templates
      const prompt = `Write exactly 40 story beats for this specific story: "${logline}"

Genre: ${genre}
Characters: ${characters || 'Create character names that fit this story'}

IMPORTANT: You must write exactly 40 beats. Number them 1-40.

Create 40 specific story events that happen in this exact story. Each beat should describe what actually happens to these characters in this story.

DO NOT use generic screenplay terms like "Opening Image" or "Theme Stated". Instead, describe the actual events.

Examples of what I want:
- "Tony finds the old treasure map in his grandmother's attic"
- "The friends argue about whether to trust Tony's crazy plan"
- "They sneak into the abandoned mine at midnight"

Return JSON with exactly 40 beats like this:
{"beats": [
  {"id": 1, "title": "Tony discovers the map", "type": "Setup", "summary": "Tony finds his grandfather's old treasure map while cleaning out the attic, showing it marks a location near their town", "alternatives": []},
  {"id": 2, "title": "Friends are skeptical", "type": "Setup", "summary": "Tony shows the map to his friends who think it's probably fake, but agree to research it online", "alternatives": []},
  ...continue to beat 40...
]}

CRITICAL: Must return exactly 40 beats numbered 1-40. Write about THIS SPECIFIC STORY with these characters and this plot.`;

      console.log('Sending request to Together.ai for 40-beat generation');

      // Create timeout for AI API call (20 seconds)
      const apiTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('AI API timeout after 20 seconds')), 20000);
      });

      const apiCall = fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${togetherApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: optimizedModel,
          messages: [
            {
              role: 'system',
              content: 'You are a screenplay expert. Generate concise 40-beat sheets in JSON format.'
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          max_tokens: 4000, // Increased token limit for 40 beats
          temperature: 0.6
        }),
      });

      const response = await Promise.race([apiCall, apiTimeout]);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Together AI API error details:', { 
          status: response.status, 
          statusText: response.statusText,
          errorText: errorText.substring(0, 500)
        });
        
        // Handle specific error types
        if (response.status === 429) {
          throw new Error('API rate limit exceeded. Please try again in a few minutes.');
        } else if (response.status >= 500) {
          throw new Error('Together AI service temporarily unavailable. Please try again.');
        } else {
          throw new Error(`Together AI API error (${response.status}): ${response.statusText}`);
        }
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
        
        // Validate the structure and count
        if (!parsedBeats.beats || !Array.isArray(parsedBeats.beats)) {
          throw new Error('Invalid response structure: missing beats array');
        }
        
        if (parsedBeats.beats.length !== 40) {
          console.log(`AI generated ${parsedBeats.beats.length} beats instead of 40, using fallback`);
          throw new Error(`Expected 40 beats but got ${parsedBeats.beats.length}`);
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

      return { 
        success: true, 
        beats: parsedBeats,
        masterplotUsed: {
          id: selectedMasterplot.masterplot_id,
          story_type: selectedConflict.story_type
        },
        rawResponse: generatedContent
      };
    };

    // Execute with timeout
    const result = await Promise.race([mainExecution(), timeoutPromise]);
    
    return new Response(JSON.stringify(result), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in generate-40-beat-sheet function:', error);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message,
      stack: error.stack 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});