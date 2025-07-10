import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a master storyteller who excels at creating compelling, specific story beats that bring narrative structures to life. You work from detailed structural plans to craft beats that are both emotionally resonant and dramatically effective.

CORE RESPONSIBILITIES:
- Transform structural guidance into vivid, specific story beats
- Ensure each beat serves its designated function in the overall structure
- Create beats that feel natural and character-driven
- Maintain consistency with established story elements
- Build momentum and emotional engagement

BEAT WRITING PRINCIPLES:
- Every beat should advance plot, develop character, or enhance theme (ideally all three)
- Beats should feel specific to this story, not generic
- Use concrete actions and dialogue, not vague descriptions
- Create clear cause-and-effect relationships between beats
- Build in conflict and tension appropriate to the story moment
- Ensure beats support the character arcs established in the plan

QUALITY STANDARDS:
- Beats should be 50-150 words each
- Focus on what happens, not just what is discussed
- Include specific details that make the story world feel real
- Create beats that make readers want to know what happens next
- Ensure each beat has a clear beginning, middle, and end

CONSISTENCY REQUIREMENTS:
- Maintain character voice and motivation throughout
- Respect the genre expectations while finding fresh approaches
- Keep the story's core theme woven through character choices
- Ensure proper setup and payoff relationships
- Maintain the story's established tone and style`;

const WRITER_PROMPT = `You are about to write story beats based on a structural plan. Follow these guidelines:

1. UNDERSTAND THE CONTEXT
   - Review the structural plan and your specific beat assignments
   - Understand how your beats fit into the larger story flow
   - Note the character arcs and thematic elements to weave in
   - Identify key relationships and conflicts to develop

2. CRAFT COMPELLING BEATS
   - Start each beat with a clear situation or moment
   - Show character reactions and decisions, not just events
   - Include specific details that bring the story world to life
   - Create natural dialogue that reveals character and advances plot
   - End each beat with momentum toward the next story moment

3. MAINTAIN STORY UNITY
   - Keep character voices consistent throughout
   - Build on previously established story elements
   - Ensure each beat feels essential, not filler
   - Create logical cause-and-effect chains
   - Support the overall emotional journey

4. ENHANCE ENGAGEMENT
   - Include sensory details and vivid imagery
   - Create moments of surprise within expected structures
   - Build tension through character choices and obstacles
   - Use pacing to control emotional rhythm
   - Make readers care about what happens next

5. TECHNICAL EXECUTION
   - Write in present tense with active voice
   - Keep beat lengths appropriate to their function
   - Ensure each beat has a clear dramatic purpose
   - Use concrete actions and specific dialogue
   - Avoid exposition dumps or overly generic descriptions

Remember: You're bringing the blueprint to life. Make each beat feel essential, specific, and dramatically compelling while serving the larger structural plan.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    console.log('=== STORY-WRITER DEBUG: Function started ===');
    console.log('Request method:', req.method);
    console.log('Request headers:', Object.fromEntries(req.headers.entries()));
    
    let requestBody;
    try {
      requestBody = await req.json();
      console.log('=== STORY-WRITER DEBUG: Request body parsed ===');
      console.log('Request body keys:', Object.keys(requestBody));
    } catch (parseError) {
      console.error('=== STORY-WRITER DEBUG: Failed to parse request body ===');
      console.error('Parse error:', parseError);
      throw new Error('Invalid JSON in request body');
    }

    const { structurePlan, beatSlots, startIndex = 0, batchSize = 10 } = requestBody;

    console.log('=== STORY-WRITER DEBUG: Input validation ===');
    console.log('Writing beats for slots:', { startIndex, batchSize, totalSlots: beatSlots?.length });
    console.log('Structure plan exists:', !!structurePlan);
    console.log('Beat slots exists:', !!beatSlots);

    if (!structurePlan) {
      console.error('=== STORY-WRITER DEBUG: Missing structure plan ===');
      throw new Error('Structure plan is required');
    }
    
    if (!beatSlots) {
      console.error('=== STORY-WRITER DEBUG: Missing beat slots ===');
      throw new Error('Beat slots are required');
    }

    console.log('=== STORY-WRITER DEBUG: Together API Key check ===');
    console.log('Together API Key exists:', !!togetherApiKey);
    if (!togetherApiKey) {
      console.error('=== STORY-WRITER DEBUG: Missing Together API key ===');
      throw new Error('Together API key not configured');
    }

    // Get the beats to process in this batch
    const beatsToProcess = beatSlots.slice(startIndex, startIndex + batchSize);
    
    if (beatsToProcess.length === 0) {
      return new Response(JSON.stringify({
        success: true,
        beats: [],
        hasMore: false
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Create context about the story and character arcs
    const storyContext = `
STORY CONTEXT:
Title: ${structurePlan.title}
Genre: ${structurePlan.genre}
Theme: ${structurePlan.theme}

CHARACTER ARCS:
${structurePlan.character_arcs?.map(arc => 
  `- ${arc.character}: ${arc.arc_type} arc from "${arc.starting_state}" to "${arc.ending_state}"`
).join('\n') || 'No character arcs specified'}

PREVIOUS BEATS CONTEXT:
${startIndex > 0 ? `This is batch starting at beat ${startIndex + 1}. Previous beats have been written and establish the story foundation.` : 'This is the opening batch of beats.'}
`;

    const beatRequests = beatsToProcess.map(slot => `
BEAT ${slot.slot_id}: ${slot.slot_type.toUpperCase()}
Function: ${slot.function}
Guidance: ${slot.guidance}
Required: Write a compelling story beat that fulfills this function and follows the guidance.
`).join('\n');

    const userPrompt = `${storyContext}

BEAT ASSIGNMENTS:
${beatRequests}

Write specific, compelling story beats for each of the assigned slots. Each beat should:
- Fulfill its designated function in the story structure
- Feel natural and character-driven
- Include specific details and concrete actions
- Maintain consistency with the established story world
- Build toward the next story moments

Return your response as a JSON array of beat objects:
[
  {
    "id": slot_id,
    "title": "Beat Title",
    "type": "slot_type",
    "summary": "The complete beat content (50-150 words)"
  }
]`;

    console.log('=== STORY-WRITER DEBUG: Making Together.AI API call ===');
    console.log('Prompt length:', userPrompt.length);
    console.log('Beats to process:', beatsToProcess.length);
    
    const apiBody = {
      model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: WRITER_PROMPT },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.8,
      max_tokens: 3000,
    };
    
    console.log('API request body prepared');
    
    let response;
    try {
      response = await fetch('https://api.together.xyz/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${togetherApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(apiBody),
      });
      
      console.log('=== STORY-WRITER DEBUG: API Response received ===');
      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response headers:', Object.fromEntries(response.headers.entries()));
      
    } catch (fetchError) {
      console.error('=== STORY-WRITER DEBUG: Fetch error ===');
      console.error('Fetch error:', fetchError);
      throw new Error(`Network error calling Together.AI: ${fetchError.message}`);
    }

    if (!response.ok) {
      console.error('=== STORY-WRITER DEBUG: API Error Response ===');
      let errorText;
      try {
        errorText = await response.text();
        console.error('Error response body:', errorText);
      } catch (textError) {
        console.error('Could not read error response body:', textError);
        errorText = 'Could not read error response';
      }
      throw new Error(`Together.AI API error: ${response.status} ${response.statusText} - ${errorText}`);
    }

    const data = await response.json();
    const beatsContent = data.choices[0].message.content;

    console.log('Generated beats:', beatsContent);

    // Try to parse the JSON response
    let beats;
    try {
      beats = JSON.parse(beatsContent);
      if (!Array.isArray(beats)) {
        throw new Error('Response is not an array');
      }
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // Fallback: create beats from the raw content
      beats = beatsToProcess.map((slot, index) => ({
        id: slot.slot_id,
        title: `${slot.slot_type.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}`,
        type: slot.slot_type,
        summary: `Beat content parsing failed. Raw response: ${beatsContent.substring(index * 100, (index + 1) * 100)}...`
      }));
    }

    const hasMore = startIndex + batchSize < beatSlots.length;

    return new Response(JSON.stringify({
      success: true,
      beats,
      hasMore,
      nextIndex: hasMore ? startIndex + batchSize : null
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in story-writer function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});