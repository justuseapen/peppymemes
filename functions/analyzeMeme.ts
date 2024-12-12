import { APIGatewayEvent } from 'aws-lambda';
import OpenAI from 'openai';
import { analyzeImage } from '../src/utils/imageUtils';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const handler = async (event: APIGatewayEvent) => {
  try {
    if (!event.body) {
      throw new Error('Missing request body');
    }

    const { imageUrl } = JSON.parse(event.body);

    if (!imageUrl) {
      throw new Error('Missing imageUrl in request body');
    }

    // Update to use the current vision model
    const response = await openai.chat.completions.create({
      model: "gpt-4-vision", // Updated from gpt-4-vision-preview
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: "What's in this image?" },
            { type: "image_url", image_url: imageUrl }
          ],
        },
      ],
      max_tokens: 300,
    });

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        text: response.choices[0]?.message?.content || 'No analysis available'
      })
    };
  } catch (error) {
    console.error('AnalyzeMeme function error:', error);

    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
      })
    };
  }
};
