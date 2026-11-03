import React, { useState } from 'react';
import { MovieItem, TasteProfile, AISearchResult } from '../types';
import { Sparkles, Search, X, Play, Plus, Check, ArrowRight, Loader2 } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface NaturalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  libraryMovies: MovieItem[];
  taste: TasteProfile;
  onSelectMovie: (movie: MovieItem) => void;
  onAddToLibrary: (movie: MovieItem) => void;
  soundEnabled?: boolean;
}

const SAMPLE_QUERIES = [
  'Something like Prisoners but less dark, under 2 hours',
  'Cerebral 90s psychological thriller with a killer twist',
  'Mind-bending neon sci-fi with incredible atmospheric score',
  'Taut investigative procedural where detectives obsess',
  'Adrenaline heist film with sharp dry humor',
];

export const NaturalSearchModal: React.FC<NaturalSearchModalProps> = ({
  isOpen,
  onClose,
  libraryMovies,
  taste,
  onSelectMovie,
  onAddToLibrary,
  soundEnabled = false,
}) => {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState<AISearchResult[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchSource, setSearchSource] = useState<string>('');

  if (!isOpen) return null;

  const handleSearch = async (searchPrompt?: string) => {
    const activeQuery = searchPrompt || query;
    if (!activeQuery.trim()) return;

    soundEffects.bladeSlash(soundEnabled);
    setLoading(true);
    setHasSearched(true);

    try {
      const res = await fetch('/api/gemini/natural-search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: activeQuery,
          userTaste: taste,
          libraryTitles: libraryMovies.map((m) => m.title),
        }),
      });

      const data = await res.json();
      if (data.results) {
        // Cross-reference with user library
        const enriched: AISearchResult[] = data.results.map((r: any) => {
          const matched = libraryMovies.find(
            (lm) => lm.title.toLowerCase() === r.title.toLowerCase()
          );
          return {
            ...r,
            matchedLibraryMovie: matched,
          };
        });
        setResults(enriched);
        setSearchSource(data.source || 'gemini');
        soundEffects.cinematicHit(soundEnabled);
      }
    } catch (err) {
      console.error('AI search failed', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-3xl glass-panel rounded-3xl border border-white/20 shadow-[0_0_60px_rgba(0,0,0,0.9)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Blade Highlight */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#00F0FF] to-transparent" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-[#00F0FF]/10 text-[#00F0FF]">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-display uppercase tracking-wider text-white">
                Cinemind Natural Language Oracle
              </h2>
              <div className="text-xs font-mono-code text-zinc-400">
                Powered by Gemini 3.8 Flash • Matched against your media servers
              </div>
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Search Bar Input */}
        <div className="p-6 pb-2">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSearch();
            }}
            className="relative"
          >
            <input
              type="text"
              autoFocus
              placeholder="e.g. 'something like Prisoners but less dark, under 2 hours'..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#07070A] border-2 border-white/15 focus:border-[#00F0FF] rounded-2xl pl-12 pr-28 py-3.5 text-sm text-white placeholder-zinc-500 focus:outline-none transition-all shadow-inner"
            />
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
            <button
              type="submit"
              disabled={loading || !query.trim()}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 px-4 py-2 bg-[#00F0FF] hover:bg-[#00d6e6] text-black font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all disabled:opacity-40 cursor-pointer"
            >
              {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
              Search
            </button>
          </form>

          {/* Quick Query Pill Chips */}
          <div className="flex flex-wrap gap-1.5 mt-3">
            <span className="text-[11px] font-mono-code text-zinc-500 py-1">Try:</span>
            {SAMPLE_QUERIES.map((sq, i) => (
              <button
                key={i}
                type="button"
                onClick={() => {
                  setQuery(sq);
                  handleSearch(sq);
                }}
                className="text-[11px] font-mono-code px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-[#00F0FF] transition-all border border-white/5"
              >
                {sq}
              </button>
            ))}
          </div>
        </div>

        {/* Results Area */}
        <div className="p-6 pt-3 overflow-y-auto flex-1 space-y-3">
          {loading ? (
            <div className="py-16 text-center space-y-3">
              <Loader2 className="w-8 h-8 text-[#00F0FF] animate-spin mx-auto" />
              <div className="text-sm font-mono-code text-zinc-300">
                Synthesizing cinematic query & cross-referencing your servers...
              </div>
            </div>
          ) : results.length > 0 ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 px-1">
                <span>{results.length} Matches Found</span>
                <span className="text-[#00F0FF] uppercase">{searchSource} ENGINE</span>
              </div>

              {results.map((item, idx) => (
                <div
                  key={idx}
                  className="p-4 rounded-2xl bg-[#0B0D14] border border-white/10 hover:border-[#00F0FF]/40 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-base font-semibold text-white">{item.title}</h4>
                      <span className="text-xs font-mono-code text-zinc-400">({item.year})</span>
                      <span className="text-xs font-mono-code text-[#00F0FF] font-bold">
                        {item.similarityScore}% Fit
                      </span>
                    </div>

                    <p className="text-xs text-zinc-300 leading-relaxed max-w-xl">
                      {item.reason}
                    </p>

                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {item.vibes.map((vb, vi) => (
                        <span
                          key={vi}
                          className="text-[10px] font-mono-code px-2 py-0.5 rounded bg-white/5 text-zinc-400"
                        >
                          {vb}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Availability Badge & Action */}
                  <div className="flex items-center gap-2 flex-shrink-0 w-full sm:w-auto justify-between sm:justify-end">
                    {item.matchedLibraryMovie ? (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono-code text-[#CCFF00] bg-[#CCFF00]/10 px-2.5 py-1 rounded-md border border-[#CCFF00]/30 flex items-center gap-1">
                          <Check className="w-3 h-3" /> In Your {item.matchedLibraryMovie.serverType.toUpperCase()}
                        </span>
                        <button
                          onClick={() => {
                            soundEffects.bladeSlash(soundEnabled);
                            onSelectMovie(item.matchedLibraryMovie!);
                            onClose();
                          }}
                          className="px-3 py-1.5 bg-[#CCFF00] text-black font-semibold text-xs rounded-lg flex items-center gap-1"
                        >
                          <Play className="w-3 h-3 fill-black" />
                          Watch
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] font-mono-code text-zinc-500 bg-white/5 px-2.5 py-1 rounded-md">
                          Not in Library
                        </span>
                        <button
                          onClick={() => {
                            soundEffects.cinematicHit(soundEnabled);
                            onAddToLibrary({
                              id: `ai-${item.title.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${item.year}`,
                              title: item.title,
                              year: item.year,
                              overview: item.reason,
                              posterUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=600&q=80',
                              serverType: 'custom',
                              serverName: 'Wishlist / Radarr',
                              addedAt: new Date().toISOString(),
                              genres: ['Discovered'],
                              directors: [],
                              cast: [],
                              runtime: 110,
                              rating: 8.0,
                              status: 'saved',
                              matchScore: item.similarityScore,
                            });
                          }}
                          className="px-3 py-1.5 bg-white/10 hover:bg-white/20 text-white font-semibold text-xs rounded-lg flex items-center gap-1"
                        >
                          <Plus className="w-3 h-3" />
                          Track
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : hasSearched ? (
            <div className="py-12 text-center text-zinc-400 text-sm">
              No matching recommendations found for this exact query. Try rephrasing or using a sample query above.
            </div>
          ) : (
            <div className="py-12 text-center text-zinc-500 text-xs font-mono-code">
              Type any movie mood, plot concept, or pacing constraint. Gemini will match your request against films and check availability in your media servers.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
