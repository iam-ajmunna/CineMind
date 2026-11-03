import React, { useState } from 'react';
import { MovieItem, WatchStatus } from '../types';
import {
  Play,
  Check,
  Bookmark,
  EyeOff,
  Sparkles,
  Info,
  Server,
  Clock,
  Star,
  ChevronRight,
  ChevronLeft,
  Tv,
  Film
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface TonightHeroProps {
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onUpdateStatus: (movieId: string, status: WatchStatus) => void;
  soundEnabled?: boolean;
}

export const TonightHero: React.FC<TonightHeroProps> = ({
  movies,
  onSelectMovie,
  onUpdateStatus,
  soundEnabled = false,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [showTrailer, setShowTrailer] = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Filter out movies marked 'not_interested' or 'seen' for Tonight hero
  const candidateMovies = movies.filter((m) => m.status !== 'not_interested');
  const heroMovie = candidateMovies[currentIndex] || candidateMovies[0] || movies[0];

  if (!heroMovie) {
    return (
      <div className="p-12 text-center glass-panel rounded-2xl border border-white/10">
        <Film className="w-12 h-12 text-[#CCFF00] mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-display uppercase tracking-wider text-white">No Movies in Queue</h3>
        <p className="text-sm text-zinc-400 mt-2">Sync with your media server or reset your filters.</p>
      </div>
    );
  }

  const handleNext = () => {
    soundEffects.whoosh(soundEnabled);
    setShowTrailer(false);
    setCurrentIndex((prev) => (prev + 1) % candidateMovies.length);
  };

  const handlePrev = () => {
    soundEffects.whoosh(soundEnabled);
    setShowTrailer(false);
    setCurrentIndex((prev) => (prev - 1 + candidateMovies.length) % candidateMovies.length);
  };

  const handleWatchNow = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.bladeSlash(soundEnabled);
    if (heroMovie.itemUrl) {
      window.open(heroMovie.itemUrl, '_blank');
    } else {
      onSelectMovie(heroMovie);
    }
  };

  const handleMarkSeen = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.cinematicHit(soundEnabled);
    onUpdateStatus(heroMovie.id, 'seen');
    handleNext();
  };

  const handleNotInterested = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.click(soundEnabled);
    onUpdateStatus(heroMovie.id, 'not_interested');
    handleNext();
  };

  const handleSave = (e: React.MouseEvent) => {
    e.stopPropagation();
    soundEffects.cinematicHit(soundEnabled);
    onUpdateStatus(heroMovie.id, heroMovie.status === 'saved' ? 'unseen' : 'saved');
  };

  const breakdown = heroMovie.matchBreakdown;

  return (
    <div className="relative w-full">
      {/* 1. Main Featured Hero Card */}
      <div className="relative rounded-3xl overflow-hidden glass-panel border border-white/15 shadow-[0_20px_60px_rgba(0,0,0,0.8)] blade-edge">
        {/* Background Backdrop Image or Trailer */}
        <div className="relative h-[480px] sm:h-[560px] md:h-[620px] w-full overflow-hidden">
          {showTrailer && heroMovie.trailerUrl ? (
            <div className="absolute inset-0 bg-black z-10 flex flex-col items-center justify-center">
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${
                  heroMovie.trailerUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'
                }?autoplay=1&rel=0&modestbranding=1`}
                title={`${heroMovie.title} Trailer`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 z-20 px-3 py-1.5 bg-black/80 hover:bg-[#CCFF00] hover:text-black text-xs font-mono-code uppercase rounded-lg border border-white/20 transition-all"
              >
                Close Trailer
              </button>
            </div>
          ) : (
            <>
              <img
                src={heroMovie.backdropUrl || heroMovie.posterUrl}
                alt={heroMovie.title}
                className="w-full h-full object-cover object-center filter brightness-75 contrast-110 scale-105 transition-transform duration-1000 ease-out opacity-80"
              />
              {/* Cinematic Vignette & Blade Light Gradients */}
              <div className="absolute inset-0 bg-gradient-to-t from-[#07070A] via-[#07070A]/50 to-transparent" />
              <div className="absolute inset-0 bg-gradient-to-r from-[#07070A] via-[#07070A]/30 to-transparent" />
              {/* Subtle top blade line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />
            </>
          )}

          {/* Quick Server Ribbon */}
          <div className="absolute top-6 left-6 z-10 flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code uppercase bg-[#07070A]/90 text-[#CCFF00] border border-[#CCFF00]/40 backdrop-blur-md shadow-lg">
              <Server className="w-3.5 h-3.5" />
              {heroMovie.serverName}
            </span>
            {heroMovie.quality && (
              <span className="px-2.5 py-1 rounded-md text-[11px] font-mono-code uppercase bg-white/10 text-zinc-300 border border-white/10 backdrop-blur-md">
                {heroMovie.quality}
              </span>
            )}
          </div>

          {/* Navigation Arrows on Backdrop */}
          <div className="absolute top-6 right-6 z-10 flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous movie"
              className="p-2.5 rounded-full bg-black/60 hover:bg-[#CCFF00] hover:text-black text-white border border-white/15 backdrop-blur-md transition-all"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next movie"
              className="p-2.5 rounded-full bg-black/60 hover:bg-[#CCFF00] hover:text-black text-white border border-white/15 backdrop-blur-md transition-all"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Hero Content Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 sm:p-10 z-10">
            <div className="max-w-4xl space-y-4">
              {/* Match Score Badge with Breakdown Popover */}
              <div className="relative inline-block">
                <div
                  onMouseEnter={() => setShowBreakdown(true)}
                  onMouseLeave={() => setShowBreakdown(false)}
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="cursor-pointer inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#141721]/90 border border-[#CCFF00]/50 shadow-[0_0_20px_rgba(204,255,0,0.25)] text-white backdrop-blur-md group"
                >
                  <Sparkles className="w-4 h-4 text-[#CCFF00] group-hover:rotate-12 transition-transform" />
                  <span className="font-display tracking-wider text-lg text-[#CCFF00]">
                    {heroMovie.matchScore}% MATCH
                  </span>
                  <span className="text-[11px] font-mono-code text-zinc-400 border-l border-white/20 pl-2">
                    Why Tonight?
                  </span>
                  <Info className="w-3.5 h-3.5 text-zinc-400 group-hover:text-white" />
                </div>

                {/* Match Breakdown Popover Tooltip */}
                {showBreakdown && breakdown && (
                  <div className="absolute bottom-full left-0 mb-3 w-80 sm:w-96 p-4 rounded-2xl glass-panel-glow text-xs z-50 animate-in fade-in zoom-in-95 duration-200">
                    <div className="font-mono-code text-[#CCFF00] uppercase text-[11px] font-bold mb-2 flex items-center justify-between">
                      <span>Match Intelligence Breakdown</span>
                      <span>{breakdown.total}/100 PTS</span>
                    </div>

                    <div className="space-y-2 mb-3">
                      <div>
                        <div className="flex justify-between text-zinc-300 text-[11px] mb-0.5">
                          <span>Genre Alignment</span>
                          <span className="font-mono-code text-white">{breakdown.genreAffinity} / 35</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#CCFF00]"
                            style={{ width: `${(breakdown.genreAffinity / 35) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-300 text-[11px] mb-0.5">
                          <span>Director & Cast Affinity</span>
                          <span className="font-mono-code text-white">{breakdown.crewAffinity} / 20</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#FF007F]"
                            style={{ width: `${(breakdown.crewAffinity / 20) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-300 text-[11px] mb-0.5">
                          <span>Vibe & Atmosphere</span>
                          <span className="font-mono-code text-white">{breakdown.vibeAffinity} / 20</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#00F0FF]"
                            style={{ width: `${(breakdown.vibeAffinity / 20) * 100}%` }}
                          />
                        </div>
                      </div>

                      <div>
                        <div className="flex justify-between text-zinc-300 text-[11px] mb-0.5">
                          <span>Runtime Fit</span>
                          <span className="font-mono-code text-white">{breakdown.runtimeFit} / 10</span>
                        </div>
                        <div className="h-1.5 w-full bg-zinc-800 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-amber-400"
                            style={{ width: `${(breakdown.runtimeFit / 10) * 100}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {breakdown.matchedReasons.length > 0 && (
                      <div className="border-t border-white/10 pt-2 space-y-1">
                        {breakdown.matchedReasons.map((reason, idx) => (
                          <div key={idx} className="flex items-center gap-1.5 text-zinc-300">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00]" />
                            {reason}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Title & Meta Row */}
              <div>
                <h1 className="text-4xl sm:text-6xl md:text-7xl font-display uppercase tracking-tight text-white leading-none drop-shadow-md">
                  {heroMovie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm font-mono-code text-zinc-300 mt-2">
                  <span className="text-white font-bold">{heroMovie.year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-zinc-400" />
                    {heroMovie.runtime} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {heroMovie.rating.toFixed(1)} TMDB
                  </span>
                  <span>•</span>
                  <span className="text-[#00F0FF]">
                    {heroMovie.genres.slice(0, 3).join(', ')}
                  </span>
                  {heroMovie.directors.length > 0 && (
                    <>
                      <span>•</span>
                      <span className="text-zinc-400">Dir: {heroMovie.directors.join(', ')}</span>
                    </>
                  )}
                </div>
              </div>

              {/* "Why This For You" AI Rationale Callout */}
              <div className="p-3.5 rounded-xl bg-[#0B0D14]/80 border-l-2 border-[#CCFF00] backdrop-blur-md text-sm text-zinc-200">
                <span className="font-mono-code uppercase text-[#CCFF00] font-bold mr-2 text-xs">
                  Why tonight:
                </span>
                {heroMovie.aiExplanation ||
                  `Calibrated for your appetite for ${heroMovie.genres.slice(0, 2).join(' and ')} with high-stakes tension and uncompromising craftsmanship.`}
              </div>

              {/* Action Buttons Row */}
              <div className="flex flex-wrap items-center gap-3 pt-2">
                {/* Watch Now (Primary Action) */}
                <button
                  onClick={handleWatchNow}
                  className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-[#CCFF00] via-[#c2f300] to-[#b3e600] text-black font-syne font-extrabold text-sm uppercase tracking-wider shadow-[0_0_30px_rgba(204,255,0,0.4)] hover:shadow-[0_0_40px_rgba(204,255,0,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2 cursor-pointer clip-blade-sm"
                >
                  <Play className="w-4 h-4 fill-black stroke-black" />
                  Watch on {heroMovie.serverType.toUpperCase()}
                </button>

                {/* Trailer Preview Button */}
                {heroMovie.trailerUrl && (
                  <button
                    onClick={() => {
                      soundEffects.whoosh(soundEnabled);
                      setShowTrailer(!showTrailer);
                    }}
                    className="px-4 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium text-xs uppercase tracking-wider backdrop-blur-md border border-white/15 transition-all flex items-center gap-1.5"
                  >
                    <Tv className="w-3.5 h-3.5 text-[#00F0FF]" />
                    {showTrailer ? 'Back to Poster' : 'Trailer Preview'}
                  </button>
                )}

                {/* Save Watchlist */}
                <button
                  onClick={handleSave}
                  className={`px-4 py-3 rounded-xl border font-medium text-xs uppercase tracking-wider backdrop-blur-md transition-all flex items-center gap-1.5 ${
                    heroMovie.status === 'saved'
                      ? 'bg-[#FF007F]/20 border-[#FF007F] text-[#FF007F]'
                      : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Bookmark
                    className={`w-3.5 h-3.5 ${
                      heroMovie.status === 'saved' ? 'fill-[#FF007F]' : ''
                    }`}
                  />
                  {heroMovie.status === 'saved' ? 'Saved' : 'Save'}
                </button>

                {/* Already Seen */}
                <button
                  onClick={handleMarkSeen}
                  className="px-4 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white font-medium text-xs uppercase tracking-wider backdrop-blur-md border border-white/15 transition-all flex items-center gap-1.5"
                >
                  <Check className="w-3.5 h-3.5 text-[#CCFF00]" />
                  Already Seen
                </button>

                {/* Not Interested */}
                <button
                  onClick={handleNotInterested}
                  className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 font-medium text-xs backdrop-blur-md border border-white/15 transition-all flex items-center gap-1"
                  title="Don't suggest this again"
                >
                  <EyeOff className="w-3.5 h-3.5" />
                </button>

                {/* Full Details Modal Opener */}
                <button
                  onClick={() => onSelectMovie(heroMovie)}
                  className="px-3.5 py-3 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white font-medium text-xs backdrop-blur-md border border-white/15 transition-all"
                >
                  Full Specs
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Alternates Card Rail (Horizontal Stack) */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <h2 className="text-xl font-display uppercase tracking-wider text-white">
              Tonight's Alternates
            </h2>
            <span className="text-xs font-mono-code text-[#CCFF00] bg-[#CCFF00]/10 px-2 py-0.5 rounded-full border border-[#CCFF00]/20">
              {candidateMovies.length - 1} AVAILABLE
            </span>
          </div>
          <div className="text-xs font-mono-code text-zinc-500 hidden sm:block">
            Keyboard: J/K to browse • Enter to stream • S to save
          </div>
        </div>

        {/* Scrollable Horizontal Rail */}
        <div className="flex gap-4 overflow-x-auto pb-4 pt-1 snap-x no-scrollbar">
          {candidateMovies.map((movie, idx) => {
            const isCurrent = idx === currentIndex;
            return (
              <div
                key={movie.id}
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setCurrentIndex(idx);
                  setShowTrailer(false);
                }}
                className={`flex-shrink-0 w-48 sm:w-56 rounded-2xl overflow-hidden glass-panel border transition-all duration-300 cursor-pointer snap-start relative group ${
                  isCurrent
                    ? 'border-[#CCFF00] shadow-[0_0_25px_rgba(204,255,0,0.3)] scale-[1.03]'
                    : 'border-white/10 hover:border-white/30 hover:scale-[1.01]'
                }`}
              >
                {/* Poster Image */}
                <div className="relative aspect-[2/3] w-full overflow-hidden bg-[#0B0D14]">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    loading="lazy"
                  />
                  {/* Match percentage pill */}
                  <div className="absolute top-2.5 right-2.5 px-2 py-0.5 rounded-md text-[11px] font-mono-code font-bold bg-[#07070A]/90 text-[#CCFF00] border border-[#CCFF00]/40 backdrop-blur-md">
                    {movie.matchScore}%
                  </div>

                  {/* Server pill */}
                  <div className="absolute bottom-2.5 left-2.5 px-2 py-0.5 rounded text-[10px] font-mono-code uppercase bg-black/80 text-zinc-300 border border-white/10 backdrop-blur-md">
                    {movie.serverType}
                  </div>
                </div>

                {/* Details Footer */}
                <div className="p-3 bg-[#0B0D14]">
                  <h4 className="text-sm font-semibold text-white truncate">{movie.title}</h4>
                  <div className="flex items-center justify-between text-xs font-mono-code text-zinc-400 mt-1">
                    <span>{movie.year}</span>
                    <span className="text-[#CCFF00]">{movie.runtime}m</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
