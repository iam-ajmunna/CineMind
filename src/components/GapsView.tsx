import React from 'react';
import { MovieItem } from '../types';
import { Sparkles, Download, Plus, Star, Clock, AlertCircle, ExternalLink, Film } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface GapsViewProps {
  gaps: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onAddToLibrary: (movie: MovieItem) => void;
  onDismissGap: (movieId: string) => void;
  soundEnabled?: boolean;
}

export const GapsView: React.FC<GapsViewProps> = ({
  gaps,
  onSelectMovie,
  onAddToLibrary,
  onDismissGap,
  soundEnabled = false,
}) => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="glass-panel p-6 rounded-2xl border border-white/10 relative overflow-hidden blade-edge">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono-code text-[#FF007F] uppercase tracking-wider mb-1">
              <AlertCircle className="w-3.5 h-3.5" />
              Intelligence Discovery Radar
            </div>
            <h2 className="text-3xl font-display uppercase tracking-wider text-white">
              Library Gaps ({gaps.length} Missing Masterpieces)
            </h2>
            <p className="text-sm text-zinc-400 mt-1 max-w-2xl">
              These films score extraordinarily high against your taste profile, but are missing from your connected Plex, Jellyfin, and Emby media servers.
            </p>
          </div>
          <div className="px-4 py-2 bg-[#FF007F]/10 border border-[#FF007F]/30 rounded-xl text-xs font-mono-code text-[#FF007F]">
            Automatic Radarr & Wishlist Sync
          </div>
        </div>
      </div>

      {/* Gaps List / Grid */}
      {gaps.length === 0 ? (
        <div className="p-16 text-center glass-panel rounded-2xl border border-white/10">
          <Film className="w-12 h-12 text-[#CCFF00] mx-auto mb-3 opacity-50" />
          <h3 className="text-lg font-display uppercase text-white">Zero Gaps Detected</h3>
          <p className="text-xs text-zinc-400 mt-1">Your personal media server collection is currently in full synchronization with your taste.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {gaps.map((movie) => (
            <div
              key={movie.id}
              onClick={() => {
                soundEffects.click(soundEnabled);
                onSelectMovie(movie);
              }}
              className="glass-panel p-4 rounded-2xl border border-white/10 hover:border-[#FF007F]/60 transition-all cursor-pointer group flex gap-4 items-start relative overflow-hidden clip-blade-sm"
            >
              {/* Poster */}
              <div className="w-24 sm:w-28 aspect-[2/3] rounded-xl overflow-hidden flex-shrink-0 bg-[#07070A] relative">
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  loading="lazy"
                />
                <div className="absolute top-1.5 right-1.5 px-1.5 py-0.5 rounded text-[10px] font-mono-code font-bold bg-[#07070A]/90 text-[#FF007F] border border-[#FF007F]/30">
                  {movie.matchScore}%
                </div>
              </div>

              {/* Meta & Actions */}
              <div className="flex-1 min-w-0 flex flex-col justify-between h-full py-0.5">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-mono-code uppercase px-2 py-0.5 rounded bg-red-950/60 text-red-400 border border-red-900/50">
                      Missing from servers
                    </span>
                    <span className="text-xs font-mono-code text-zinc-400">{movie.year}</span>
                  </div>

                  <h3 className="text-lg font-display uppercase tracking-wide text-white group-hover:text-[#FF007F] transition-colors truncate">
                    {movie.title}
                  </h3>

                  <div className="flex items-center gap-2 text-xs font-mono-code text-zinc-400 mt-1">
                    <span className="flex items-center gap-1 text-amber-400">
                      <Star className="w-3 h-3 fill-amber-400" />
                      {movie.rating}
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {movie.runtime}m
                    </span>
                    <span>•</span>
                    <span className="text-zinc-300 truncate">{movie.genres.slice(0, 2).join(', ')}</span>
                  </div>

                  <p className="text-xs text-zinc-400 line-clamp-2 mt-2 leading-relaxed">
                    {movie.overview}
                  </p>
                </div>

                {/* Bottom Action Bar */}
                <div className="flex items-center gap-2 mt-3 pt-2 border-t border-white/5">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEffects.cinematicHit(soundEnabled);
                      onAddToLibrary(movie);
                    }}
                    className="px-3 py-1.5 bg-[#CCFF00] hover:bg-[#b5e000] text-black font-semibold text-xs rounded-lg flex items-center gap-1"
                  >
                    <Plus className="w-3 h-3 stroke-[3]" />
                    Add to My Library
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEffects.click(soundEnabled);
                      window.open(`https://www.themoviedb.org/search?query=${encodeURIComponent(movie.title)}`, '_blank');
                    }}
                    className="p-1.5 bg-white/5 hover:bg-white/10 text-zinc-300 rounded-lg text-xs"
                    title="View on TMDB"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                  </button>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      soundEffects.click(soundEnabled);
                      onDismissGap(movie.id);
                    }}
                    className="text-[11px] text-zinc-500 hover:text-zinc-300 ml-auto px-2 py-1"
                  >
                    Dismiss
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
