import React, { useState, useMemo } from 'react';
import { MovieItem, ServerType, WatchStatus } from '../types';
import {
  Server,
  Filter,
  Search,
  Grid,
  Calendar,
  Layers,
  Star,
  Clock,
  Play,
  Bookmark,
  Check,
  Sparkles,
  SlidersHorizontal,
  ChevronDown
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface MyLibraryProps {
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onUpdateStatus: (movieId: string, status: WatchStatus) => void;
  onOpenExtensionModal: () => void;
  soundEnabled?: boolean;
}

export const MyLibrary: React.FC<MyLibraryProps> = ({
  movies,
  onSelectMovie,
  onUpdateStatus,
  onOpenExtensionModal,
  soundEnabled = false,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedServer, setSelectedServer] = useState<string>('all');
  const [selectedGenre, setSelectedGenre] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unseen' | 'seen' | 'saved'>('all');
  const [runtimeFilter, setRuntimeFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'match' | 'rating' | 'year' | 'runtime' | 'title'>('match');
  const [viewMode, setViewMode] = useState<'grid' | 'timeline' | 'stack'>('grid');
  const [showFiltersDrawer, setShowFiltersDrawer] = useState(false);

  // Extract distinct servers and genres
  const availableServers = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      if (m.serverName) set.add(m.serverName);
    });
    return Array.from(set);
  }, [movies]);

  const availableGenres = useMemo(() => {
    const set = new Set<string>();
    movies.forEach((m) => {
      (m.genres || []).forEach((g) => set.add(g));
    });
    return Array.from(set).sort();
  }, [movies]);

  // Filter and sort movies
  const filteredMovies = useMemo(() => {
    return movies
      .filter((movie) => {
        // Search filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchesTitle = movie.title.toLowerCase().includes(q);
          const matchesDirector = (movie.directors || []).some((d) => d.toLowerCase().includes(q));
          const matchesCast = (movie.cast || []).some((c) => c.toLowerCase().includes(q));
          const matchesGenre = (movie.genres || []).some((g) => g.toLowerCase().includes(q));
          if (!matchesTitle && !matchesDirector && !matchesCast && !matchesGenre) {
            return false;
          }
        }

        // Server filter
        if (selectedServer !== 'all' && movie.serverName !== selectedServer) {
          return false;
        }

        // Genre filter
        if (selectedGenre !== 'all' && !movie.genres?.includes(selectedGenre)) {
          return false;
        }

        // Status filter
        if (statusFilter !== 'all' && movie.status !== statusFilter) {
          return false;
        }

        // Runtime filter
        if (runtimeFilter === 'under90' && movie.runtime > 90) return false;
        if (runtimeFilter === '90to120' && (movie.runtime < 90 || movie.runtime > 120)) return false;
        if (runtimeFilter === 'over120' && movie.runtime <= 120) return false;

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'match') return b.matchScore - a.matchScore;
        if (sortBy === 'rating') return b.rating - a.rating;
        if (sortBy === 'year') return b.year - a.year;
        if (sortBy === 'runtime') return b.runtime - a.runtime;
        if (sortBy === 'title') return a.title.localeCompare(b.title);
        return 0;
      });
  }, [movies, searchQuery, selectedServer, selectedGenre, statusFilter, runtimeFilter, sortBy]);

  // Group by decade for timeline view
  const timelineGroups = useMemo(() => {
    const groups: Record<string, MovieItem[]> = {};
    filteredMovies.forEach((m) => {
      const decade = `${Math.floor(m.year / 10) * 10}s`;
      if (!groups[decade]) groups[decade] = [];
      groups[decade].push(m);
    });
    return groups;
  }, [filteredMovies]);

  return (
    <div className="space-y-6">
      {/* Header bar */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#CCFF00] uppercase tracking-wider mb-1">
            <Server className="w-3.5 h-3.5" />
            Detected Media Server Inventory
          </div>
          <h2 className="text-3xl font-display uppercase tracking-wider text-white">
            My Media Library ({filteredMovies.length} Films)
          </h2>
        </div>

        {/* View Switcher & Sync Extension Button */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onOpenExtensionModal();
            }}
            className="px-4 py-2 rounded-xl bg-[#141721] hover:bg-[#1E2333] border border-[#CCFF00]/30 hover:border-[#CCFF00] text-xs font-mono-code text-[#CCFF00] flex items-center gap-2 transition-all cursor-pointer shadow-[0_0_15px_rgba(204,255,0,0.1)]"
          >
            <Server className="w-3.5 h-3.5" />
            Sync Media Server
          </button>

          <div className="flex items-center bg-[#0B0D14] p-1 rounded-xl border border-white/10">
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                setViewMode('grid');
              }}
              title="Katana Grid"
              aria-label="Grid View"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'grid' ? 'bg-[#CCFF00] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Grid className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                setViewMode('timeline');
              }}
              title="Timeline Era View"
              aria-label="Timeline View"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'timeline' ? 'bg-[#CCFF00] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Calendar className="w-4 h-4" />
            </button>
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                setViewMode('stack');
              }}
              title="Compact Stack View"
              aria-label="Stack View"
              className={`p-2 rounded-lg transition-all ${
                viewMode === 'stack' ? 'bg-[#CCFF00] text-black' : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Layers className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Filter and Search Toolbar */}
      <div className="glass-panel p-4 rounded-2xl border border-white/10 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
            <input
              type="text"
              placeholder="Search by title, director, actor, genre..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#07070A] border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#CCFF00]"
            />
          </div>

          {/* Server Selector */}
          <div className="md:col-span-3">
            <select
              aria-label="Filter by server"
              value={selectedServer}
              onChange={(e) => {
                soundEffects.click(soundEnabled);
                setSelectedServer(e.target.value);
              }}
              className="w-full bg-[#07070A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              <option value="all">All Connected Servers</option>
              {availableServers.map((srv) => (
                <option key={srv} value={srv}>
                  {srv}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              aria-label="Sort movies by"
              value={sortBy}
              onChange={(e) => {
                soundEffects.click(soundEnabled);
                setSortBy(e.target.value as any);
              }}
              className="w-full bg-[#07070A] border border-white/10 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
            >
              <option value="match">Sort: Match %</option>
              <option value="rating">Sort: TMDB Rating</option>
              <option value="year">Sort: Year (Newest)</option>
              <option value="runtime">Sort: Runtime</option>
              <option value="title">Sort: Title (A-Z)</option>
            </select>
          </div>

          {/* Advanced Filters Toggle */}
          <div className="md:col-span-2 flex justify-end">
            <button
              onClick={() => setShowFiltersDrawer(!showFiltersDrawer)}
              className={`w-full py-2.5 px-3 rounded-xl border text-xs font-medium flex items-center justify-center gap-1.5 transition-all ${
                showFiltersDrawer
                  ? 'bg-[#CCFF00]/10 border-[#CCFF00] text-[#CCFF00]'
                  : 'bg-[#07070A] border-white/10 text-zinc-300 hover:border-white/20'
              }`}
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              Filters
              <ChevronDown
                className={`w-3.5 h-3.5 transition-transform ${showFiltersDrawer ? 'rotate-180' : ''}`}
              />
            </button>
          </div>
        </div>

        {/* Collapsible Advanced Filters Drawer */}
        {showFiltersDrawer && (
          <div className="pt-4 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-4 animate-in fade-in duration-200">
            {/* Genre Filter */}
            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 uppercase mb-1.5 block">
                Genre
              </label>
              <select
                aria-label="Genre Filter"
                value={selectedGenre}
                onChange={(e) => setSelectedGenre(e.target.value)}
                className="w-full bg-[#07070A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
              >
                <option value="all">All Genres</option>
                {availableGenres.map((g) => (
                  <option key={g} value={g}>
                    {g}
                  </option>
                ))}
              </select>
            </div>

            {/* Watch Status Filter */}
            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 uppercase mb-1.5 block">
                Status
              </label>
              <div className="grid grid-cols-4 gap-1">
                {(['all', 'unseen', 'seen', 'saved'] as const).map((st) => (
                  <button
                    key={st}
                    type="button"
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      setStatusFilter(st);
                    }}
                    className={`py-2 text-[11px] rounded-lg font-mono-code uppercase transition-all ${
                      statusFilter === st
                        ? 'bg-[#CCFF00] text-black font-bold'
                        : 'bg-[#07070A] text-zinc-400 border border-white/5 hover:text-white'
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            {/* Runtime Filter */}
            <div>
              <label className="text-[11px] font-mono-code text-zinc-400 uppercase mb-1.5 block">
                Duration
              </label>
              <select
                aria-label="Duration Filter"
                value={runtimeFilter}
                onChange={(e) => setRuntimeFilter(e.target.value)}
                className="w-full bg-[#07070A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
              >
                <option value="all">Any Runtime</option>
                <option value="under90">&lt; 90 min (Quick)</option>
                <option value="90to120">90 – 120 min</option>
                <option value="over120">&gt; 120 min (Epic)</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Movies Rendering Area */}
      {filteredMovies.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-white/10">
          <p className="text-zinc-400 text-sm">No movies match your current library filter.</p>
          <button
            onClick={() => {
              setSearchQuery('');
              setSelectedServer('all');
              setSelectedGenre('all');
              setStatusFilter('all');
              setRuntimeFilter('all');
            }}
            className="mt-4 px-4 py-2 bg-[#CCFF00] text-black font-semibold text-xs rounded-xl hover:bg-[#b5e000]"
          >
            Clear Filters
          </button>
        </div>
      ) : viewMode === 'grid' ? (
        /* Katana Grid View with Angled Corners */
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => {
                soundEffects.click(soundEnabled);
                onSelectMovie(movie);
              }}
              className="group relative rounded-2xl overflow-hidden glass-panel border border-white/10 hover:border-[#CCFF00]/80 transition-all duration-300 hover:shadow-[0_10px_30px_rgba(204,255,0,0.15)] hover:-translate-y-1 cursor-pointer flex flex-col clip-blade-sm"
            >
              {/* Poster Image Container */}
              <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#07070A]">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />

                {/* Match % Badge */}
                <div className="absolute top-2.5 right-2.5 px-2.5 py-1 rounded-md text-xs font-mono-code font-bold bg-[#07070A]/90 text-[#CCFF00] border border-[#CCFF00]/40 shadow-lg backdrop-blur-md">
                  {movie.matchScore}%
                </div>

                {/* Status Indicator */}
                {movie.status === 'seen' && (
                  <div className="absolute top-2.5 left-2.5 p-1 rounded-md bg-[#CCFF00]/90 text-black shadow-md">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
                {movie.status === 'saved' && (
                  <div className="absolute top-2.5 left-2.5 p-1 rounded-md bg-[#FF007F]/90 text-white shadow-md">
                    <Bookmark className="w-3.5 h-3.5 fill-white" />
                  </div>
                )}

                {/* Hover Quick Overlay with Stream Button */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-3">
                  <div className="text-xs text-zinc-300 line-clamp-2 mb-2">{movie.overview}</div>
                  <div className="flex gap-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.bladeSlash(soundEnabled);
                        if (movie.itemUrl) window.open(movie.itemUrl, '_blank');
                        else onSelectMovie(movie);
                      }}
                      className="flex-1 py-1.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-syne font-bold text-[11px] rounded-lg flex items-center justify-center gap-1 uppercase"
                    >
                      <Play className="w-3 h-3 fill-black" />
                      Play
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        soundEffects.cinematicHit(soundEnabled);
                        onUpdateStatus(movie.id, movie.status === 'saved' ? 'unseen' : 'saved');
                      }}
                      className={`p-1.5 rounded-lg border text-xs ${
                        movie.status === 'saved'
                          ? 'bg-[#FF007F] text-white border-[#FF007F]'
                          : 'bg-black/60 text-white border-white/20 hover:bg-white/20'
                      }`}
                    >
                      <Bookmark className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Card Meta Content */}
              <div className="p-3.5 bg-[#0B0D14] flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-semibold text-white text-sm truncate group-hover:text-[#CCFF00] transition-colors">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mt-1">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.runtime}m</span>
                    <span>•</span>
                    <span className="text-amber-400 flex items-center gap-0.5">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.rating.toFixed(1)}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono-code text-zinc-500">
                  <span className="truncate max-w-[110px] text-zinc-400">{movie.serverName}</span>
                  <span className="uppercase text-[#00F0FF]">{movie.serverType}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : viewMode === 'timeline' ? (
        /* Timeline Era View */
        <div className="space-y-8">
          {Object.entries(timelineGroups)
            .sort(([decA], [decB]) => decB.localeCompare(decA))
            .map(([decade, dMovies]) => (
              <div key={decade} className="glass-panel p-6 rounded-2xl border border-white/10">
                <div className="flex items-center gap-3 mb-4 border-b border-white/10 pb-3">
                  <h3 className="text-2xl font-display text-[#CCFF00]">{decade} ERA</h3>
                  <span className="text-xs font-mono-code text-zinc-400">
                    {dMovies.length} Available
                  </span>
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 gap-4">
                  {dMovies.map((m) => (
                    <div
                      key={m.id}
                      onClick={() => onSelectMovie(m)}
                      className="group cursor-pointer rounded-xl overflow-hidden border border-white/10 hover:border-[#CCFF00] transition-all bg-[#0B0D14]"
                    >
                      <div className="aspect-[2/3] w-full overflow-hidden relative">
                        <img
                          src={m.posterUrl}
                          alt={m.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono-code bg-black/80 text-[#CCFF00]">
                          {m.matchScore}%
                        </div>
                      </div>
                      <div className="p-2 text-xs truncate font-medium text-white">{m.title}</div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      ) : (
        /* Compact Stack View */
        <div className="divide-y divide-white/10 glass-panel rounded-2xl overflow-hidden border border-white/10">
          {filteredMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => onSelectMovie(movie)}
              className="p-4 flex items-center justify-between gap-4 hover:bg-white/5 transition-colors cursor-pointer group"
            >
              <div className="flex items-center gap-4 min-w-0">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-12 h-16 object-cover rounded-lg flex-shrink-0"
                />
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-white group-hover:text-[#CCFF00] truncate">
                    {movie.title}
                  </h3>
                  <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mt-0.5">
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.runtime}m</span>
                    <span>•</span>
                    <span>{movie.genres.slice(0, 2).join(', ')}</span>
                  </div>
                  <div className="text-[11px] font-mono-code text-zinc-500 mt-1 flex items-center gap-1.5">
                    <Server className="w-3 h-3 text-[#CCFF00]" />
                    {movie.serverName}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-4 flex-shrink-0">
                <div className="text-right">
                  <div className="text-base font-display text-[#CCFF00]">{movie.matchScore}%</div>
                  <div className="text-[10px] font-mono-code text-zinc-500">MATCH</div>
                </div>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    soundEffects.bladeSlash(soundEnabled);
                    if (movie.itemUrl) window.open(movie.itemUrl, '_blank');
                    else onSelectMovie(movie);
                  }}
                  className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-semibold text-xs rounded-lg flex items-center gap-1"
                >
                  <Play className="w-3 h-3 fill-black" />
                  Play
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
