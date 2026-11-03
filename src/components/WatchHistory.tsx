import React from 'react';
import { MovieItem, WatchStatus } from '../types';
import { Star, Check, Clock, Film, Award, Trash2 } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface WatchHistoryProps {
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onUpdateRating: (movieId: string, rating: number) => void;
  onUpdateStatus: (movieId: string, status: WatchStatus) => void;
  soundEnabled?: boolean;
}

export const WatchHistory: React.FC<WatchHistoryProps> = ({
  movies,
  onSelectMovie,
  onUpdateRating,
  onUpdateStatus,
  soundEnabled = false,
}) => {
  const seenMovies = movies.filter((m) => m.status === 'seen' || (m.userRating && m.userRating > 0));

  const totalRuntimeMinutes = seenMovies.reduce((acc, m) => acc + (m.runtime || 0), 0);
  const totalHours = Math.round(totalRuntimeMinutes / 60);

  // Calculate top genre
  const genreCounts: Record<string, number> = {};
  seenMovies.forEach((m) => {
    (m.genres || []).forEach((g) => {
      genreCounts[g] = (genreCounts[g] || 0) + 1;
    });
  });
  const topGenre = Object.entries(genreCounts).sort((a, b) => b[1] - a[1])[0]?.[0] || 'Sci-Fi';

  // Calculate average user rating
  const ratedMovies = seenMovies.filter((m) => m.userRating && m.userRating > 0);
  const avgRating = ratedMovies.length > 0
    ? (ratedMovies.reduce((acc, m) => acc + (m.userRating || 0), 0) / ratedMovies.length).toFixed(1)
    : '8.5';

  return (
    <div className="space-y-6">
      {/* Header and Stat Cards */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden blade-edge">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#CCFF00] uppercase tracking-wider mb-1">
              <Check className="w-3.5 h-3.5" />
              Verified Watch Log
            </div>
            <h2 className="text-3xl font-display uppercase tracking-wider text-white">
              Watch History & Ratings ({seenMovies.length} Logged)
            </h2>
          </div>
        </div>

        {/* Cinematic Metric Counters */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono-code text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
              <Film className="w-3.5 h-3.5 text-[#CCFF00]" /> Screened
            </div>
            <div className="text-2xl font-display text-white">{seenMovies.length} Films</div>
          </div>

          <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono-code text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
              <Clock className="w-3.5 h-3.5 text-[#00F0FF]" /> Cinema Hours
            </div>
            <div className="text-2xl font-display text-white">{totalHours} Hours</div>
          </div>

          <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono-code text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
              <Star className="w-3.5 h-3.5 text-amber-400" /> Avg Score
            </div>
            <div className="text-2xl font-display text-amber-400">{avgRating} / 10</div>
          </div>

          <div className="bg-[#0B0D14] p-4 rounded-xl border border-white/5">
            <div className="text-[11px] font-mono-code text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
              <Award className="w-3.5 h-3.5 text-[#FF007F]" /> Top Affinity
            </div>
            <div className="text-2xl font-display text-[#FF007F] truncate">{topGenre}</div>
          </div>
        </div>
      </div>

      {/* History Grid */}
      {seenMovies.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-white/10">
          <Film className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
          <h3 className="text-lg font-display uppercase text-white">History Empty</h3>
          <p className="text-xs text-zinc-400 mt-1">
            As you mark films as "Already Seen" or rate them, they will appear in your timeline.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {seenMovies.map((movie) => (
            <div
              key={movie.id}
              onClick={() => {
                soundEffects.click(soundEnabled);
                onSelectMovie(movie);
              }}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#CCFF00]/50 transition-all cursor-pointer group flex gap-4 clip-blade-sm"
            >
              {/* Poster */}
              <img
                src={movie.posterUrl}
                alt={movie.title}
                className="w-20 aspect-[2/3] object-cover rounded-xl flex-shrink-0"
              />

              {/* Meta & User Rating */}
              <div className="flex-1 min-w-0 flex flex-col justify-between py-1">
                <div>
                  <h4 className="text-base font-semibold text-white group-hover:text-[#CCFF00] truncate">
                    {movie.title}
                  </h4>
                  <div className="text-xs font-mono-code text-zinc-400 mt-0.5">
                    {movie.year} • {movie.runtime}m
                  </div>
                  <div className="text-[11px] font-mono-code text-zinc-500 mt-1">
                    {movie.genres.slice(0, 2).join(' / ')}
                  </div>
                </div>

                {/* Rating Bar */}
                <div className="mt-3 pt-2 border-t border-white/5">
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="text-[10px] font-mono-code uppercase text-zinc-500">
                      Your Rating:
                    </span>
                    <span className="font-mono-code text-[#CCFF00] font-bold">
                      {movie.userRating ? `${movie.userRating}★` : 'Click to rate'}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
                      <button
                        key={star}
                        onClick={(e) => {
                          e.stopPropagation();
                          onUpdateRating(movie.id, star);
                        }}
                        className={`flex-1 py-1 rounded text-[10px] font-mono-code transition-all ${
                          (movie.userRating || 0) >= star
                            ? 'bg-[#CCFF00] text-black font-bold'
                            : 'bg-white/5 text-zinc-500 hover:bg-white/20'
                        }`}
                      >
                        {star}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
