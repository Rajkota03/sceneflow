import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { genre, theme, actStructure, customPrompt } = await req.json();

    if (!genre || !theme || !actStructure) {
      return new Response(
        JSON.stringify({ error: 'Missing required parameters: genre, theme, and actStructure are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Build the prompt for beat generation
    const prompt = customPrompt || `Generate story beats for a ${genre} screenplay with the theme: "${theme}".

Structure: ${actStructure.name}
Acts: ${actStructure.acts.map(act => `${act.title} (${act.startPosition}%-${act.endPosition}%)`).join(', ')}

For each act, generate 3-5 specific story beats that:
1. Advance the plot meaningfully
2. Develop character arcs
3. Support the central theme: "${theme}"
4. Fit the ${genre} genre conventions
5. Include estimated page ranges based on act percentages

Format the response as a JSON object with this structure:
{
  "acts": [
    {
      "actId": "act_1",
      "title": "Act 1 Title",
      "beats": [
        {
          "title": "Beat Title",
          "description": "Detailed description of what happens in this beat",
          "pageRange": "1-25",
          "timePosition": 15
        }
      ]
    }
  ]
}

Be creative and specific with beat descriptions. Each beat should be 2-3 sentences describing the key story moments.`;

    console.log('Sending request to Together.ai with prompt:', prompt);

    const response = await fetch('https://api.together.xyz/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('TOGETHER_API_KEY')}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'meta-llama/Llama-3-8b-chat-hf',
        messages: [
          {
            role: 'system',
            content: 'You are a professional screenplay consultant specializing in story structure and beat generation. Always respond with valid JSON format.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        max_tokens: 2000,
        temperature: 0.7,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Together.ai API error:', errorText);
      throw new Error(`Together.ai API error: ${response.status} - ${errorText}`);
    }

    const result = await response.json();
    console.log('Together.ai response:', result);

    const generatedContent = result.choices[0].message.content;
    
    // Try to parse the JSON response
    let parsedBeats;
    try {
      // Extract JSON from the response if it's wrapped in markdown
      const jsonMatch = generatedContent.match(/```json\n([\s\S]*?)\n```/) || 
                       generatedContent.match(/```\n([\s\S]*?)\n```/) ||
                       [null, generatedContent];
      
      parsedBeats = JSON.parse(jsonMatch[1] || generatedContent);
    } catch (parseError) {
      console.error('Failed to parse JSON response:', parseError);
      console.error('Raw response:', generatedContent);
      
      // Fallback: return raw text if JSON parsing fails
      return new Response(
        JSON.stringify({ 
          error: 'Failed to parse generated beats', 
          rawResponse: generatedContent,
          details: parseError.message 
        }),
        { status: 422, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        beats: parsedBeats,
        rawResponse: generatedContent 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-beats function:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Internal server error', 
        details: error.message 
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});