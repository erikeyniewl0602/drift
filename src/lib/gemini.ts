import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export type RefinementMode = "Softer" | "Clearer" | "Honest" | "Boundary";

export async function refineMessage(original: string, mode: RefinementMode): Promise<string> {
  if (!process.env.GEMINI_API_KEY) {
    return `[AI Demo Mode] ${original} (Refined as ${mode})`;
  }

  const prompts: Record<RefinementMode, string> = {
    Softer: "Rephrase this message to be more gentle and compassionate, without losing the core meaning.",
    Clearer: "Rephrase this message to be more direct and easy to understand, reducing ambiguity.",
    Honest: "Rephrase this message to be more vulnerable and authentic about the underlying feelings.",
    Boundary: "Rephrase this message to clearly communicate a boundary or need, while remaining respectful."
  };

  const prompt = `${prompts[mode]}:\n\n"${original}"\n\nRespond ONLY with the rephrased text. No conversational filler.`;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
    });
    return response.text || original;
  } catch (error) {
    console.error("Gemini Error:", error);
    return original; // Fallback
  }
}
