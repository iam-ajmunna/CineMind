import React, { useState, useMemo } from 'react';
import { MovieItem } from '../types';
import { Calendar, Bell, Play, Check, Clock, Sparkles, Filter, Clapperboard, Server } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface UpcomingViewProps {
  movies: MovieItem[];
  onSelectMovie: (movie: MovieItem) => void;
  onPlayTrailer: (movie: MovieItem) => void;
  onToggleSave: (movieId: string) => void;
  onToggleReminder: (movieId: string) => void;
  remindedIds: Set<string>;
  savedIds: Set<string>;
  soundEnabled: boolean;
  mode?: 'upcoming' | 'new_and_hot';
}

export const UpcomingView: React.FC<UpcomingViewProps> = ({
  movies,
  onSelectMovie,
  onPlayTrailer,
  onToggleSave,
  onToggleReminder,
  remindedIds,
  savedIds,
  soundEnabled,
  mode = 'upcoming',
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');

  const filteredMovies = useMemo(() => {
    let list = mode === 'upcoming'
      ? movies.filter(m => m.isUpcoming || (m.year && m.year >= 2024 && m.status === 'unseen'))
      : movies.filter(m => m.year >= 2023);

    if (selectedIndustry !== 'all') {
      list = list.filter(m => m.industry === selectedIndustry);
    }
    return list;
  }, [movies, mode, selectedIndustry]);

  return (
    <div className="min-h-screen pb-24 pt-20 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
      {/* View Header */}
      <div className="py-8 border-b border-white/10 mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2">
            {mode === 'upcoming' ? <Calendar className="w-4 h-4" /> : <Sparkles className="w-4 h-4 text-cyan-400" />}
            <span>{mode === 'upcoming' ? 'Release Radar & Countdown' : 'Trending Now & Fresh Additions'}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-display font-black text-white tracking-tight uppercase">
            {mode === 'upcoming' ? 'Upcoming Movies For You' : 'New & Hot in Cinema'}
          </h1>
          <p className="text-sm text-zinc-400 mt-1 max-w-xl">
            {mode === 'upcoming'
              ? 'Movies releasing soon matching your taste profile. Set notifications to get alerted the instant they arrive.'
              : 'The freshest box-office dominators, critically acclaimed discoveries, and high-match additions.'}
          </p>
        </div>

        {/* Industry Filter Pills */}
        <div className="flex flex-wrap items-center gap-1.5 bg-[#14141B] p-1.5 rounded-2xl border border-white/10">
          {[
            { id: 'all', label: 'All Industries' },
            { id: 'tollywood', label: 'Tollywood' },
            { id: 'bollywood', label: 'Bollywood' },
            { id: 'kollywood', label: 'Kollywood' },
            { id: 'sandalwood', label: 'Sandalwood' },
            { id: 'hollywood', label: 'Hollywood' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => {
                soundEffects.click(soundEnabled);
                setSelectedIndustry(item.id);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-all cursor-pointer ${
                selectedIndustry === item.id
                  ? 'bg-[#E50914] text-white font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Grid of Upcoming / Hot Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredMovies.map((movie) => {
          const isReminded = remindedIds.has(movie.id) || !!movie.reminded;
          const isSaved = savedIds.has(movie.id);

          return (
            <div
              key={movie.id}
              className="bg-[#14141B] rounded-2xl border border-white/10 overflow-hidden hover:border-[#E50914] transition-all flex flex-col justify-between group shadow-xl"
            >
              {/* Card Banner / Backdrop */}
              <div
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  onSelectMovie(movie);
                }}
                className="relative aspect-video w-full overflow-hidden cursor-pointer"
              >
                <img
                  src={movie.backdropUrl || movie.posterUrl}
                  alt={movie.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#14141B] via-transparent to-transparent" />

                {/* Release Countdown Chip */}
                {movie.isUpcoming && (
                  <div className="absolute top-3 left-3 bg-[#E50914] text-white text-[11px] font-mono font-bold px-2.5 py-1 rounded-lg flex items-center gap-1.5 shadow-lg">
                    <Clock className="w-3.5 h-3.5" />
                    <span>In {movie.countdownDays || 14} days</span>
                  </div>
                )}

                {/* Match Score Badge */}
                <div className="absolute top-3 right-3 bg-black/75 backdrop-blur-md text-[#46D369] text-xs font-mono font-bold px-2.5 py-1 rounded-lg border border-white/10">
                  {movie.matchScore}% Match
                </div>
              </div>

              {/* Card Body */}
              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-xs text-zinc-400 mb-1">
                    <span className="uppercase text-amber-400 font-bold tracking-wider text-[10px]">
                      {movie.industry || 'Cinema'}
                    </span>
                    <span>•</span>
                    <span>{movie.year}</span>
                    <span>•</span>
                    <span>{movie.genres.slice(0, 2).join(' / ')}</span>
                  </div>

                  <h3
                    onClick={() => {
                      soundEffects.click(soundEnabled);
                      onSelectMovie(movie);
                    }}
                    className="text-lg font-bold text-white hover:text-[#E50914] transition-colors cursor-pointer line-clamp-1 mb-2"
                  >
                    {movie.title}
                  </h3>

                  <p className="text-xs text-zinc-400 line-clamp-2 leading-relaxed mb-4">
                    {movie.overview}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="flex items-center justify-between pt-3 border-t border-white/10">
                  <button
                    onClick={() => {
                      soundEffects.bladeSlash(soundEnabled);
                      onPlayTrailer(movie);
                    }}
                    className="flex items-center gap-1.5 text-xs font-bold text-white hover:text-[#E50914] transition-colors cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-white" />
                    <span>Trailer</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {/* Remind Me Button */}
                    <button
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        onToggleReminder(movie.id);
                      }}
                      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
                        isReminded
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300'
                          : 'bg-white/5 border-white/15 text-zinc-300 hover:text-white'
                      }`}
                    >
                      <Bell className="w-3.5 h-3.5" />
                      <span>{isReminded ? 'Reminded' : 'Remind Me'}</span>
                    </button>

                    {/* My List */}
                    <button
                      onClick={() => {
                        soundEffects.click(soundEnabled);
                        onToggleSave(movie.id);
                      }}
                      className={`p-2 rounded-xl border transition-all cursor-pointer ${
                        isSaved
                          ? 'bg-[#E50914] border-[#E50914] text-white'
                          : 'bg-white/5 border-white/15 text-zinc-400 hover:text-white'
                      }`}
                      title="Add to My List"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
