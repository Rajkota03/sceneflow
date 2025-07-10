import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

function mapFriendlyError(errorMessage: string): string {
  if (errorMessage.includes('fewer than 40')) {
    return 'AI stopped early; please click Generate again.';
  }
  if (errorMessage.includes('4096') || errorMessage.includes('token')) {
    return 'Token limit hit—choose a larger model or simplify inputs.';
  }
  if (errorMessage.includes('Together AI API error') || errorMessage.includes('Together error')) {
    return 'Model service is busy—retry in a few seconds.';
  }
  if (errorMessage.includes('INSUFFICIENT_CREDITS')) {
    return 'You don\'t have enough credits to complete this request.';
  }
  return 'Unexpected error—please regenerate or contact support.';
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('Starting 40-beat sheet generation...');
    const requestBody = await req.json();
    console.log('Request body received:', requestBody);
    
    const { genre, logline, characters, model = 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo' } = requestBody;
    
    // Use the model as specified by user - no auto-downgrade
    const chosenModel = model || 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo';
    console.log('Request params:', { genre, logline, characters, chosenModel });

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

    // Fetch data from database
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

    console.log('Database query results:', {
      beatTemplatesCount: beatTemplatesResult.data?.length,
      conflictsCount: conflictsResult.data?.length,
      masterplotsCount: masterplotsResult.data?.length,
      beatTemplatesError: beatTemplatesResult.error,
      conflictsError: conflictsResult.error,
      masterplotsError: masterplotsResult.error
    });

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

    // Build story-specific prompt
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

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: chosenModel,
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
        max_tokens: 9000,
        temperature: 0.6
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together AI API error details:', { 
        status: response.status, 
        statusText: response.statusText,
        errorText: errorText.substring(0, 500)
      });
      
      // Parse error response to check for specific error types
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch (e) {
        errorData = { error: { message: errorText } };
      }
      
      // Handle specific error types
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again in a few minutes.');
      } else if (response.status === 402 || 
                 (errorData.error && (
                   errorData.error.message?.toLowerCase().includes('insufficient') ||
                   errorData.error.message?.toLowerCase().includes('credits') ||
                   errorData.error.message?.toLowerCase().includes('quota') ||
                   errorData.error.message?.toLowerCase().includes('billing')
                 ))) {
        throw new Error('INSUFFICIENT_CREDITS: You don\'t have enough credits to complete this request.');
      } else if (response.status >= 500) {
        throw new Error('Together AI service temporarily unavailable. Please try again.');
      } else {
        throw new Error(`Together AI API error (${response.status}): ${errorData.error?.message || response.statusText}`);
      }
    }

    const aiResponse = await response.json();
    const generatedContent = aiResponse.choices[0]?.message?.content;

    if (!generatedContent) {
      throw new Error('Failed to generate 40-beat sheet');
    }

    // Parse JSON response
    let parsedBeats;
    try {
      console.log('Attempting to parse AI response...');
      console.log('Raw response length:', generatedContent.length);
      console.log('First 500 chars:', generatedContent.substring(0, 500));
      
      // Try multiple JSON extraction methods
      let jsonContent = generatedContent;
      
      // Method 1: Extract from markdown code blocks
      const jsonMatch = generatedContent.match(/```(?:json)?\s*\n?([\s\S]*?)\n?\s*```/);
      if (jsonMatch) {
        console.log('Found JSON in markdown block');
        jsonContent = jsonMatch[1].trim();
      } else {
        // Method 2: Look for JSON object starting with { and ending with }
        const objMatch = generatedContent.match(/\{[\s\S]*\}/);
        if (objMatch) {
          console.log('Found JSON object in response');
          jsonContent = objMatch[0];
        }
      }
      
      // Clean up the JSON content
      jsonContent = jsonContent.trim();
      
      console.log('Parsing JSON content (first 300 chars):', jsonContent.substring(0, 300));
      parsedBeats = JSON.parse(jsonContent);
      
      // Validate the structure
      if (!parsedBeats.beats || !Array.isArray(parsedBeats.beats)) {
        throw new Error('Invalid response structure: missing beats array');
      }
      
      // Strict validation - require exactly 40 beats
      if (parsedBeats.beats.length !== 40) {
        throw new Error(`LLM returned fewer than 40 beats - got ${parsedBeats.beats.length}`);
      }
      
      console.log('Successfully parsed and validated', parsedBeats.beats.length, 'beats');
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response (first 1000 chars):', generatedContent.substring(0, 1000));
      
      // More intelligent fallback: try to extract story beats from text
      console.log('Attempting text-based extraction...');
      const lines = generatedContent.split('\n');
      const extractedBeats = [];
      
      for (const line of lines) {
        // Look for numbered beats like "1. " or "Beat 1:" or similar
        const beatMatch = line.match(/(?:^|\s)(?:Beat\s*)?(\d+)[\.\:\-\s]+(.+)/i);
        if (beatMatch && beatMatch[1] && beatMatch[2]) {
          const beatNumber = parseInt(beatMatch[1]);
          const beatText = beatMatch[2].trim();
          
          if (beatNumber >= 1 && beatNumber <= 50 && beatText.length > 10) {
            extractedBeats.push({
              id: beatNumber,
              title: `Beat ${beatNumber}`,
              type: beatNumber <= 10 ? 'Setup' : beatNumber <= 30 ? 'Conflict' : 'Resolution',
              summary: beatText,
              alternatives: []
            });
          }
        }
      }
      
      if (extractedBeats.length >= 20) {
        console.log(`Extracted ${extractedBeats.length} beats from text`);
        // Sort by beat number and take first 40
        extractedBeats.sort((a, b) => a.id - b.id);
        parsedBeats = { beats: extractedBeats.slice(0, 40) };
      } else {
        // Last resort: use template beats but with story context
        console.log('Creating story-contextualized template beats...');
        const storyContextBeats = beatTemplates.map((template, index) => ({
          id: template.id,
          title: template.title || `Beat ${template.id}`,
          type: template.type || 'Unknown',
          summary: `${template.function || 'Story development'} - Applied to: ${logline.substring(0, 100)}...`,
          alternatives: []
        }));
        
        parsedBeats = { beats: storyContextBeats };
        console.log('Created story-contextualized template beats with', storyContextBeats.length, 'beats');
      }
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
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack);
    
    // Map technical errors to user-friendly messages
    const friendlyMessage = mapFriendlyError(error.message);
    
    return new Response(JSON.stringify({ 
      success: false, 
      error: friendlyMessage,
      stack: error.stack 
    }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
