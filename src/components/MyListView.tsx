import React, { useState } from 'react';
import { MovieItem } from '../types';
import { Bookmark, CheckCircle, Bell, Play, Star, Trash2 } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface MyListViewProps {
  movies: MovieItem[];
  savedIds: Set<string>;
  watchedIds: Set<string>;
  remindedIds: Set<string>;
  onSelectMovie: (movie: MovieItem) => void;
  onPlayTrailer: (movie: MovieItem) => void;
  onToggleSave: (movieId: string) => void;
  onMarkWatched: (movieId: string) => void;
  soundEnabled: boolean;
}

export const MyListView: React.FC<MyListViewProps> = ({
  movies,
  savedIds,
  watchedIds,
  remindedIds,
  onSelectMovie,
  onPlayTrailer,
  onToggleSave,
  onMarkWatched,
  soundEnabled,
}) => {
  const [subSection, setSubSection] = useState<'saved' | 'watched' | 'reminders'>('saved');

  const savedMovies = movies.filter(m => savedIds.has(m.id) || m.status === 'saved');
  const watchedMovies = movies.filter(m => watchedIds.has(m.id) || m.status === 'seen');
  const remindedMovies = movies.filter(m => remindedIds.has(m.id) || !!m.reminded);

  return (
    <div className="min-h-screen pb-24 pt-20 max-w-7xl mx-auto px-4 sm:px-6 animate-in fade-in duration-300">
      {/* Page Header */}
      <div className="py-6 border-b border-white/10 mb-8">
        <h1 className="text-3xl sm:text-4xl font-display font-black text-white uppercase tracking-tight mb-2">
          My Cinema Space
        </h1>
        <p className="text-xs sm:text-sm text-zinc-400 mb-6">
          Your saved watchlist, watched history with scoring, and release reminders.
        </p>

        {/* Sub-Tabs */}
        <div className="flex items-center gap-2 bg-[#14141B] p-1.5 rounded-2xl border border-white/10 w-fit">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setSubSection('saved');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subSection === 'saved'
                ? 'bg-[#E50914] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bookmark className="w-3.5 h-3.5" />
            <span>Saved Watchlist ({savedMovies.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setSubSection('watched');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subSection === 'watched'
                ? 'bg-[#E50914] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
            <span>Already Watched ({watchedMovies.length})</span>
          </button>

          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setSubSection('reminders');
            }}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              subSection === 'reminders'
                ? 'bg-[#E50914] text-white shadow'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Bell className="w-3.5 h-3.5 text-amber-400" />
            <span>Reminders ({remindedMovies.length})</span>
          </button>
        </div>
      </div>

      {/* Section Content */}
      {subSection === 'saved' && (
        <div>
          {savedMovies.length === 0 ? (
            <div className="bg-[#14141B] rounded-2xl border border-white/10 p-12 text-center text-zinc-400">
              <Bookmark className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white mb-1">Your Watchlist is Empty</div>
              <p className="text-xs text-zinc-500">
                Click the "+" icon on any movie card or billboard to save titles to watch later.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {savedMovies.map((m) => (
                <div
                  key={m.id}
                  onClick={() => onSelectMovie(m)}
                  className="bg-[#14141B] rounded-xl overflow-hidden border border-white/10 hover:border-[#E50914] transition-all cursor-pointer group shadow-lg flex flex-col justify-between"
                >
                  <div className="aspect-[2/3] w-full relative overflow-hidden bg-zinc-900">
                    <img
                      src={m.posterUrl}
                      alt={m.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute top-2 right-2 bg-black/80 px-1.5 py-0.5 rounded text-[10px] font-mono text-[#46D369] font-bold">
                      {m.matchScore}%
                    </div>
                  </div>
                  <div className="p-3">
                    <div className="text-xs font-bold text-white truncate mb-1">{m.title}</div>
                    <div className="flex items-center justify-between text-[10px] text-zinc-400 font-mono">
                      <span>{m.year}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          soundEffects.click(soundEnabled);
                          onToggleSave(m.id);
                        }}
                        className="text-zinc-500 hover:text-red-400"
                        title="Remove from list"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {subSection === 'watched' && (
        <div>
          {watchedMovies.length === 0 ? (
            <div className="bg-[#14141B] rounded-2xl border border-white/10 p-12 text-center text-zinc-400">
              <CheckCircle className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white mb-1">No Watched Movies Recorded</div>
              <p className="text-xs text-zinc-500">
                Mark movies as watched to train CINEMIND's recommendation engine.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {watchedMovies.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#14141B] rounded-2xl border border-white/10 p-4 flex gap-4 hover:border-white/20 transition-all"
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-20 h-28 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                    onClick={() => onSelectMovie(m)}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="text-[10px] font-mono text-emerald-400 font-bold">WATCHED</span>
                        <span className="font-mono text-zinc-500 text-[10px]">{m.year}</span>
                      </div>
                      <h4
                        onClick={() => onSelectMovie(m)}
                        className="text-sm font-bold text-white hover:text-[#E50914] cursor-pointer line-clamp-1 mb-1"
                      >
                        {m.title}
                      </h4>
                      {m.userNotes && (
                        <p className="text-[11px] text-zinc-400 italic line-clamp-2">
                          "{m.userNotes}"
                        </p>
                      )}
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5">
                      <div className="flex items-center gap-1 text-amber-400 text-xs font-bold">
                        <Star className="w-3.5 h-3.5 fill-amber-400" />
                        <span>{m.userRating || 9}/10 Score</span>
                      </div>
                      <button
                        onClick={() => {
                          soundEffects.bladeSlash(soundEnabled);
                          onPlayTrailer(m);
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

      {subSection === 'reminders' && (
        <div>
          {remindedMovies.length === 0 ? (
            <div className="bg-[#14141B] rounded-2xl border border-white/10 p-12 text-center text-zinc-400">
              <Bell className="w-12 h-12 text-zinc-600 mx-auto mb-3" />
              <div className="text-sm font-semibold text-white mb-1">No Upcoming Reminders Set</div>
              <p className="text-xs text-zinc-500">
                Browse the Upcoming section and click "Remind Me" to track release dates.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {remindedMovies.map((m) => (
                <div
                  key={m.id}
                  className="bg-[#14141B] rounded-2xl border border-amber-500/30 p-4 flex gap-4 shadow-lg"
                >
                  <img
                    src={m.posterUrl}
                    alt={m.title}
                    className="w-20 h-28 object-cover rounded-xl flex-shrink-0 cursor-pointer"
                    onClick={() => onSelectMovie(m)}
                  />
                  <div className="flex-1 flex flex-col justify-between">
                    <div>
                      <div className="text-[10px] font-mono text-amber-400 font-bold mb-1 flex items-center gap-1">
                        <Bell className="w-3 h-3" />
                        <span>RELEASING IN {m.countdownDays || 14} DAYS</span>
                      </div>
                      <h4
                        onClick={() => onSelectMovie(m)}
                        className="text-sm font-bold text-white hover:text-[#E50914] cursor-pointer line-clamp-1 mb-1"
                      >
                        {m.title}
                      </h4>
                      <p className="text-[11px] text-zinc-400 line-clamp-2">
                        {m.overview}
                      </p>
                    </div>
                    <div className="flex items-center justify-between pt-2 border-t border-white/5 text-xs">
                      <span className="text-zinc-400 font-mono text-[10px]">{m.industry?.toUpperCase()}</span>
                      <button
                        onClick={() => {
                          soundEffects.bladeSlash(soundEnabled);
                          onPlayTrailer(m);
                        }}
                        className="text-[11px] font-semibold text-amber-400 hover:text-white flex items-center gap-1 cursor-pointer"
                      >
                        <Play className="w-3 h-3" />
                        <span>Watch Teaser</span>
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
