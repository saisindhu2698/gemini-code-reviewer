import React from 'react';
import type { ReviewFeedback } from '../types';

interface ReviewOutputProps {
  feedback: ReviewFeedback;
}

// Helper to process text for simple Markdown-like features
const processReviewText = (text: string): React.ReactNode[] => {
  const codeBlockRegex = /```(\w*)\s*\n?([\s\S]*?)\n?```/g;
  const partsWithCodeBlocks = text.split(codeBlockRegex);
  const processedSegments: React.ReactNode[] = [];

  for (let i = 0; i < partsWithCodeBlocks.length; i++) {
    if (i % 3 === 2) { // Code content
      const language = partsWithCodeBlocks[i-1] || 'plaintext';
      processedSegments.push(
        <pre key={`code-${i}`} className="bg-slate-800 text-slate-200 p-3 my-2 rounded-md overflow-x-auto text-sm font-mono NCM_TYPO_RULES_OFF">
          <code className={`language-${language}`}>{partsWithCodeBlocks[i].trim()}</code>
        </pre>
      );
    } else if (i % 3 === 0) { // Regular text
      const regularText = partsWithCodeBlocks[i];
      const segmentRegex = /(\*\*(.*?)\*\*|__(.*?)__|\*(.*?)\*|_(.*?)_|\`(.*?)\`|\[(.*?)\]\((https?:\/\/[^\s]+)\))/g;
      const subParts = regularText.split(segmentRegex);

      subParts.forEach((subPart, subIndex) => {
        if (!subPart) return;

        if (subPart.startsWith('**') && subPart.endsWith('**')) {
          processedSegments.push(<strong key={`${i}-bold-${subIndex}`}>{subPart.slice(2, -2)}</strong>);
        } else if (subPart.startsWith('__') && subPart.endsWith('__')) {
          processedSegments.push(<strong key={`${i}-bold-under-${subIndex}`}>{subPart.slice(2, -2)}</strong>);
        } else if (subPart.startsWith('*') && subPart.endsWith('*')) {
          processedSegments.push(<em key={`${i}-italic-${subIndex}`}>{subPart.slice(1, -1)}</em>);
        } else if (subPart.startsWith('_') && subPart.endsWith('_')) {
          processedSegments.push(<em key={`${i}-italic-under-${subIndex}`}>{subPart.slice(1, -1)}</em>);
        } else if (subPart.startsWith('\`') && subPart.endsWith('\`')) {
          processedSegments.push(<code key={`${i}-inlinecode-${subIndex}`} className="bg-slate-600 text-sky-300 px-1 py-0.5 rounded-sm text-xs font-mono">{subPart.slice(1, -1)}</code>);
        } else if (subPart.startsWith('[') && subPart.includes('](') && subPart.endsWith(')')) {
            const linkMatch = subPart.match(/\[(.*?)\]\((https?:\/\/[^\s]+)\)/);
            if (linkMatch && linkMatch[1] && linkMatch[2]) {
                 processedSegments.push(
                    <a
                        key={`${i}-link-${subIndex}`}
                        href={linkMatch[2]}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sky-400 hover:text-sky-300 underline"
                    >
                        {linkMatch[1]}
                    </a>
                );
            } else {
                 processedSegments.push(subPart); 
            }
        } else {
          processedSegments.push(subPart.replace(/&nbsp;/g, '\u00A0'));
        }
      });
    }
  }
  return processedSegments;
};


export const ReviewOutput: React.FC<ReviewOutputProps> = ({ feedback }) => {
  return (
    <div>
      <h2 className="text-xl font-semibold text-slate-100 mb-3">Review Feedback</h2>
      <div className="bg-slate-700 p-4 sm:p-6 rounded-md border border-slate-600 min-h-[200px] max-h-[60vh] overflow-y-auto">
        <div className="whitespace-pre-line break-words font-sans text-sm text-slate-300 leading-relaxed selection:bg-sky-600 selection:text-white">
          {processReviewText(feedback)}
        </div>
      </div>
    </div>
  );
};