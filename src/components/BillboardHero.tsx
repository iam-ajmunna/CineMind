import React, { useState } from 'react';
import { MovieItem } from '../types';
import { Play, Plus, Check, Info, Volume2, VolumeX, Shuffle, Sparkles, Server } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface BillboardHeroProps {
  movie: MovieItem;
  onPlayTrailer: (movie: MovieItem) => void;
  onMoreInfo: (movie: MovieItem) => void;
  onToggleSave: (movieId: string) => void;
  isSaved: boolean;
  onShuffleHero?: () => void;
  soundEnabled: boolean;
}

export const BillboardHero: React.FC<BillboardHeroProps> = ({
  movie,
  onPlayTrailer,
  onMoreInfo,
  onToggleSave,
  isSaved,
  onShuffleHero,
  soundEnabled,
}) => {
  const [isMuted, setIsMuted] = useState(true);

  if (!movie) return null;

  return (
    <div className="relative w-full h-[80vh] min-h-[550px] max-h-[820px] overflow-hidden select-none">
      {/* Background Media with Cinema Vignette */}
      <div className="absolute inset-0">
        <img
          src={movie.backdropUrl || movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover object-center transform scale-105 transition-transform duration-1000 ease-out"
        />
        {/* Cinematic Multi-layered Netflix-style Gradient Fades */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#0B0B0F] via-[#0B0B0F]/70 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-t from-[#0B0B0F] via-[#0B0B0F]/30 to-transparent" />
        <div className="absolute inset-0 bg-radial-at-c from-transparent via-[#0B0B0F]/40 to-[#0B0B0F]" />
      </div>

      {/* Hero Content Container */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 h-full flex flex-col justify-end pb-20 sm:pb-28">
        <div className="max-w-2xl space-y-4">
          {/* Top Tagline / Category / Industry Badge */}
          <div className="flex items-center gap-2.5 text-xs">
            {movie.isIndianAction && (
              <span className="px-2.5 py-0.5 rounded bg-gradient-to-r from-[#E50914] to-[#FF1352] text-white font-bold tracking-wider uppercase text-[10px] shadow-[0_0_15px_rgba(229,9,20,0.6)]">
                ★ FEATURED INDIAN ACTION
              </span>
            )}
            <span className="font-mono font-bold text-[#46D369] text-xs">
              {movie.matchScore}% Match
            </span>
            <span className="text-zinc-400 font-mono text-xs">{movie.year}</span>
            <span className="border border-white/30 px-1.5 py-0.2 rounded text-[10px] text-zinc-300 font-medium">
              {movie.ageRating || 'U/A 16+'}
            </span>
            <span className="text-zinc-400 text-xs">{Math.floor(movie.runtime / 60)}h {movie.runtime % 60}m</span>
            {movie.quality && (
              <span className="border border-white/20 px-1.5 py-0.2 rounded text-[10px] text-zinc-400 font-mono">
                {movie.quality.includes('4K') ? '4K Ultra HD' : 'HD'}
              </span>
            )}
          </div>

          {/* Giant Title */}
          <h1 className="font-display font-black text-4xl sm:text-6xl md:text-7xl text-white tracking-tight uppercase leading-[0.95] drop-shadow-[0_4px_30px_rgba(0,0,0,0.9)]">
            {movie.title}
          </h1>

          {/* Synopsis */}
          <p className="text-sm sm:text-base text-zinc-300 line-clamp-3 sm:line-clamp-4 leading-relaxed font-normal max-w-xl drop-shadow">
            {movie.overview}
          </p>

          {/* Genres & Match Reason */}
          <div className="flex flex-wrap items-center gap-2 text-xs text-zinc-400 pt-1">
            {movie.genres.map((g, idx) => (
              <React.Fragment key={g}>
                <span className="text-zinc-300 font-medium">{g}</span>
                {idx < movie.genres.length - 1 && <span className="text-zinc-600">•</span>}
              </React.Fragment>
            ))}
            {movie.directors && movie.directors[0] && (
              <>
                <span className="text-zinc-600">|</span>
                <span className="text-zinc-400">Dir. {movie.directors[0]}</span>
              </>
            )}
          </div>

          {/* Action Buttons Row */}
          <div className="flex flex-wrap items-center gap-3 pt-3">
            {/* Play Trailer Button */}
            <button
              onClick={() => {
                soundEffects.bladeSlash(soundEnabled);
                onPlayTrailer(movie);
              }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl bg-white hover:bg-zinc-200 text-black font-bold text-sm tracking-wide transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)] hover:scale-105 cursor-pointer"
            >
              <Play className="w-5 h-5 fill-black" />
              <span>Play Trailer</span>
            </button>

            {/* More Info Button */}
            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onMoreInfo(movie);
              }}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-zinc-600/60 hover:bg-zinc-600/80 text-white font-semibold text-sm backdrop-blur-md transition-all cursor-pointer"
            >
              <Info className="w-5 h-5" />
              <span>More Info</span>
            </button>

            {/* Toggle My List Button */}
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                onToggleSave(movie.id);
              }}
              className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/20 text-white transition-all cursor-pointer"
              title={isSaved ? 'In My List' : 'Add to My List'}
            >
              {isSaved ? <Check className="w-5 h-5 text-[#46D369]" /> : <Plus className="w-5 h-5" />}
            </button>

            {/* Shuffle Hero Recommendation */}
            {onShuffleHero && (
              <button
                onClick={() => {
                  soundEffects.whoosh(soundEnabled);
                  onShuffleHero();
                }}
                className="p-3 rounded-xl bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/20 text-zinc-300 hover:text-white transition-all cursor-pointer hidden sm:flex"
                title="Shuffle Hero Pick"
              >
                <Shuffle className="w-5 h-5" />
              </button>
            )}

            {/* Server Badge if Available */}
            {movie.serverType && movie.serverType !== 'none' && (
              <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950/60 border border-emerald-500/40 text-emerald-400 text-xs font-mono">
                <Server className="w-3.5 h-3.5" />
                <span>On {movie.serverName.split(' ')[0]}</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
