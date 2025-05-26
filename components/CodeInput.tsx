import React from 'react';

interface CodeInputProps {
  code: string;
  onCodeChange: (code: string) => void;
  placeholder?: string;
  disabled?: boolean;
  language?: string;
}

export const CodeInput: React.FC<CodeInputProps> = ({ code, onCodeChange, placeholder, disabled, language }) => {
  return (
    <div>
      <label htmlFor="codeInput" className="block text-sm font-medium text-slate-400 mb-1">
        Paste Your {language ? `${language} ` : ''}Code Here
      </label>
      <textarea
        id="codeInput"
        value={code}
        onChange={(e) => onCodeChange(e.target.value)}
        placeholder={placeholder || "Enter your code..."}
        disabled={disabled}
        rows={15}
        className="w-full p-3 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out font-mono text-sm bg-slate-700 text-slate-100 placeholder-slate-500 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed resize-y"
        spellCheck="false"
        aria-label={`Code input for ${language || 'any language'}`}
      />
      <p className="mt-2 text-xs text-slate-500">
        For best results, provide a focused snippet of code.
      </p>
    </div>
  );
};