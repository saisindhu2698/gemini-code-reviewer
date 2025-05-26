import { GoogleGenAI, GenerateContentResponse } from "@google/genai";
import { GEMINI_API_MODEL } from '../constants';
import type { ReviewFeedback } from '../types';

const API_KEY = process.env.API_KEY;

// This check runs once when the module is loaded.
if (!API_KEY) {
  console.error("CRITICAL: API_KEY environment variable is not set. The application will not be able to contact the Gemini API.");
}

const getAiClient = (() => {
  let ai: GoogleGenAI | null = null;
  return () => {
    if (!API_KEY) { // This check is redundant if the top-level check makes the app unusable, but good for safety.
      throw new Error("Gemini API Key is not configured. Please ensure the API_KEY environment variable is set.");
    }
    if (!ai) {
      ai = new GoogleGenAI({ apiKey: API_KEY });
    }
    return ai;
  };
})();


export const reviewCodeWithGemini = async (code: string, language: string): Promise<ReviewFeedback> => {
  const ai = getAiClient(); // This will throw if API_KEY was not available at module load or if getAiClient has internal error.
  
  const prompt = `
You are an expert code reviewer. Your task is to analyze the provided code snippet and offer constructive, actionable feedback.

**Instructions for Review:**
1.  **Identify Language:** The code is written in ${language}.
2.  **Review Focus:**
    *   **Potential Bugs & Errors**: Look for logical flaws, off-by-one errors, null pointer issues, race conditions, unhandled exceptions, etc.
    *   **Code Style & Best Practices**: Assess adherence to ${language}-specific conventions (e.g., naming, formatting), DRY principles, SOLID principles (if applicable), and overall code organization.
    *   **Readability & Maintainability**: Evaluate clarity, use of comments (where necessary), function/variable naming, and modularity. Is the code easy to understand and modify?
    *   **Performance**: Identify any obvious performance bottlenecks (e.g., inefficient loops, unnecessary computations). Suggest optimizations if significant.
    *   **Security**: Check for common vulnerabilities relevant to ${language} and the code's context (e.g., XSS, injection flaws, insecure data handling, improper error handling revealing sensitive info).
    *   **Simplification/Refactoring**: Suggest ways to simplify complex logic or refactor for better structure.
3.  **Output Format:**
    *   Structure your feedback using Markdown.
    *   Use headings (e.g., \`## Potential Bugs\`, \`## Code Style\`) for each major section.
    *   Use bullet points for specific observations within sections.
    *   Provide code examples (\`\`\`${language}\\n // your example code \\n\`\`\`) to illustrate your points where helpful.
    *   Be polite and constructive. Start with a brief overall impression if appropriate.

**Code to Review:**
\`\`\`${language}
${code}
\`\`\`

Please provide your comprehensive review below:
`;

  try {
    const response: GenerateContentResponse = await ai.models.generateContent({
      model: GEMINI_API_MODEL,
      contents: prompt,
      config: {
        temperature: 0.4, // Slightly lower for more focused, less "creative" review
        topK: 40,
        topP: 0.95,
        // thinkingConfig is not used for this model/task, default behavior is preferred for quality.
      }
    });
    
    const textFeedback = response.text;

    if (!textFeedback || textFeedback.trim() === "") {
      return "Gemini returned an empty review. This could be due to very short/simple code, or an issue generating the review. Please try again or with different code.";
    }
    return textFeedback;

  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Attempt to provide more user-friendly error messages
    if (error instanceof Error) {
      if (error.message.toLowerCase().includes('api key') || error.message.toLowerCase().includes('permission')) {
        throw new Error('Failed to authenticate with Gemini API. Please check if the API_KEY is correctly configured and has the required permissions.');
      } else if (error.message.toLowerCase().includes('quota')) {
        throw new Error('Gemini API quota exceeded. Please check your quota or try again later.');
      } else if (error.message.toLowerCase().includes('network') || error.message.toLowerCase().includes('fetch')) {
         throw new Error('A network error occurred while trying to reach the Gemini API. Please check your internet connection.');
      }
      throw new Error(`Failed to get review from Gemini: ${error.message}`);
    }
    throw new Error('An unknown error occurred while communicating with the Gemini API.');
  }
};
