import React, { useState, useMemo } from 'react';
import { MovieItem, TasteProfile, ServerConnection } from '../types';
import {
  Sparkles,
  Compass,
  CheckCircle,
  Filter,
  Search,
  Star,
  Play,
  Check,
  Server,
  Flame,
  Swords,
  ChevronDown,
  RotateCcw,
  SlidersHorizontal,
  Bookmark
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface DividedLibraryViewProps {
  movies: MovieItem[];
  taste: TasteProfile;
  servers: ServerConnection[];
  initialSubTab?: 'tonight' | 'interested' | 'watched';
  onSelectMovie: (movie: MovieItem) => void;
  onPlayTrailer: (movie: MovieItem) => void;
  onToggleSave: (movieId: string) => void;
  onMarkWatched: (movieId: string, userRating?: number) => void;
  onLikeMovie: (movieId: string) => void;
  savedIds: Set<string>;
  watchedIds: Set<string>;
  soundEnabled: boolean;
}

export const DividedLibraryView: React.FC<DividedLibraryViewProps> = ({
  movies,
  taste,
  servers,
  initialSubTab = 'tonight',
  onSelectMovie,
  onPlayTrailer,
  onToggleSave,
  onMarkWatched,
  onLikeMovie,
  savedIds,
  watchedIds,
  soundEnabled,
}) => {
  const [subTab, setSubTab] = useState<'tonight' | 'interested' | 'watched'>(initialSubTab);

  // Filter states for "All the movies I maybe Interested"
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [serverAvailability, setServerAvailability] = useState<'all' | 'on_server' | 'not_on_server'>('all');
  const [indianActionOnly, setIndianActionOnly] = useState<boolean>(false);
  const [englishAudioOnly, setEnglishAudioOnly] = useState<boolean>(false);
  const [minRating, setMinRating] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'year'>('match');
  const [tonightFilter, setTonightFilter] = useState<'top10' | 'top25' | 'top50' | 'all'>('all');
  const [visibleLimit, setVisibleLimit] = useState<number>(36);

  // Tonight Hero Index
  const [tonightHeroIndex, setTonightHeroIndex] = useState<number>(0);

  // 1. Tonight Suggestions: Top high match unseen movies
  const tonightSuggestions = useMemo(() => {
    const pool = movies
      .filter((m) => m.status !== 'seen' && m.status !== 'not_interested')
      .sort((a, b) => b.matchScore - a.matchScore);

    if (tonightFilter === 'top10') return pool.slice(0, 10);
    if (tonightFilter === 'top25') return pool.slice(0, 25);
    if (tonightFilter === 'top50') return pool.slice(0, 50);
    return pool; // Default shows ALL high match titles from the universe!
  }, [movies, tonightFilter]);

  const tonightHero = tonightSuggestions[tonightHeroIndex % Math.max(1, tonightSuggestions.length)] || movies[0];

  // 2. All the movies I maybe Interested: candidate catalog
  const interestedMovies = useMemo(() => {
    return movies.filter((m) => {
      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesTitle = m.title.toLowerCase().includes(q);
        const matchesCast = (m.cast || []).some((c) => c.toLowerCase().includes(q));
        const matchesDir = (m.directors || []).some((d) => d.toLowerCase().includes(q));
        const matchesOverview = (m.overview || '').toLowerCase().includes(q);
        if (!matchesTitle && !matchesCast && !matchesDir && !matchesOverview) return false;
      }

      // English Audio / Dubbed filter
      if (englishAudioOnly) {
        const isEnglishOriginal = m.originalLanguage === 'en' || m.industry === 'hollywood';
        const hasDub = m.hasEnglishAudio === true || (m.audioLanguages && m.audioLanguages.includes('English'));
        // In our catalog, major international blockbusters like RRR, KGF, Parasite, Squid Game have global English audio tracks
        const hasGlobalEnglishDub = ['rrr-2022', 'kalki-2898-ad-2024', 'parasite-2019', 'kill-2024', 'the-raid-redemption-2011', 'spirited-away-2001'].includes(m.id);
        if (!isEnglishOriginal && !hasDub && !hasGlobalEnglishDub) return false;
      }

      // Industry / Country
      if (selectedIndustry !== 'all') {
        if (selectedIndustry === 'indian_all') {
          if (!['tollywood', 'bollywood', 'kollywood', 'sandalwood', 'mollywood'].includes(m.industry || '')) {
            return false;
          }
        } else if (selectedIndustry === 'world_all') {
          if (!['hollywood', 'korean', 'japanese', 'world'].includes(m.industry || '')) {
            return false;
          }
        } else if (m.industry !== selectedIndustry) {
          return false;
        }
      }

      // Indian Action
      if (indianActionOnly && !m.isIndianAction) return false;

      // Genre
      if (selectedGenre !== 'all' && !(m.genres || []).includes(selectedGenre)) return false;

      // Server Availability
      if (serverAvailability === 'on_server' && (!m.serverType || m.serverType === 'none')) return false;
      if (serverAvailability === 'not_on_server' && m.serverType && m.serverType !== 'none') return false;

      // Rating
      if ((m.rating || 0) < minRating && (m.imdbRating || 0) < minRating) return false;

      return true;
    }).sort((a, b) => {
      if (sortBy === 'rating') return (b.imdbRating || b.rating || 0) - (a.imdbRating || a.rating || 0);
      if (sortBy === 'year') return b.year - a.year;
      return b.matchScore - a.matchScore;
    });
  }, [movies, searchQuery, englishAudioOnly, selectedIndustry, indianActionOnly, selectedGenre, serverAvailability, minRating, sortBy]);

  // 3. All the movies I already watched
  const watchedMovies = useMemo(() => {
    return movies.filter((m) => m.status === 'seen' || watchedIds.has(m.id));
  }, [movies, watchedIds]);

  return (
    <div className="min-h-screen pb-24 pt-20 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Page Title & Main 3-Way Segmented Tabs */}
      <div className="py-6 border-b border-white/10 mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight uppercase">
              Curated Cinema Library
            </h1>
            <p className="text-xs sm:text-sm text-zinc-400 mt-1">
              Personalized intelligence spanning global and Indian cinema.
            </p>
          </div>

          {/* Connected Server Indicator */}
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 bg-[#14141B] px-3.5 py-1.5 rounded-full border border-white/10">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{servers.length} Connected Media Servers (Optional)</span>
          </div>
        </div>

        {/* 3 Prominent Segmented Tabs as requested by user */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-[#14141B] p-1.5 rounded-2xl border border-white/10">
          {/* Tab 1: Tonight Suggestions */}
          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              setSubTab('tonight');
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'tonight'
                ? 'bg-gradient-to-r from-[#E50914] to-[#FF1352] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>Tonight Suggestions</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
              {tonightSuggestions.length}
            </span>
          </button>

          {/* Tab 2: All the movies I maybe Interested */}
          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              setSubTab('interested');
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'interested'
                ? 'bg-gradient-to-r from-[#E50914] to-[#FF1352] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Compass className="w-4 h-4 text-cyan-400" />
            <span>All Movies I'm Interested In</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
              {interestedMovies.length}
            </span>
          </button>

          {/* Tab 3: All the movies I already watched */}
          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              setSubTab('watched');
            }}
            className={`py-3 px-4 rounded-xl text-xs sm:text-sm font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
              subTab === 'watched'
                ? 'bg-gradient-to-r from-[#E50914] to-[#FF1352] text-white shadow-[0_0_20px_rgba(229,9,20,0.4)]'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <CheckCircle className="w-4 h-4 text-emerald-400" />
            <span>Already Watched</span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-black/30">
              {watchedMovies.length}
            </span>
          </button>
        </div>
      </div>

      {/* ─────────────────────────────────────────────────────────────
          SECTION 1: TONIGHT SUGGESTIONS
      ───────────────────────────────────────────────────────────── */}
      {subTab === 'tonight' && (
        <div className="space-y-8 animate-in fade-in">
          {tonightHero && (
            <div className="relative rounded-3xl overflow-hidden bg-[#14141B] border border-white/15 p-6 sm:p-10 shadow-2xl">
              <div className="absolute inset-0 z-0">
                <img
                  src={tonightHero.backdropUrl || tonightHero.posterUrl}
                  alt={tonightHero.title}
                  className="w-full h-full object-cover opacity-25 filter blur-xs"
                />
                <div className="absolute inset-0 bg-gradient-to-r from-[#14141B] via-[#14141B]/90 to-transparent" />
              </div>

              <div className="relative z-10 max-w-2xl">
                <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#E50914] uppercase tracking-wider mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Definitive Pick For Tonight ({tonightHero.matchScore}% Match)</span>
                </div>

                <h2 className="text-3xl sm:text-5xl font-display font-black text-white uppercase tracking-tight mb-3">
                  {tonightHero.title}
                </h2>

                <div className="flex items-center gap-3 text-xs font-mono text-zinc-300 mb-4">
                  <span className="text-[#46D369] font-bold">{tonightHero.matchScore}% Match</span>
                  <span>{tonightHero.year}</span>
                  <span className="border border-white/30 px-1 rounded text-[10px]">
                    {tonightHero.ageRating || '16+'}
                  </span>
                  <span>{Math.floor(tonightHero.runtime / 60)}h {tonightHero.runtime % 60}m</span>
                  <span className="text-amber-400 font-bold">★ {tonightHero.rating}</span>
                </div>

                {/* AI / Curator Explanation */}
                <div className="bg-black/40 border border-white/10 rounded-2xl p-4 mb-5 backdrop-blur-md">
                  <div className="text-[11px] font-bold text-zinc-300 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                    <span>Why this for you tonight</span>
                  </div>
                  <p className="text-xs text-zinc-300 leading-relaxed italic">
                    "{tonightHero.matchBreakdown?.matchedReasons.join(' • ') || 'A masterpiece calibrated to your affinity for high-octane tension, auteur direction, and relentless momentum.'}"
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center gap-3">
                  <button
                    onClick={() => {
                      soundEffects.bladeSlash(soundEnabled);
                      onPlayTrailer(tonightHero);
                    }}
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-black font-bold text-xs uppercase tracking-wider hover:bg-zinc-200 transition-all cursor-pointer shadow-lg"
                  >
                    <Play className="w-4 h-4 fill-black" />
                    <span>Watch Trailer</span>
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.whoosh(soundEnabled);
                      onSelectMovie(tonightHero);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-all cursor-pointer"
                  >
                    Details & Streaming
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onToggleSave(tonightHero.id);
                    }}
                    className={`p-2.5 rounded-xl border transition-all cursor-pointer ${
                      savedIds.has(tonightHero.id)
                        ? 'bg-[#E50914] border-[#E50914] text-white'
                        : 'bg-white/10 border-white/20 text-zinc-300 hover:text-white'
                    }`}
                    title="Add to My List"
                  >
                    <Bookmark className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => {
                      soundEffects.whoosh(soundEnabled);
                      setTonightHeroIndex(prev => prev + 1);
                    }}
                    className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer"
                  >
                    Next Suggestion ↻
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Alternate Tonight Recommendations Stack */}
          <div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
              <div>
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Top Suggestions For Tonight</span>
                  <span className="text-xs px-2 py-0.5 rounded bg-[#46D369]/20 text-[#46D369] font-mono font-bold">
                    {tonightSuggestions.length} Titles
                  </span>
                </h3>
                <p className="text-xs text-zinc-400 font-mono mt-0.5">Ranked by Taste Affinity Across Worldwide Cinema</p>
              </div>

              {/* Limit Selector */}
              <div className="flex items-center gap-1.5 bg-[#14141B] p-1 rounded-xl border border-white/10 text-xs">
                <span className="text-[10px] text-zinc-400 font-mono px-2">Show:</span>
                {[
                  { id: 'top10', label: 'Top 10' },
                  { id: 'top25', label: 'Top 25' },
                  { id: 'top50', label: 'Top 50' },
                  { id: 'all', label: `All High Matches (${movies.filter(m => m.matchScore >= 90).length})` },
                ].map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      setTonightFilter(opt.id as any);
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      tonightFilter === opt.id
                        ? 'bg-[#E50914] text-white font-bold shadow'
                        : 'text-zinc-400 hover:text-white'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
              {tonightSuggestions.map((m, idx) => (
                <div
                  key={m.id}
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onSelectMovie(m);
                  }}
                  className="bg-[#14141B] rounded-xl overflow-hidden border border-white/10 hover:border-[#E50914] transition-all cursor-pointer group shadow-lg"
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-900">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#46D369] font-bold">
                      {m.matchScore}%
                    </div>
                    {m.originalLanguage === 'en' || m.hasEnglishAudio ? (
                      <div className="absolute bottom-2 left-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-400 font-bold border border-cyan-500/30">
                        ENG
                      </div>
                    ) : null}
                  </div>
                  <div className="p-2.5">
                    <div className="text-xs font-bold text-white truncate">{m.title}</div>
                    <div className="text-[10px] text-zinc-400 font-mono mt-0.5">{m.year} • {m.genres[0]}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 2: ALL MOVIES I MAYBE INTERESTED IN (FULL DIRECTORY)
      ───────────────────────────────────────────────────────────── */}
      {subTab === 'interested' && (
        <div className="space-y-6 animate-in fade-in">
          {/* Filter Controls Bar */}
          <div className="bg-[#14141B] rounded-2xl border border-white/10 p-4 space-y-4 shadow-xl">
            <div className="flex flex-col sm:flex-row gap-3">
              {/* Search within Interested Catalog */}
              <div className="relative flex-1">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="Filter whole catalog by title, actor, director, plot..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-[#0B0B0F] border border-white/15 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#E50914]"
                />
              </div>

              {/* Sort By */}
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400 font-mono">Sort:</span>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="bg-[#0B0B0F] border border-white/15 text-xs text-zinc-200 rounded-xl px-3 py-2.5 focus:outline-none"
                >
                  <option value="match">Match %</option>
                  <option value="rating">IMDb / TMDB Rating</option>
                  <option value="year">Release Year (Newest)</option>
                </select>
              </div>

              {/* Reset/Reload Master Button */}
              <button
                onClick={() => {
                  soundEffects.whoosh(soundEnabled);
                  localStorage.removeItem('cinemind_movies');
                  window.location.reload();
                }}
                className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono transition-all cursor-pointer"
                title="Resets local storage cache and loads the full master world catalog"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reload Universe</span>
              </button>
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/10">
              {/* Industry / Country Filter */}
              <div className="flex items-center gap-1.5 overflow-x-auto text-xs pb-1">
                {[
                  { id: 'all', label: `All Countries (${movies.length})` },
                  { id: 'hollywood', label: 'Hollywood' },
                  { id: 'world_all', label: 'World Cinema & Europe' },
                  { id: 'korean', label: 'Korean Cinema' },
                  { id: 'japanese', label: 'Japanese' },
                  { id: 'indian_all', label: 'All Indian' },
                  { id: 'tollywood', label: 'Tollywood' },
                  { id: 'bollywood', label: 'Bollywood' },
                  { id: 'kollywood', label: 'Kollywood' },
                  { id: 'sandalwood', label: 'Sandalwood' },
                  { id: 'mollywood', label: 'Mollywood' },
                ].map((ind) => (
                  <button
                    key={ind.id}
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      setSelectedIndustry(ind.id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all whitespace-nowrap ${
                      selectedIndustry === ind.id
                        ? 'bg-[#E50914] text-white shadow font-bold'
                        : 'bg-white/5 text-zinc-400 hover:text-white'
                    }`}
                  >
                    {ind.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2 pt-2 w-full border-t border-white/5">
                {/* English Audio / Dubbed Toggle */}
                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setEnglishAudioOnly(!englishAudioOnly);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                    englishAudioOnly
                      ? 'bg-[#00F0FF]/20 border-[#00F0FF] text-[#00F0FF] shadow-[0_0_15px_rgba(0,240,255,0.3)]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                  title="Filter to movies with English original audio or official English dubbed track"
                >
                  <span>🎧</span>
                  <span>English Audio / Dubbed</span>
                </button>

                {/* Indian Action Toggle */}
                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    setIndianActionOnly(!indianActionOnly);
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold cursor-pointer border transition-all ${
                    indianActionOnly
                      ? 'bg-[#FF1352]/20 border-[#FF1352] text-[#FF1352]'
                      : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                  }`}
                >
                  <Swords className="w-3.5 h-3.5" />
                  <span>Indian Action</span>
                </button>

                {/* Server Filter */}
                <select
                  value={serverAvailability}
                  onChange={(e) => setServerAvailability(e.target.value as any)}
                  className="bg-[#0B0B0F] border border-white/15 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value="all">Server: All Movies ({movies.length})</option>
                  <option value="on_server">Only on My Server</option>
                  <option value="not_on_server">Not on My Server</option>
                </select>

                {/* Minimum Rating Filter */}
                <select
                  value={minRating}
                  onChange={(e) => setMinRating(Number(e.target.value))}
                  className="bg-[#0B0B0F] border border-white/15 text-xs text-zinc-300 rounded-lg px-2.5 py-1.5 focus:outline-none"
                >
                  <option value={0}>Rating: Any Score</option>
                  <option value={7.0}>Rating: 7.0+ IMDb</option>
                  <option value={8.0}>Rating: 8.0+ Acclaimed</option>
                  <option value={8.5}>Rating: 8.5+ Masterpiece</option>
                </select>
              </div>
            </div>
          </div>

          {/* Results Count Banner */}
          <div className="flex items-center justify-between text-xs text-zinc-400 font-mono bg-white/5 px-4 py-2.5 rounded-xl border border-white/10">
            <span className="text-white font-semibold">
              Showing <span className="text-[#E50914] font-bold">{Math.min(visibleLimit, interestedMovies.length)}</span> of <span className="text-[#46D369] font-bold">{interestedMovies.length}</span> movies matching your interests
            </span>
            <span className="text-zinc-400">Total Directory Catalog: {movies.length} titles</span>
          </div>

          {/* Interested Movies Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-3 sm:gap-4">
            {interestedMovies.slice(0, visibleLimit).map((movie) => {
              const isSaved = savedIds.has(movie.id);
              const isWatched = watchedIds.has(movie.id);
              const isEnglish = movie.originalLanguage === 'en' || movie.hasEnglishAudio;

              return (
                <div
                  key={movie.id}
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onSelectMovie(movie);
                  }}
                  className="bg-[#14141B] rounded-xl overflow-hidden border border-white/10 hover:border-[#E50914] transition-all flex flex-col justify-between group shadow-lg cursor-pointer"
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-900">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />

                    {/* Top Badges */}
                    <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                      {movie.isIndianAction ? (
                        <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[9px] font-bold uppercase shadow">
                          ACTION
                        </span>
                      ) : (
                        <span />
                      )}
                      <span className="bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#46D369] font-bold">
                        {movie.matchScore}%
                      </span>
                    </div>

                    {/* English Audio Tag */}
                    {isEnglish && (
                      <div className="absolute top-8 left-2 bg-black/80 backdrop-blur-sm px-1.5 py-0.5 rounded text-[9px] font-mono text-cyan-400 font-bold border border-cyan-500/30">
                        ENG
                      </div>
                    )}

                    {/* Server Badge */}
                    {movie.serverType && movie.serverType !== 'none' && (
                      <div className="absolute bottom-2 left-2 right-2 bg-emerald-950/90 border border-emerald-400/40 text-emerald-300 px-2 py-0.5 rounded text-[9px] font-mono text-center">
                        On {movie.serverName.split(' ')[0]}
                      </div>
                    )}
                  </div>

                  <div className="p-3">
                    <h4 className="text-xs font-bold text-white truncate mb-1">{movie.title}</h4>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{movie.year}</span>
                      <span className="text-amber-400">★ {movie.imdbRating || movie.rating}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Load More & Expand Full Catalog Controls */}
          {visibleLimit < interestedMovies.length && (
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-6 border-t border-white/10">
              <button
                onClick={() => {
                  soundEffects.whoosh(soundEnabled);
                  setVisibleLimit((prev) => prev + 36);
                }}
                className="px-6 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold text-xs uppercase tracking-wider cursor-pointer transition-all"
              >
                Load More (+36 Titles)
              </button>
              <button
                onClick={() => {
                  soundEffects.cinematicHit(soundEnabled);
                  setVisibleLimit(interestedMovies.length);
                }}
                className="px-6 py-2.5 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-xs uppercase tracking-wider cursor-pointer shadow-lg shadow-[#E50914]/20 transition-all"
              >
                Show All {interestedMovies.length} Titles In Universe
              </button>
            </div>
          )}
        </div>
      )}

      {/* ─────────────────────────────────────────────────────────────
          SECTION 3: ALL MOVIES I ALREADY WATCHED
      ───────────────────────────────────────────────────────────── */}
      {subTab === 'watched' && (
        <div className="space-y-6 animate-in fade-in">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">
              Watched History & Ratings ({watchedMovies.length} movies)
            </h2>
            <span className="text-xs text-zinc-400 font-mono">
              Refines your taste profile in real-time
            </span>
          </div>

          {watchedMovies.length === 0 ? (
            <div className="bg-[#14141B] rounded-2xl border border-white/10 p-12 text-center text-zinc-400">
              <CheckCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white mb-1">No movies marked as watched yet</div>
              <p className="text-xs text-zinc-500">
                Click the checkmark on any movie card to mark it as watched and add your score.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchedMovies.map((movie) => (
                <div
                  key={movie.id}
                  className="bg-[#14141B] rounded-2xl border border-white/10 p-4 flex gap-4 hover:border-white/20 transition-all"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-20 h-28 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                    onClick={() => onSelectMovie(movie)}
                  />

                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[10px] font-mono text-emerald-400 font-semibold flex items-center gap-1">
                          <Check className="w-3 h-3" /> WATCHED
                        </span>
                        <span className="font-mono text-zinc-500 text-[10px]">{movie.year}</span>
                      </div>

                      <h4
                        onClick={() => onSelectMovie(movie)}
                        className="text-sm font-bold text-white hover:text-[#E50914] cursor-pointer line-clamp-1 mb-1"
                      >
                        {movie.title}
                      </h4>

                      {movie.userNotes && (
                        <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                          "{movie.userNotes}"
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{movie.userRating || 9}/10 My Score</span>
                      </div>

                      <button
                        onClick={() => {
                          soundEffects.bladeSlash(soundEnabled);
                          onPlayTrailer(movie);
                        }}
                        className="text-[11px] font-semibold text-zinc-300 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Rewatch</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
