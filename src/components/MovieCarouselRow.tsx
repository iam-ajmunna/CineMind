import React, { useRef, useState } from 'react';
import { MovieItem } from '../types';
import {
  ChevronLeft,
  ChevronRight,
  Play,
  Plus,
  Check,
  ThumbsUp,
  Info,
  Server,
  Bell,
  Clock
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface MovieCarouselRowProps {
  title: string;
  subtitle?: string;
  movies: MovieItem[];
  isTop10?: boolean;
  onSelectMovie: (movie: MovieItem) => void;
  onPlayTrailer: (movie: MovieItem) => void;
  onToggleSave: (movieId: string) => void;
  onMarkWatched: (movieId: string) => void;
  onLikeMovie: (movieId: string) => void;
  onToggleReminder?: (movieId: string) => void;
  savedIds: Set<string>;
  watchedIds: Set<string>;
  likedIds?: Set<string>;
  remindedIds?: Set<string>;
  soundEnabled: boolean;
}

export const MovieCarouselRow: React.FC<MovieCarouselRowProps> = ({
  title,
  subtitle,
  movies,
  isTop10 = false,
  onSelectMovie,
  onPlayTrailer,
  onToggleSave,
  onMarkWatched,
  onLikeMovie,
  onToggleReminder,
  savedIds,
  watchedIds,
  likedIds = new Set(),
  remindedIds = new Set(),
  soundEnabled,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);
  const [hoveredMovieId, setHoveredMovieId] = useState<string | null>(null);

  const scroll = (direction: 'left' | 'right') => {
    soundEffects.whoosh(soundEnabled);
    if (!rowRef.current) return;
    const clientWidth = rowRef.current.clientWidth;
    const scrollAmount = direction === 'left' ? -clientWidth * 0.75 : clientWidth * 0.75;
    rowRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
  };

  if (!movies || movies.length === 0) return null;

  return (
    <div className="relative py-4 sm:py-6 group/row select-none">
      {/* Row Header */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-3 flex items-baseline justify-between">
        <div className="flex items-baseline gap-3">
          <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-white tracking-wide flex items-center gap-2">
            <span>{title}</span>
          </h2>
          {subtitle && (
            <span className="text-xs text-zinc-400 font-mono hidden sm:inline">
              {subtitle}
            </span>
          )}
        </div>
        <span className="text-xs font-semibold text-[#FF2E56] hover:text-white cursor-pointer transition-colors hidden sm:block">
          Explore All &gt;
        </span>
      </div>

      {/* Carousel Container */}
      <div className="relative">
        {/* Left Scroll Button */}
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer rounded-r-xl"
          aria-label="Scroll Left"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>

        {/* Scrollable Track */}
        <div
          ref={rowRef}
          className="flex items-center gap-2.5 sm:gap-3.5 overflow-x-auto scrollbar-none px-4 sm:px-6 scroll-smooth pb-4 pt-1"
          style={{ scrollSnapType: 'x mandatory' }}
        >
          {movies.map((movie, index) => {
            const isSaved = savedIds.has(movie.id);
            const isWatched = watchedIds.has(movie.id);
            const isLiked = likedIds.has(movie.id);
            const isReminded = remindedIds.has(movie.id) || !!movie.reminded;
            const rank = index + 1;

            return (
              <div
                key={movie.id}
                style={{ scrollSnapAlign: 'start' }}
                className={`relative flex-shrink-0 transition-transform duration-300 ${
                  isTop10 ? 'w-44 sm:w-56 flex items-end' : 'w-36 sm:w-48'
                }`}
                onMouseEnter={() => setHoveredMovieId(movie.id)}
                onMouseLeave={() => setHoveredMovieId(null)}
              >
                {/* Netflix Top 10 Giant Styled Rank Numbers */}
                {isTop10 && (
                  <div className="relative -mr-5 z-10 pointer-events-none select-none">
                    <span className="font-display font-black text-7xl sm:text-9xl text-transparent bg-clip-text bg-gradient-to-b from-white via-zinc-400 to-[#14141B] stroke-black drop-shadow-[0_10px_20px_rgba(0,0,0,0.9)]">
                      {rank}
                    </span>
                  </div>
                )}

                {/* Movie Poster Card */}
                <div
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onSelectMovie(movie);
                  }}
                  className="relative w-full aspect-[2/3] rounded-xl overflow-hidden bg-[#181822] border border-white/10 hover:border-[#E50914] shadow-lg cursor-pointer group/card transition-all"
                >
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges (Server / Upcoming) */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between pointer-events-none">
                    {movie.isIndianAction ? (
                      <span className="px-1.5 py-0.5 rounded bg-[#E50914] text-white text-[9px] font-bold tracking-wider uppercase shadow">
                        ACTION
                      </span>
                    ) : (
                      <span />
                    )}

                    {movie.serverType && movie.serverType !== 'none' && (
                      <span className="flex items-center gap-1 px-1.5 py-0.5 rounded bg-emerald-950/80 border border-emerald-400/40 text-emerald-300 text-[9px] font-mono shadow">
                        <Server className="w-2.5 h-2.5" />
                        <span>{movie.serverName.split(' ')[0]}</span>
                      </span>
                    )}
                  </div>

                  {/* Upcoming Release Countdown Badge */}
                  {movie.isUpcoming && (
                    <div className="absolute bottom-2 left-2 right-2 bg-black/85 backdrop-blur-md border border-amber-500/40 rounded-lg p-1.5 text-center">
                      <div className="text-[10px] text-amber-400 font-bold flex items-center justify-center gap-1">
                        <Clock className="w-3 h-3" />
                        <span>Releasing in {movie.countdownDays || 14} days</span>
                      </div>
                    </div>
                  )}

                  {/* Hover Quick Actions Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/40 to-transparent opacity-0 group-hover/card:opacity-100 transition-opacity p-3 flex flex-col justify-end">
                    <div className="text-xs font-bold text-white truncate drop-shadow mb-1">
                      {movie.title}
                    </div>

                    <div className="flex items-center gap-2 text-[10px] mb-2 font-mono">
                      <span className="text-[#46D369] font-bold">{movie.matchScore}% Match</span>
                      <span className="text-zinc-400">{movie.year}</span>
                    </div>

                    {/* Quick Button Cluster */}
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-1">
                        {/* Play Trailer */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.bladeSlash(soundEnabled);
                            onPlayTrailer(movie);
                          }}
                          className="w-7 h-7 rounded-full bg-white hover:bg-zinc-200 text-black flex items-center justify-center transition-transform hover:scale-110 shadow"
                          title="Play Trailer"
                        >
                          <Play className="w-3.5 h-3.5 fill-black ml-0.5" />
                        </button>

                        {/* Add to My List */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.click(soundEnabled);
                            onToggleSave(movie.id);
                          }}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                            isSaved
                              ? 'bg-[#E50914] border-[#E50914] text-white'
                              : 'bg-black/50 border-white/40 text-white hover:border-white'
                          }`}
                          title={isSaved ? 'In My List' : 'Add to My List'}
                        >
                          {isSaved ? <Check className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                        </button>

                        {/* Mark Watched */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.click(soundEnabled);
                            onMarkWatched(movie.id);
                          }}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                            isWatched
                              ? 'bg-emerald-600 border-emerald-500 text-white'
                              : 'bg-black/50 border-white/40 text-zinc-300 hover:text-white'
                          }`}
                          title={isWatched ? 'Watched' : 'Mark as Watched'}
                        >
                          <Check className="w-3 h-3" />
                        </button>

                        {/* Thumbs Up / Like */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            soundEffects.click(soundEnabled);
                            onLikeMovie(movie.id);
                          }}
                          className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                            isLiked
                              ? 'bg-cyan-600 border-cyan-500 text-white'
                              : 'bg-black/50 border-white/40 text-zinc-300 hover:text-white'
                          }`}
                          title="Thumbs Up (Refines Taste)"
                        >
                          <ThumbsUp className="w-3 h-3" />
                        </button>

                        {/* Remind Me (for upcoming) */}
                        {movie.isUpcoming && onToggleReminder && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              soundEffects.click(soundEnabled);
                              onToggleReminder(movie.id);
                            }}
                            className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all ${
                              isReminded
                                ? 'bg-amber-500 border-amber-400 text-black'
                                : 'bg-black/50 border-white/40 text-amber-300'
                            }`}
                            title={isReminded ? 'Reminder Set' : 'Remind Me'}
                          >
                            <Bell className="w-3 h-3" />
                          </button>
                        )}
                      </div>

                      {/* Detail Chevron */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.whoosh(soundEnabled);
                          onSelectMovie(movie);
                        }}
                        className="w-7 h-7 rounded-full bg-black/50 border border-white/40 text-white flex items-center justify-center hover:border-white"
                        title="More Info"
                      >
                        <Info className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-0 bottom-0 z-30 w-10 sm:w-12 bg-black/60 hover:bg-black/90 text-white flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity backdrop-blur-sm cursor-pointer rounded-l-xl"
          aria-label="Scroll Right"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>
    </div>
  );
};
