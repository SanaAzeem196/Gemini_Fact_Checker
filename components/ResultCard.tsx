
import React from 'react';
import { FactCheckResult, Verdict } from '../types';
import { CheckCircleIcon, XCircleIcon, QuestionMarkCircleIcon } from './icons';

interface ResultCardProps {
  result: FactCheckResult;
}

const verdictConfig = {
  [Verdict.LikelyTrue]: {
    Icon: CheckCircleIcon,
    bgColor: 'bg-green-900/50',
    textColor: 'text-green-300',
    borderColor: 'border-green-500/50',
    title: 'Likely True',
  },
  [Verdict.LikelyFalse]: {
    Icon: XCircleIcon,
    bgColor: 'bg-red-900/50',
    textColor: 'text-red-300',
    borderColor: 'border-red-500/50',
    title: 'Likely False',
  },
  [Verdict.Inconclusive]: {
    Icon: QuestionMarkCircleIcon,
    bgColor: 'bg-yellow-900/50',
    textColor: 'text-yellow-300',
    borderColor: 'border-yellow-500/50',
    title: 'Inconclusive',
  },
};

export const ResultCard: React.FC<ResultCardProps> = ({ result }) => {
  const config = verdictConfig[result.verdict];

  return (
    <div className={`w-full max-w-3xl border ${config.borderColor} ${config.bgColor} rounded-xl p-6 space-y-6 animate-fade-in`}>
      <div className="flex items-center space-x-3">
        <config.Icon className={`w-10 h-10 ${config.textColor}`} />
        <h2 className={`text-2xl font-bold ${config.textColor}`}>{config.title}</h2>
      </div>
      
      <div>
        <h3 className="font-semibold text-lg text-gray-200 mb-2">Explanation</h3>
        <p className="text-gray-300 whitespace-pre-wrap">{result.explanation}</p>
      </div>

      {result.sources.length > 0 && (
        <div>
          <h3 className="font-semibold text-lg text-gray-200 mb-3">Sources</h3>
          <ul className="space-y-2">
            {result.sources.map((source, index) => (
              <li key={index} className="flex items-start">
                <span className="text-blue-400 mr-2 mt-1">➔</span>
                <a 
                  href={source.uri} 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="text-blue-400 hover:text-blue-300 hover:underline break-all transition-colors"
                >
                  {source.title}
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};
