import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, Search, MapPin, Building, ShieldAlert, ArrowRight, Bot } from 'lucide-react';

export const SearchView: React.FC = () => {
  const { incidents, shelters, resources, navigate } = useApp();
  const [query, setQuery] = useState('find nearest shelter with oxygen concentrators in sector 2');
  const [aiAnalysis, setAiAnalysis] = useState<string | null>(
    'ResQ AI analysis complete: "Civic Center Regional Emergency Dome" (Sector 2 Central) holds 22 available 5L portable oxygen concentrators and 360 available beds. 0.8 km distance from current location.'
  );

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setAiAnalysis(
      `ResQ AI natural language processing synthesized query "${query}": Found 2 matching emergency assets in Sector 2 & Sector 4.`
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Search Header */}
      <div className="p-6 rounded-3xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 space-y-4 shadow-sm">
        <div className="flex items-center gap-2">
          <Sparkles className="w-6 h-6 text-orange-500" />
          <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 font-sans">
            AI Natural Intelligence & Asset Search
          </h1>
        </div>

        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-3.5" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask anything in natural language (e.g. 'List active floods near Riverside')"
              className="w-full pl-12 pr-28 py-3.5 bg-zinc-50 dark:bg-zinc-800/80 border border-zinc-200 dark:border-zinc-700 rounded-2xl text-sm focus:outline-none focus:border-orange-500 text-zinc-900 dark:text-zinc-100"
            />
            <button
              type="submit"
              className="absolute right-2 top-2 px-4 py-2 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl shadow"
            >
              Analyze AI
            </button>
          </div>

          <div className="flex flex-wrap gap-2 text-xs text-zinc-500">
            <span className="font-mono">Try queries:</span>
            <button
              type="button"
              onClick={() => {
                setQuery('List all critical flash flood reports in Sector 4');
                setAiAnalysis(
                  'Query Analysis: 1 Critical report "Flash Flood Risk at Metro Riverside" with 14 trapped vehicles. Water depth > 1.2m.'
                );
              }}
              className="hover:text-orange-500 underline"
            >
              "Critical floods in Sector 4"
            </button>
            <button
              type="button"
              onClick={() => {
                setQuery('Which shelters have power generators?');
                setAiAnalysis(
                  'Query Analysis: 3 shelters have backup industrial diesel power active: Civic Center Dome, Westside Gym, and North Bay Armory.'
                );
              }}
              className="hover:text-orange-500 underline"
            >
              "Shelters with generators"
            </button>
          </div>
        </form>
      </div>

      {/* AI Synthesis Box */}
      {aiAnalysis && (
        <div className="p-6 rounded-3xl bg-gradient-to-r from-orange-500/10 via-zinc-900 to-black border border-orange-500/30 text-zinc-100 space-y-3 shadow-md">
          <div className="flex items-center gap-2 text-orange-400 font-mono font-bold text-xs">
            <Bot className="w-4 h-4 text-orange-500" />
            <span>RESQ AI INTELLIGENCE SYNTHESIS ENGINE</span>
          </div>
          <p className="text-sm leading-relaxed text-zinc-200 font-sans">{aiAnalysis}</p>
          <div className="flex gap-2 pt-1">
            <button
              onClick={() => navigate('/shelters')}
              className="px-3.5 py-1.5 bg-orange-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1"
            >
              <span>View Target Shelter</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
