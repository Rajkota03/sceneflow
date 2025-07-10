import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const togetherApiKey = Deno.env.get('TOGETHER_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const SYSTEM_PROMPT = `You are a master story architect specializing in creating compelling narrative structures. Your role is to analyze a story concept and create a detailed structural plan that balances classical storytelling principles with creative innovation.

CORE RESPONSIBILITIES:
- Analyze the provided story concept (logline, genre, characters)
- Create a comprehensive story structure with acts, sequences, and beat slots
- Ensure each structural element serves the story's emotional and thematic goals
- Provide clear guidance for subsequent beat development

STRUCTURAL PRINCIPLES:
- Every story needs proper setup, confrontation, and resolution
- Character arcs must be woven throughout the structure
- Pacing should create natural rhythm and momentum
- Each act should have clear objectives and obstacles
- Themes should emerge organically from character conflicts

OUTPUT FORMAT:
Return a JSON object with this exact structure:
{
  "title": "Story Title",
  "genre": "Primary Genre",
  "theme": "Central Theme",
  "character_arcs": [
    {
      "character": "Character Name",
      "arc_type": "Arc Type (e.g., growth, fall, flat)",
      "starting_state": "Character's initial condition",
      "ending_state": "Character's final condition"
    }
  ],
  "structure": {
    "act_1": {
      "purpose": "Act 1 objective",
      "sequences": [
        {
          "sequence_name": "Opening",
          "purpose": "What this sequence achieves",
          "beat_slots": [
            {
              "slot_id": 1,
              "slot_type": "opening_image",
              "function": "What this beat accomplishes",
              "guidance": "Specific direction for beat content"
            }
          ]
        }
      ]
    },
    "act_2a": {
      "purpose": "First half of Act 2 objective",
      "sequences": [...]
    },
    "act_2b": {
      "purpose": "Second half of Act 2 objective", 
      "sequences": [...]
    },
    "act_3": {
      "purpose": "Act 3 objective",
      "sequences": [...]
    }
  },
  "key_moments": [
    {
      "moment": "Inciting Incident",
      "slot_reference": 3,
      "significance": "Why this moment matters"
    }
  ]
}`;

const PLANNER_PROMPT = `You are about to create a structural plan for a new story. Follow these steps:

1. ANALYZE THE CONCEPT
   - Extract the core conflict from the logline
   - Identify the protagonist's want vs need
   - Determine the story's emotional journey
   - Recognize genre expectations and opportunities for subversion

2. DESIGN THE STRUCTURE
   - Create 35-45 beat slots across four acts
   - Ensure each act has a clear purpose and escalation
   - Balance character moments with plot advancement
   - Plan for proper setup and payoff relationships

3. CHARACTER ARC INTEGRATION
   - Map character growth to structural beats
   - Ensure supporting characters serve the protagonist's journey
   - Create meaningful conflicts that test character values
   - Plan revelations that deepen character understanding

4. PACING AND RHYTHM
   - Alternate between action and reflection
   - Build to clear climactic moments
   - Provide breathing room after intense sequences
   - Create momentum that pulls readers forward

5. THEMATIC WEAVING
   - Embed theme through character choices
   - Use symbolic moments and imagery
   - Create debates between opposing viewpoints
   - Let theme emerge through story events

QUALITY STANDARDS:
- Each beat slot must have a clear purpose
- The structure should feel both familiar and surprising
- Character arcs should be specific and measurable
- The plan should inspire creative beat writing
- All elements should serve the story's core message

Remember: You're creating the blueprint. Be specific enough to guide beat creation while leaving room for creative discovery during writing.`;

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { logline, genre, characters, additionalContext } = await req.json();

    console.log('Planning story structure for:', { logline, genre, characters });

    const userPrompt = `Create a detailed story structure plan for:

LOGLINE: ${logline}
GENRE: ${genre}
CHARACTERS: ${characters || 'Not specified'}
ADDITIONAL CONTEXT: ${additionalContext || 'None'}

Analyze this concept and create a comprehensive structural plan that will guide the creation of compelling story beats. Focus on creating a structure that serves both the story's emotional journey and its commercial/entertainment value.`;

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${togetherApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          { role: 'user', content: PLANNER_PROMPT },
          { role: 'user', content: userPrompt }
        ],
        temperature: 0.7,
        max_tokens: 4000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Together.AI API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const planContent = data.choices[0].message.content;

    console.log('Generated story plan:', planContent);

    // Try to parse the JSON response
    let structurePlan;
    try {
      structurePlan = JSON.parse(planContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      // If JSON parsing fails, return the raw content with error indication
      structurePlan = {
        error: 'Failed to parse structured response',
        raw_content: planContent
      };
    }

    return new Response(JSON.stringify({
      success: true,
      plan: structurePlan
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in story-planner function:', error);
    return new Response(JSON.stringify({ 
      success: false,
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});