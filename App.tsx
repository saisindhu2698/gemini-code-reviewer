import React, { useState, useCallback, useRef } from 'react';
import { CodeInput } from './components/CodeInput';
import { LanguageSelector } from './components/LanguageSelector';
import { ReviewOutput } from './components/ReviewOutput';
import { LoadingSpinner } from './components/LoadingSpinner';
import { ErrorMessage } from './components/ErrorMessage';
import { reviewCodeWithGemini } from './services/geminiService';
import { SUPPORTED_LANGUAGES, EXTENSION_TO_LANGUAGE_MAP } from './constants';
import type { ReviewFeedback } from './types';

const App: React.FC = () => {
  const [code, setCode] = useState<string>('');
  const [language, setLanguage] = useState<string>('javascript');
  const [feedback, setFeedback] = useState<ReviewFeedback | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleReviewRequest = useCallback(async () => {
    if (!code.trim()) {
      setError('Please enter some code or upload a file to review.');
      setFeedback(null);
      return;
    }
    
    setIsLoading(true);
    setError(null);
    setFeedback(null);

    try {
      const review = await reviewCodeWithGemini(code, language);
      setFeedback(review);
    } catch (err) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('An unknown error occurred during the review.');
      }
      console.error('Review Error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [code, language]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedFileName(file.name);
      setError(null); // Clear previous errors

      // Attempt to set language from file extension
      const extension = file.name.split('.').pop()?.toLowerCase();
      if (extension && EXTENSION_TO_LANGUAGE_MAP[extension]) {
        const detectedLang = EXTENSION_TO_LANGUAGE_MAP[extension];
        // Ensure detected language is in SUPPORTED_LANGUAGES
        if (SUPPORTED_LANGUAGES.some(lang => lang.value === detectedLang)) {
             setLanguage(detectedLang);
        }
      } else if (extension) {
        // Optional: notify user if extension is unknown but keep current language
        // setError(`Unknown file extension ".${extension}". Please select the language manually.`);
      }


      const reader = new FileReader();
      reader.onload = (e) => {
        const fileContent = e.target?.result as string;
        setCode(fileContent);
      };
      reader.onerror = () => {
        setError('Failed to read the file. Please ensure it is a valid text file.');
        setSelectedFileName(null);
        setCode('');
      };
      reader.readAsText(file);
    }
    // Reset file input value to allow uploading the same file again if needed
    if(event.target) {
      event.target.value = '';
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const clearFileSelection = () => {
    setSelectedFileName(null);
    setCode('');
    if (fileInputRef.current) {
      fileInputRef.current.value = ''; // Clear the actual file input
    }
    // Optionally reset language or leave as is
    // setLanguage('javascript'); 
  };

  const currentLanguageLabel = SUPPORTED_LANGUAGES.find(l => l.value === language)?.label || language;

  return (
    <div className="min-h-screen bg-slate-900 py-8 px-4 flex flex-col items-center selection:bg-sky-500 selection:text-white">
      <header className="mb-8 text-center">
        <div className="flex items-center justify-center mb-2">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-10 h-10 text-sky-400 mr-3">
            <path fillRule="evenodd" d="M9 4.5a.75.75 0 01.721.544l.813 2.846a3.75 3.75 0 002.576 2.576l2.846.813a.75.75 0 010 1.442l-2.846.813a3.75 3.75 0 00-2.576 2.576l-.813 2.846a.75.75 0 01-1.442 0l-.813-2.846a3.75 3.75 0 00-2.576-2.576l-2.846-.813a.75.75 0 010-1.442l2.846-.813A3.75 3.75 0 007.466 5.044l.813-2.846A.75.75 0 019 4.5zM18 9.75a.75.75 0 01.721.544l.63 2.199a2.25 2.25 0 001.544 1.544l2.199.63a.75.75 0 010 1.442l-2.199.63a2.25 2.25 0 00-1.544 1.544l-.63 2.199a.75.75 0 01-1.442 0l-.63-2.199a2.25 2.25 0 00-1.544-1.544l-2.199-.63a.75.75 0 010-1.442l2.199-.63a2.25 2.25 0 001.544-1.544l.63-2.199A.75.75 0 0118 9.75zM10.5 15.75a.75.75 0 01.721.544l.406 1.42a.75.75 0 00.512.512l1.42.406a.75.75 0 010 1.442l-1.42.406a.75.75 0 00-.512.512l-.406 1.42a.75.75 0 01-1.442 0l-.406-1.42a.75.75 0 00-.512.512l-1.42-.406a.75.75 0 010-1.442l1.42-.406a.75.75 0 00.512.512l.406-1.42a.75.75 0 01.721-.544z" clipRule="evenodd" />
          </svg>
          <h1 className="text-4xl sm:text-5xl font-bold text-sky-400">
            Gemini Code Reviewer
          </h1>
        </div>
        <p className="text-slate-400 text-md sm:text-lg">
          Get instant, AI-powered feedback on your code.
        </p>
      </header>

      <main className="w-full max-w-2xl bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl">
        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-400 mb-1">
              Upload Code File (Optional)
            </label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              className="hidden"
              accept=".*" // Accept all files, filtering by text content later
              disabled={isLoading}
            />
            <button
              onClick={triggerFileInput}
              disabled={isLoading}
              className="w-full px-4 py-2.5 bg-slate-700 border border-slate-600 text-slate-300 font-medium rounded-md shadow-sm hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l-3.75 3.75M12 9.75l3.75 3.75M3 17.25V6.75A2.25 2.25 0 015.25 4.5h13.5A2.25 2.25 0 0121 6.75v10.5A2.25 2.25 0 0118.75 19.5H5.25A2.25 2.25 0 013 17.25z" />
              </svg>
              <span>{selectedFileName ? 'Upload Different File' : 'Upload File'}</span>
            </button>
            {selectedFileName && (
              <div className="mt-2 text-sm text-slate-400 flex items-center justify-between bg-slate-700/50 p-2 rounded-md">
                <span className="truncate">Selected: <span className="font-medium text-slate-300">{selectedFileName}</span></span>
                <button
                  onClick={clearFileSelection}
                  disabled={isLoading}
                  className="ml-2 p-1 text-slate-500 hover:text-slate-300 disabled:opacity-50"
                  aria-label="Clear file selection"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
          </div>

          <LanguageSelector
            selectedLanguage={language}
            onLanguageChange={setLanguage}
            languages={SUPPORTED_LANGUAGES}
            disabled={isLoading}
          />
          <CodeInput
            code={code}
            onCodeChange={setCode}
            placeholder={`Enter your ${currentLanguageLabel} code, or upload a file...`}
            disabled={isLoading}
            language={currentLanguageLabel}
          />
          <button
            onClick={handleReviewRequest}
            disabled={isLoading || !code.trim()}
            className="w-full px-6 py-3 bg-slate-600 text-white font-semibold rounded-md shadow-md hover:bg-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-opacity-75 transition duration-150 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center space-x-2"
            aria-live="polite"
          >
            {isLoading ? (
              <LoadingSpinner small={true} />
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-5 h-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m5.231 13.481L15 17.25m-4.5-15H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
              </svg>
            )}
            <span>{isLoading ? 'Analyzing Code...' : 'Get Code Review'}</span>
          </button>
        </div>
      </main>
      
      {(isLoading || error || feedback) && (
        <section aria-live="assertive" className="w-full max-w-2xl mt-8 bg-slate-800 p-6 sm:p-8 rounded-xl shadow-2xl">
          {isLoading && !error && ( // Only show main loader if no error
            <div className="text-center py-4">
              <LoadingSpinner />
              <p className="mt-3 text-slate-400">Gemini is thinking... please wait.</p>
            </div>
          )}
          {error && <ErrorMessage message={error} />}
          {feedback && !isLoading && <ReviewOutput feedback={feedback} />}
        </section>
      )}

      {!isLoading && !error && !feedback && (
         <section className="w-full max-w-2xl mt-8 bg-slate-800 p-6 sm:p-10 rounded-xl shadow-2xl text-center text-slate-500 border-2 border-dashed border-slate-700">
           <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-12 h-12 mx-auto mb-3 text-slate-600">
             <path strokeLinecap="round" strokeLinejoin="round" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
           </svg>
           <p className="text-slate-400">Review feedback will appear here once you submit your code.</p>
         </section>
      )}

      <footer className="mt-12 text-center text-sm text-slate-500">
        <p>&copy; {new Date().getFullYear()} Gemini Code Reviewer.</p>
        <p className="mt-1">Note: API key must be configured as <code className="bg-slate-700 text-slate-300 px-1 py-0.5 rounded text-xs">process.env.API_KEY</code>.</p>
      </footer>
    </div>
  );
};

export default App;
