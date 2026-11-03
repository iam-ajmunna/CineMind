import React, { useState } from 'react';
import { MovieItem, WatchStatus } from '../types';
import {
  X,
  Play,
  Star,
  Clock,
  Server,
  Bookmark,
  Check,
  EyeOff,
  ExternalLink,
  Sparkles,
  Share2,
  Tv
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface MovieDetailModalProps {
  movie: MovieItem | null;
  onClose: () => void;
  onUpdateStatus: (movieId: string, status: WatchStatus) => void;
  onUpdateRating: (movieId: string, rating: number) => void;
  soundEnabled?: boolean;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  onUpdateStatus,
  onUpdateRating,
  soundEnabled = false,
}) => {
  const [showTrailer, setShowTrailer] = useState(false);
  const [userRating, setUserRating] = useState<number>(movie?.userRating || 0);

  if (!movie) return null;

  const handleRatingChange = (score: number) => {
    soundEffects.cinematicHit(soundEnabled);
    setUserRating(score);
    onUpdateRating(movie.id, score);
  };

  const breakdown = movie.matchBreakdown;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl glass-panel rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] flex flex-col blade-edge">
        {/* Top Blade Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent z-20" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            onClose();
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-[#CCFF00] hover:text-black text-white border border-white/15 backdrop-blur-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1">
          {/* Hero Backdrop / Trailer Frame */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-black">
            {showTrailer && movie.trailerUrl ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${
                  movie.trailerUrl.split('v=')[1]?.split('&')[0] || 'dQw4w9WgXcQ'
                }?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                className="w-full h-full border-none"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : (
              <>
                <img
                  src={movie.backdropUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover filter brightness-60 contrast-125"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#0B0D14] via-transparent to-black/30" />

                {/* Play Trailer Floating Button */}
                {movie.trailerUrl && (
                  <button
                    onClick={() => {
                      soundEffects.whoosh(soundEnabled);
                      setShowTrailer(true);
                    }}
                    className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-[#CCFF00]/90 text-black flex items-center justify-center shadow-[0_0_30px_rgba(204,255,0,0.5)] hover:scale-110 transition-all cursor-pointer group"
                  >
                    <Play className="w-6 h-6 fill-black ml-1 group-hover:scale-110 transition-transform" />
                  </button>
                )}
              </>
            )}

            {/* Server Badge Overlay */}
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              <span className="px-3 py-1 rounded-full text-xs font-mono-code uppercase bg-[#07070A]/90 text-[#CCFF00] border border-[#CCFF00]/40 flex items-center gap-1.5 backdrop-blur-md">
                <Server className="w-3.5 h-3.5" />
                {movie.serverName}
              </span>
              {movie.quality && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono-code uppercase bg-white/10 text-white backdrop-blur-md">
                  {movie.quality}
                </span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6 bg-[#0B0D14]">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-wider text-white">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-sm font-mono-code text-zinc-400 mt-2">
                  <span className="text-white font-bold">{movie.year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {movie.runtime} min
                  </span>
                  <span>•</span>
                  <span className="flex items-center gap-1 text-amber-400 font-bold">
                    <Star className="w-3.5 h-3.5 fill-amber-400" />
                    {movie.rating.toFixed(1)} TMDB
                  </span>
                  <span>•</span>
                  <span className="text-[#00F0FF]">{movie.genres.join(', ')}</span>
                </div>
              </div>

              {/* Match Score Display */}
              <div className="p-3 rounded-2xl bg-[#141721] border border-[#CCFF00]/40 text-center flex-shrink-0">
                <div className="text-3xl font-display text-[#CCFF00] leading-none">
                  {movie.matchScore}%
                </div>
                <div className="text-[10px] font-mono-code text-zinc-400 uppercase tracking-wider mt-1">
                  Taste Match
                </div>
              </div>
            </div>

            {/* Synopsis Overview */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono-code uppercase text-[#CCFF00] tracking-wider">
                Synopsis
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            </div>

            {/* Match Breakdown Grid if available */}
            {breakdown && (
              <div className="p-4 rounded-2xl bg-[#07070A] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono-code text-[#CCFF00] uppercase font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why CINEMIND Matched This Film For You
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Genre Affinity</div>
                    <div className="text-[#CCFF00] font-mono-code font-bold text-sm">
                      {breakdown.genreAffinity} / 35 PTS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Crew & Cast</div>
                    <div className="text-[#FF007F] font-mono-code font-bold text-sm">
                      {breakdown.crewAffinity} / 20 PTS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Atmosphere / Vibe</div>
                    <div className="text-[#00F0FF] font-mono-code font-bold text-sm">
                      {breakdown.vibeAffinity} / 20 PTS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Runtime Pacing</div>
                    <div className="text-amber-400 font-mono-code font-bold text-sm">
                      {breakdown.runtimeFit} / 10 PTS
                    </div>
                  </div>
                </div>

                {breakdown.matchedReasons.length > 0 && (
                  <div className="pt-2 border-t border-white/5 flex flex-wrap gap-2">
                    {breakdown.matchedReasons.map((r, i) => (
                      <span
                        key={i}
                        className="text-xs px-2.5 py-1 rounded-md bg-white/5 text-zinc-300 border border-white/5"
                      >
                        ✓ {r}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Cast & Crew Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono-code">
              {movie.directors.length > 0 && (
                <div>
                  <span className="text-zinc-500 uppercase block mb-1">Director</span>
                  <span className="text-white font-medium text-sm">
                    {movie.directors.join(', ')}
                  </span>
                </div>
              )}
              {movie.cast.length > 0 && (
                <div>
                  <span className="text-zinc-500 uppercase block mb-1">Starring</span>
                  <span className="text-white font-medium text-sm">
                    {movie.cast.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Quick 1 - 10 Score Rating Bar */}
            <div className="p-4 rounded-2xl bg-[#07070A] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono-code uppercase text-zinc-400">
                  Your Personal Rating (1–10)
                </span>
                <span className="text-xs font-mono-code text-[#CCFF00] font-bold">
                  {userRating > 0 ? `${userRating} / 10 Stars` : 'Unrated'}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono-code transition-all ${
                      userRating >= star
                        ? 'bg-[#CCFF00] text-black font-bold shadow-[0_0_8px_rgba(204,255,0,0.4)]'
                        : 'bg-white/5 text-zinc-500 hover:bg-white/15 hover:text-white'
                    }`}
                  >
                    {star}
                  </button>
                ))}
              </div>
            </div>

            {/* Primary Action Buttons */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={() => {
                  soundEffects.bladeSlash(soundEnabled);
                  if (movie.itemUrl) window.open(movie.itemUrl, '_blank');
                }}
                className="px-6 py-3 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-syne font-extrabold text-sm uppercase rounded-xl flex items-center gap-2 clip-blade-sm cursor-pointer shadow-[0_0_20px_rgba(204,255,0,0.3)]"
              >
                <Play className="w-4 h-4 fill-black" />
                Stream on {movie.serverType.toUpperCase()}
              </button>

              <button
                onClick={() => {
                  soundEffects.cinematicHit(soundEnabled);
                  onUpdateStatus(movie.id, movie.status === 'saved' ? 'unseen' : 'saved');
                }}
                className={`px-4 py-3 rounded-xl border text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  movie.status === 'saved'
                    ? 'bg-[#FF007F]/20 border-[#FF007F] text-[#FF007F]'
                    : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {movie.status === 'saved' ? 'Saved in Watchlist' : 'Save to Watchlist'}
              </button>

              <button
                onClick={() => {
                  soundEffects.cinematicHit(soundEnabled);
                  onUpdateStatus(movie.id, movie.status === 'seen' ? 'unseen' : 'seen');
                }}
                className={`px-4 py-3 rounded-xl border text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all ${
                  movie.status === 'seen'
                    ? 'bg-[#CCFF00]/20 border-[#CCFF00] text-[#CCFF00]'
                    : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white'
                }`}
              >
                <Check className="w-3.5 h-3.5" />
                {movie.status === 'seen' ? 'Marked Watched' : 'Mark Watched'}
              </button>

              <button
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  onUpdateStatus(movie.id, 'not_interested');
                  onClose();
                }}
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/15 text-xs font-medium uppercase transition-all flex items-center gap-1.5 ml-auto"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Not Interested
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
