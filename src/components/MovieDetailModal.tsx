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
  Tv,
  ThumbsUp,
  ThumbsDown,
  Film
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface MovieDetailModalProps {
  movie: MovieItem | null;
  onClose: () => void;
  onUpdateStatus: (movieId: string, status: WatchStatus) => void;
  onUpdateRating: (movieId: string, rating: number) => void;
  onSelectSimilar?: (movie: MovieItem) => void;
  allMovies?: MovieItem[];
  soundEnabled?: boolean;
}

export const MovieDetailModal: React.FC<MovieDetailModalProps> = ({
  movie,
  onClose,
  onUpdateStatus,
  onUpdateRating,
  onSelectSimilar,
  allMovies = [],
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

  // Find similar movies by genre or director
  const similarMovies = allMovies
    .filter(m => m.id !== movie.id && (
      (m.genres && movie.genres && m.genres.some(g => movie.genres.includes(g))) ||
      (m.industry && movie.industry && m.industry === movie.industry)
    ))
    .slice(0, 6);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-6 bg-black/90 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl bg-[#14141B] rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden max-h-[92vh] flex flex-col">
        {/* Top Crimson Edge Accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E50914] to-transparent z-20" />

        {/* Close Button */}
        <button
          onClick={() => {
            soundEffects.click(soundEnabled);
            onClose();
          }}
          aria-label="Close modal"
          className="absolute top-4 right-4 z-30 p-2.5 rounded-full bg-black/70 hover:bg-[#E50914] hover:text-white text-zinc-300 border border-white/15 backdrop-blur-md transition-all cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Scrollable Content Body */}
        <div className="overflow-y-auto flex-1 scrollbar-none">
          {/* Hero Backdrop / Trailer Frame */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full overflow-hidden bg-black">
            {showTrailer ? (
              <iframe
                src={`https://www.youtube-nocookie.com/embed/${
                  movie.youtubeTrailerId ||
                  movie.trailerUrl?.split('v=')[1]?.split('&')[0] ||
                  'NgBoMJy386M'
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
                  className="w-full h-full object-cover filter brightness-75 contrast-110"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-black/30" />

                {/* Play Trailer Floating Button */}
                <button
                  onClick={() => {
                    soundEffects.bladeSlash(soundEnabled);
                    setShowTrailer(true);
                  }}
                  className="absolute inset-0 m-auto w-16 h-16 rounded-full bg-white/90 hover:bg-white text-black flex items-center justify-center shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:scale-110 transition-all cursor-pointer group"
                  title="Play Trailer"
                >
                  <Play className="w-6 h-6 fill-black ml-1 group-hover:scale-110 transition-transform" />
                </button>
              </>
            )}

            {/* Server Badge Overlay */}
            <div className="absolute bottom-4 left-6 flex items-center gap-2">
              {movie.serverType && movie.serverType !== 'none' ? (
                <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-emerald-950/90 text-emerald-300 border border-emerald-500/40 flex items-center gap-1.5 backdrop-blur-md">
                  <Server className="w-3.5 h-3.5" />
                  Available on {movie.serverName}
                </span>
              ) : (
                <span className="px-3 py-1 rounded-full text-xs font-mono uppercase bg-black/80 text-zinc-400 border border-white/20 backdrop-blur-md">
                  Worldwide Catalog
                </span>
              )}
              {movie.quality && (
                <span className="px-2.5 py-1 rounded-md text-[11px] font-mono uppercase bg-white/10 text-white backdrop-blur-md">
                  {movie.quality}
                </span>
              )}
            </div>
          </div>

          {/* Details Section */}
          <div className="p-6 sm:p-8 space-y-6 bg-[#14141B]">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <h1 className="text-3xl sm:text-5xl font-display uppercase tracking-tight text-white font-black">
                  {movie.title}
                </h1>
                <div className="flex flex-wrap items-center gap-3 text-xs sm:text-sm font-mono text-zinc-400 mt-2">
                  <span className="text-white font-bold">{movie.year}</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {movie.runtime} min
                  </span>
                  <span>•</span>
                  <span className="border border-white/30 px-1 rounded text-[10px] text-zinc-300">
                    {movie.ageRating || 'U/A 16+'}
                  </span>
                  <span>•</span>
                  <span className="text-[#FF2E56] font-semibold">{movie.genres.join(', ')}</span>
                </div>
              </div>

              {/* Match Score Display */}
              <div className="p-3.5 rounded-2xl bg-[#0B0B0F] border border-[#E50914]/40 text-center flex-shrink-0 shadow-lg">
                <div className="text-3xl font-display text-[#46D369] font-black leading-none">
                  {movie.matchScore}%
                </div>
                <div className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider mt-1">
                  Taste Match
                </div>
              </div>
            </div>

            {/* Ratings Trio (IMDb, Rotten Tomatoes, TMDB) */}
            <div className="grid grid-cols-3 gap-3 p-3.5 rounded-2xl bg-[#0B0B0F] border border-white/10 text-center">
              <div>
                <div className="text-xs text-zinc-400 font-mono">IMDb Rating</div>
                <div className="text-base sm:text-lg font-bold text-amber-400 mt-0.5">
                  ★ {movie.imdbRating || movie.rating.toFixed(1)} / 10
                </div>
              </div>
              <div className="border-x border-white/10">
                <div className="text-xs text-zinc-400 font-mono">Rotten Tomatoes</div>
                <div className="text-base sm:text-lg font-bold text-[#E50914] mt-0.5">
                  {movie.rtScore || 88}% Fresh
                </div>
              </div>
              <div>
                <div className="text-xs text-zinc-400 font-mono">Community Score</div>
                <div className="text-base sm:text-lg font-bold text-white mt-0.5">
                  {movie.rating.toFixed(1)} TMDB
                </div>
              </div>
            </div>

            {/* Synopsis Overview */}
            <div className="space-y-2">
              <h3 className="text-xs font-mono uppercase text-[#FF2E56] tracking-wider font-bold">
                Synopsis
              </h3>
              <p className="text-sm text-zinc-300 leading-relaxed max-w-3xl">
                {movie.overview}
              </p>
            </div>

            {/* Where to Watch / Streaming Providers */}
            <div className="space-y-2.5">
              <h3 className="text-xs font-mono uppercase text-zinc-400 tracking-wider flex items-center gap-1.5">
                <Tv className="w-3.5 h-3.5 text-[#00F0FF]" />
                <span>Streaming In Your Region</span>
              </h3>
              <div className="flex flex-wrap items-center gap-2">
                {(movie.streamingProviders || ['Netflix', 'Prime Video', 'Disney+ Hotstar']).map((provider) => (
                  <span
                    key={provider}
                    className="px-3 py-1.5 rounded-xl bg-white/5 border border-white/10 text-xs font-semibold text-white flex items-center gap-1.5"
                  >
                    <span className="w-2 h-2 rounded-full bg-[#E50914]" />
                    {provider}
                  </span>
                ))}
              </div>
            </div>

            {/* Match Breakdown Grid */}
            {breakdown && (
              <div className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-3">
                <div className="flex items-center gap-2 text-xs font-mono text-[#E50914] uppercase font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Why CINEMIND Matched This Film For You
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Genre Affinity</div>
                    <div className="text-[#46D369] font-mono font-bold text-sm">
                      {breakdown.genreAffinity} / 35 PTS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Crew & Cast</div>
                    <div className="text-[#FF007F] font-mono font-bold text-sm">
                      {breakdown.crewAffinity} / 20 PTS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Atmosphere / Vibe</div>
                    <div className="text-[#00F0FF] font-mono font-bold text-sm">
                      {breakdown.vibeAffinity} / 20 PTS
                    </div>
                  </div>
                  <div className="p-2.5 rounded-xl bg-white/5">
                    <div className="text-zinc-400 text-[11px] mb-1">Runtime Pacing</div>
                    <div className="text-amber-400 font-mono font-bold text-sm">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              {movie.directors && movie.directors.length > 0 && (
                <div>
                  <span className="text-zinc-500 uppercase block mb-1">Director</span>
                  <span className="text-white font-medium text-sm">
                    {movie.directors.join(', ')}
                  </span>
                </div>
              )}
              {movie.cast && movie.cast.length > 0 && (
                <div>
                  <span className="text-zinc-500 uppercase block mb-1">Starring</span>
                  <span className="text-white font-medium text-sm">
                    {movie.cast.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Personal Rating Bar (1 - 10) */}
            <div className="p-4 rounded-2xl bg-[#0B0B0F] border border-white/10 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono uppercase text-zinc-400">
                  Your Rating & Scoring
                </span>
                <span className="text-xs font-mono text-[#E50914] font-bold">
                  {userRating > 0 ? `${userRating} / 10 Stars` : 'Unrated'}
                </span>
              </div>
              <div className="flex items-center gap-1 sm:gap-2">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleRatingChange(star)}
                    className={`flex-1 py-1.5 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      userRating >= star
                        ? 'bg-[#E50914] text-white font-bold'
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
              {movie.itemUrl && (
                <button
                  onClick={() => {
                    soundEffects.bladeSlash(soundEnabled);
                    window.open(movie.itemUrl, '_blank');
                  }}
                  className="px-6 py-3 bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-sm uppercase rounded-xl flex items-center gap-2 cursor-pointer shadow-[0_0_20px_rgba(229,9,20,0.4)]"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Stream on {movie.serverType.toUpperCase()}
                </button>
              )}

              <button
                onClick={() => {
                  soundEffects.cinematicHit(soundEnabled);
                  onUpdateStatus(movie.id, movie.status === 'saved' ? 'unseen' : 'saved');
                }}
                className={`px-4 py-3 rounded-xl border text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  movie.status === 'saved'
                    ? 'bg-[#E50914]/20 border-[#E50914] text-[#E50914]'
                    : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white'
                }`}
              >
                <Bookmark className="w-3.5 h-3.5" />
                {movie.status === 'saved' ? 'In My List' : 'Add to My List'}
              </button>

              <button
                onClick={() => {
                  soundEffects.cinematicHit(soundEnabled);
                  onUpdateStatus(movie.id, movie.status === 'seen' ? 'unseen' : 'seen');
                }}
                className={`px-4 py-3 rounded-xl border text-xs font-medium uppercase tracking-wider flex items-center gap-1.5 transition-all cursor-pointer ${
                  movie.status === 'seen'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-400'
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
                className="px-4 py-3 rounded-xl bg-white/5 hover:bg-red-500/20 text-zinc-400 hover:text-red-400 border border-white/15 text-xs font-medium uppercase transition-all flex items-center gap-1.5 ml-auto cursor-pointer"
              >
                <EyeOff className="w-3.5 h-3.5" />
                Not Interested
              </button>
            </div>

            {/* More Like This (Similar Movies) */}
            {similarMovies.length > 0 && (
              <div className="pt-6 border-t border-white/10 space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  More Like This
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3">
                  {similarMovies.map((sim) => (
                    <div
                      key={sim.id}
                      onClick={() => onSelectSimilar && onSelectSimilar(sim)}
                      className="bg-[#0B0B0F] rounded-xl overflow-hidden border border-white/10 hover:border-[#E50914] transition-all cursor-pointer group shadow"
                    >
                      <div className="aspect-[2/3] w-full relative overflow-hidden">
                        <img
                          src={sim.posterUrl}
                          alt={sim.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <div className="absolute top-1.5 right-1.5 bg-black/80 px-1 py-0.2 rounded text-[9px] font-mono text-[#46D369] font-bold">
                          {sim.matchScore}%
                        </div>
                      </div>
                      <div className="p-2">
                        <div className="text-[11px] font-bold text-white truncate">{sim.title}</div>
                        <div className="text-[9px] text-zinc-400 font-mono">{sim.year}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
