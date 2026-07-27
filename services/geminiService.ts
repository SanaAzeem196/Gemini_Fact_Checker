
import { GoogleGenAI } from "@google/genai";
import { FactCheckResult, Verdict, Source } from '../types';

const getApiKey = (): string | undefined => {
  const viteKey = (import.meta as { env?: Record<string, string | undefined> }).env?.VITE_GEMINI_API_KEY;
  if (viteKey) {
    return viteKey;
  }

  return typeof process !== 'undefined' ? process.env.GEMINI_API_KEY : undefined;
};

const MODEL_CANDIDATES = ["gemini-2.5-flash", "gemini-2.0-flash"];

const systemInstruction = `You are a meticulous fact-checker. Analyze the user's claim based on Google Search results. Your primary goal is to determine the veracity of the claim.
Start your response with one of three verdicts, and nothing else on the first line: LIKELY TRUE, LIKELY FALSE, or INCONCLUSIVE.
Then, on a new line, provide a detailed but concise explanation for your verdict, summarizing the findings from the search results.`;

const getErrorMessage = (error: unknown): string => {
  if (error instanceof Error) {
    return error.message;
  }

  if (typeof error === 'string') {
    return error;
  }

  return 'Unknown error';
};

export const checkFalseInfo = async (claim: string): Promise<FactCheckResult> => {
  const apiKey = getApiKey();

  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured. Set it in your environment before running the app.");
  }

  const ai = new GoogleGenAI({ apiKey });
  let lastError: unknown;

  for (const model of MODEL_CANDIDATES) {
    try {
      const response = await ai.models.generateContent({
        model,
        contents: [{ role: 'user', parts: [{ text: claim }] }],
        config: {
          systemInstruction,
          tools: [{ googleSearch: {} }],
        },
      });

      const text = response.text ?? "";
      const lines = text.split('\n');
      const verdictStr = lines[0].trim().toUpperCase();
      const explanation = lines.slice(1).join('\n').trim();

      let verdict: Verdict;
      if (verdictStr === Verdict.LikelyTrue) {
        verdict = Verdict.LikelyTrue;
      } else if (verdictStr === Verdict.LikelyFalse) {
        verdict = Verdict.LikelyFalse;
      } else {
        verdict = Verdict.Inconclusive;
      }

      const groundingChunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
      const sources: Source[] = groundingChunks
        .filter(chunk => chunk.web && chunk.web.uri && chunk.web.title)
        .map(chunk => ({
          uri: chunk.web.uri,
          title: chunk.web.title,
        }));

      const uniqueSources = Array.from(new Map(sources.map(source => [source.uri, source])).values());

      return {
        verdict,
        explanation,
        sources: uniqueSources,
      };
    } catch (error) {
      lastError = error;
      const message = getErrorMessage(error);

      if (!message.includes('429') && !message.includes('RESOURCE_EXHAUSTED') && !message.includes('not found') && !message.includes('unsupported')) {
        throw new Error(`Gemini request failed: ${message}`);
      }
    }
  }

  throw new Error(`Gemini request failed after trying available models. Last error: ${getErrorMessage(lastError)}`);
};
