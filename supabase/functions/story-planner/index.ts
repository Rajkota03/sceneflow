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
      // Sometimes the AI response includes markdown code blocks, so let's clean it
      let cleanContent = planContent.trim();
      
      // Remove markdown code blocks if present
      if (cleanContent.includes('```json')) {
        const jsonStart = cleanContent.indexOf('```json') + 7;
        const jsonEnd = cleanContent.indexOf('```', jsonStart);
        if (jsonEnd > jsonStart) {
          cleanContent = cleanContent.substring(jsonStart, jsonEnd).trim();
        }
      } else if (cleanContent.includes('```')) {
        const start = cleanContent.indexOf('```') + 3;
        const end = cleanContent.indexOf('```', start);
        if (end > start) {
          cleanContent = cleanContent.substring(start, end).trim();
        }
      }
      
      // Try to find JSON object if wrapped in other text
      const jsonStart = cleanContent.indexOf('{');
      const jsonEnd = cleanContent.lastIndexOf('}');
      if (jsonStart >= 0 && jsonEnd > jsonStart) {
        cleanContent = cleanContent.substring(jsonStart, jsonEnd + 1);
      }
      
      console.log('Attempting to parse cleaned content:', cleanContent.substring(0, 200) + '...');
      
      structurePlan = JSON.parse(cleanContent);
      
      // Validate the structure more thoroughly
      if (!structurePlan || typeof structurePlan !== 'object') {
        throw new Error('Parsed content is not a valid object');
      }
      
      if (!structurePlan.structure) {
        console.error('Generated plan missing structure property:', Object.keys(structurePlan));
        
        // Create a fallback structure if possible
        structurePlan = {
          title: structurePlan.title || 'Untitled Story',
          genre: structurePlan.genre || 'Drama',
          theme: structurePlan.theme || 'Personal Growth',
          character_arcs: structurePlan.character_arcs || [],
          structure: {
            act_1: {
              purpose: 'Setup and introduction',
              sequences: [
                {
                  sequence_name: 'Opening',
                  purpose: 'Establish world and characters',
                  beat_slots: [
                    { slot_id: 1, slot_type: 'opening_image', function: 'Hook the audience', guidance: 'Create compelling opening' },
                    { slot_id: 2, slot_type: 'setup', function: 'Establish normal world', guidance: 'Show character in routine' },
                    { slot_id: 3, slot_type: 'inciting_incident', function: 'Disrupt the status quo', guidance: 'Create the central conflict' }
                  ]
                }
              ]
            },
            act_2a: {
              purpose: 'Rising action and complications',
              sequences: [
                {
                  sequence_name: 'First Obstacle',
                  purpose: 'Character faces initial challenges',
                  beat_slots: [
                    { slot_id: 4, slot_type: 'plot_point_1', function: 'Move into main story', guidance: 'Character commits to journey' },
                    { slot_id: 5, slot_type: 'obstacle', function: 'Create conflict', guidance: 'Show character struggling' }
                  ]
                }
              ]
            },
            act_2b: {
              purpose: 'Intensifying conflict',
              sequences: [
                {
                  sequence_name: 'Midpoint',
                  purpose: 'Story shifts direction',
                  beat_slots: [
                    { slot_id: 6, slot_type: 'midpoint', function: 'Raise the stakes', guidance: 'Character learns truth' },
                    { slot_id: 7, slot_type: 'obstacle', function: 'Major setback', guidance: 'Character faces failure' }
                  ]
                }
              ]
            },
            act_3: {
              purpose: 'Resolution and conclusion',
              sequences: [
                {
                  sequence_name: 'Climax',
                  purpose: 'Final confrontation',
                  beat_slots: [
                    { slot_id: 8, slot_type: 'climax', function: 'Final battle', guidance: 'Character faces ultimate test' },
                    { slot_id: 9, slot_type: 'resolution', function: 'Restore balance', guidance: 'Show new normal' }
                  ]
                }
              ]
            }
          },
          key_moments: [
            { moment: 'Inciting Incident', slot_reference: 3, significance: 'Sets story in motion' }
          ]
        };
        
        console.log('Created fallback structure plan');
      }
      
      // Final validation - ensure all required act structures exist
      const requiredActs = ['act_1', 'act_2a', 'act_2b', 'act_3'];
      for (const actKey of requiredActs) {
        if (!structurePlan.structure[actKey] || !structurePlan.structure[actKey].sequences) {
          console.error(`Invalid ${actKey} structure:`, structurePlan.structure[actKey]);
          throw new Error(`Generated plan has invalid ${actKey} structure`);
        }
      }
      
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw content length:', planContent.length);
      console.error('Raw content preview:', planContent.substring(0, 500));
      
      // Create a completely fallback structure
      structurePlan = {
        title: 'Generated Story',
        genre: 'Drama',
        theme: 'Personal Growth',
        character_arcs: [
          {
            character: 'Protagonist',
            arc_type: 'growth',
            starting_state: 'Ordinary person with a problem',
            ending_state: 'Transformed individual who has overcome'
          }
        ],
        structure: {
          act_1: {
            purpose: 'Setup and introduction',
            sequences: [
              {
                sequence_name: 'Opening',
                purpose: 'Establish world and characters',
                beat_slots: [
                  { slot_id: 1, slot_type: 'opening_image', function: 'Hook the audience', guidance: 'Create compelling opening scene' },
                  { slot_id: 2, slot_type: 'setup', function: 'Establish normal world', guidance: 'Show character in their routine' },
                  { slot_id: 3, slot_type: 'inciting_incident', function: 'Disrupt the status quo', guidance: 'Introduce the central conflict' }
                ]
              }
            ]
          },
          act_2a: {
            purpose: 'Rising action and complications',
            sequences: [
              {
                sequence_name: 'First Obstacle',
                purpose: 'Character faces initial challenges',
                beat_slots: [
                  { slot_id: 4, slot_type: 'plot_point_1', function: 'Move into main story', guidance: 'Character commits to the journey' },
                  { slot_id: 5, slot_type: 'first_obstacle', function: 'Create initial conflict', guidance: 'Show character struggling with new reality' }
                ]
              }
            ]
          },
          act_2b: {
            purpose: 'Intensifying conflict and complications',
            sequences: [
              {
                sequence_name: 'Midpoint Crisis',
                purpose: 'Story shifts direction dramatically',
                beat_slots: [
                  { slot_id: 6, slot_type: 'midpoint', function: 'Raise the stakes significantly', guidance: 'Character learns devastating truth' },
                  { slot_id: 7, slot_type: 'major_setback', function: 'Character faces major failure', guidance: 'All seems lost moment' }
                ]
              }
            ]
          },
          act_3: {
            purpose: 'Resolution and conclusion',
            sequences: [
              {
                sequence_name: 'Final Confrontation',
                purpose: 'Ultimate challenge and resolution',
                beat_slots: [
                  { slot_id: 8, slot_type: 'climax', function: 'Final battle or confrontation', guidance: 'Character faces ultimate test' },
                  { slot_id: 9, slot_type: 'resolution', function: 'Restore balance and show change', guidance: 'Demonstrate the new normal' }
                ]
              }
            ]
          }
        },
        key_moments: [
          { moment: 'Inciting Incident', slot_reference: 3, significance: 'Event that sets the entire story in motion' },
          { moment: 'Midpoint', slot_reference: 6, significance: 'Major revelation that changes everything' },
          { moment: 'Climax', slot_reference: 8, significance: 'Final test of character growth' }
        ]
      };
      
      console.log('Created emergency fallback structure due to parsing failure');
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