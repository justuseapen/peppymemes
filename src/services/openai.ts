export interface MemeAnalysis {
  suggestedTitle: string;
  suggestedTags: string[];
}

export async function analyzeMemeImage(imageUrl: string): Promise<MemeAnalysis> {
  try {
    console.log('Starting meme analysis for:', imageUrl);

    const response = await fetch('/.netlify/functions/analyzeMeme', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ imageUrl })
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.error || 'Failed to analyze meme');
    }

    const result = await response.json();
    console.log('Analysis result:', result);

    return {
      suggestedTitle: result.suggestedTitle,
      suggestedTags: result.suggestedTags
    };
  } catch (error) {
    console.error('Error analyzing meme:', error);
    throw error;
  }
}
