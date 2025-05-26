export interface LanguageOption {
  value: string;
  label: string;
}

// This type could be expanded if Gemini returns structured JSON,
// but for now, we expect plain text or markdown.
export type ReviewFeedback = string;
