import { useState } from 'react';
import { analyzeMemeImage, MemeAnalysis } from '../services/openai';

export function useImageAnalysis() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<MemeAnalysis | null>(null);
  const [error, setError] = useState<string | null>(null);

  const analyzeImage = async (imageUrl: string) => {
    setIsAnalyzing(true);
    setError(null);

    try {
      const result = await analyzeMemeImage(imageUrl);
      setAnalysis(result);
    } catch (err) {
      setError('Failed to analyze image. Please try again.');
    } finally {
      setIsAnalyzing(false);
    }
  };

  return {
    isAnalyzing,
    analysis,
    error,
    analyzeImage
  };
}
