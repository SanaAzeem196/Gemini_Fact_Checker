
import React, { useState, useCallback } from 'react';
import { FactCheckResult } from './types';
import { checkFalseInfo } from './services/geminiService';
import { ResultCard } from './components/ResultCard';
import { SpinnerIcon } from './components/icons';

const App: React.FC = () => {
  const [claim, setClaim] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<FactCheckResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = useCallback(async (event: React.FormEvent) => {
    event.preventDefault();
    if (!claim.trim()) return;

    setIsLoading(true);
    setResult(null);
    setError(null);

    try {
      const response = await checkFalseInfo(claim);
      setResult(response);
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
    } finally {
      setIsLoading(false);
    }
  }, [claim]);

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 flex flex-col items-center p-4 sm:p-6 lg:p-8">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in { animation: fade-in 0.5s ease-out forwards; }
      `}</style>
      <main className="w-full max-w-3xl flex flex-col items-center space-y-8 flex-grow">
        <header className="text-center pt-8">
          <h1 className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-blue-400 to-teal-300 text-transparent bg-clip-text">
            Gemini Fact-Checker
          </h1>
          <p className="mt-3 text-lg text-gray-400 max-w-2xl">
            Enter a claim to verify its accuracy. Our AI will analyze it using Google Search and provide a verdict with sources.
          </p>
        </header>

        <form onSubmit={handleSubmit} className="w-full bg-gray-800/50 p-6 rounded-xl shadow-lg border border-gray-700">
          <label htmlFor="claim-textarea" className="block text-lg font-medium text-gray-300 mb-2">
            Enter the information to check
          </label>
          <textarea
            id="claim-textarea"
            value={claim}
            onChange={(e) => setClaim(e.target.value)}
            placeholder="e.g., 'The moon is made of green cheese.'"
            className="w-full h-36 p-4 bg-gray-900 border border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none text-gray-200 placeholder-gray-500"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !claim.trim()}
            className="w-full mt-4 flex justify-center items-center py-3 px-6 border border-transparent rounded-md shadow-sm text-lg font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed transition-colors"
          >
            {isLoading ? (
              <>
                <SpinnerIcon className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" />
                Analyzing...
              </>
            ) : (
              'Check Claim'
            )}
          </button>
        </form>

        <div className="w-full flex justify-center py-6">
          {error && (
            <div className="bg-red-900/50 border border-red-500/50 text-red-300 p-4 rounded-lg w-full max-w-3xl text-center animate-fade-in">
              <strong>Error:</strong> {error}
            </div>
          )}
          {result && <ResultCard result={result} />}
        </div>
      </main>

      <footer className="text-center py-6 text-gray-500 text-sm">
        <p>Powered by Gemini. Results should be verified independently.</p>
      </footer>
    </div>
  );
};

export default App;
