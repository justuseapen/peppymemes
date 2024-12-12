import { Handler } from '@netlify/functions';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface MemeAnalysis {
  suggestedTitle: string;
  suggestedTags: string[];
}

export const handler: Handler = async (event) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { imageUrl } = JSON.parse(event.body || '{}');

    if (!imageUrl) {
      return {
        statusCode: 400,
        body: JSON.stringify({ error: 'Image URL is required' })
      };
    }

    const response = await openai.chat.completions.create({
      model: "gpt-4-vision-preview",
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

    const content = response.choices[0].message.content || '';
    const jsonStr = content
      .replace(/```json\n?/, '')
      .replace(/```\n?$/, '')
      .trim();

    const result: MemeAnalysis = JSON.parse(jsonStr);

    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    console.error('Error analyzing meme:', error);
    return {
      statusCode: 500,
      body: JSON.stringify({ error: 'Failed to analyze meme' })
    };
  }
};
