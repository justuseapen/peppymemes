import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
  dangerouslyAllowBrowser: true // Note: In production, you should proxy through your backend
});

export interface MemeAnalysis {
  suggestedTitle: string;
  suggestedTags: string[];
}

export async function analyzeMemeImage(imageUrl: string): Promise<MemeAnalysis> {
  try {
    console.log('Starting OpenAI analysis for:', imageUrl);

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: "Analyze this meme and provide a JSON object with keys 'suggestedTitle' (string, max 50 chars) and 'suggestedTags' (array of strings, 3-5 tags). Return only the JSON object, no markdown."
            },
            {
              type: "image_url",
              image_url: {
                url: imageUrl,
                detail: "low"
              }
            }
          ]
        }
      ],
      max_tokens: 150
    });

    console.log('OpenAI response:', response.choices[0].message.content);

    // Clean the response of any markdown formatting
    const content = response.choices[0].message.content || '';
    const jsonStr = content
      .replace(/```json\n?/, '') // Remove opening ```json
      .replace(/```\n?$/, '')    // Remove closing ```
      .trim();                   // Remove any extra whitespace

    console.log('Cleaned JSON string:', jsonStr);

    const result = JSON.parse(jsonStr);
    console.log('Parsed analysis result:', result);

    return {
      suggestedTitle: result.suggestedTitle,
      suggestedTags: result.suggestedTags
    };
  } catch (error) {
    console.error('Error analyzing meme:', error);
    throw error;
  }
}
