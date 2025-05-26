import React from 'react';
import type { LanguageOption } from '../types';

interface LanguageSelectorProps {
  selectedLanguage: string;
  onLanguageChange: (language: string) => void;
  languages: LanguageOption[];
  disabled?: boolean;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({ selectedLanguage, onLanguageChange, languages, disabled }) => {
  return (
    <div>
      <label htmlFor="languageSelector" className="block text-sm font-medium text-slate-400 mb-1">
        Programming Language
      </label>
      <select
        id="languageSelector"
        value={selectedLanguage}
        onChange={(e) => onLanguageChange(e.target.value)}
        disabled={disabled}
        className="w-full p-3 border border-slate-600 rounded-md shadow-sm focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition duration-150 ease-in-out bg-slate-700 text-slate-100 disabled:bg-slate-800 disabled:text-slate-500 disabled:cursor-not-allowed"
        aria-label="Select programming language"
      >
        {languages.map((lang) => (
          <option key={lang.value} value={lang.value} className="bg-slate-700 text-slate-100">
            {lang.label}
          </option>
        ))}
      </select>
    </div>
  );
};