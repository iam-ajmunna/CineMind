import React, { useState, useMemo } from 'react';
import { MovieItem, IndustryType } from '../types';
import { MovieCarouselRow } from './MovieCarouselRow';
import { Flame, Star, Sparkles, Filter, Swords, Clapperboard, Award } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface IndianCinemaHubProps {
  movies: MovieItem[];
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

export const IndianCinemaHub: React.FC<IndianCinemaHubProps> = ({
  movies,
  onSelectMovie,
  onPlayTrailer,
  onToggleSave,
  onMarkWatched,
  onLikeMovie,
  onToggleReminder,
  savedIds,
  watchedIds,
  likedIds,
  remindedIds,
  soundEnabled,
}) => {
  const [selectedIndustry, setSelectedIndustry] = useState<string>('all');
  const [actionOnly, setActionOnly] = useState(false);

  // Filter movies for Indian Cinema
  const indianMovies = useMemo(() => {
    return movies.filter(m => {
      const isInd = m.isIndianAction || ['tollywood', 'bollywood', 'kollywood', 'sandalwood', 'mollywood', 'bengali', 'punjabi'].includes(m.industry || '');
      if (!isInd) return false;
      if (selectedIndustry !== 'all' && m.industry !== selectedIndustry) return false;
      if (actionOnly && !m.isIndianAction) return false;
      return true;
    });
  }, [movies, selectedIndustry, actionOnly]);

  // Sub-categories
  const indianActionBlockbusters = useMemo(() => {
    return indianMovies.filter(m => m.isIndianAction);
  }, [indianMovies]);

  const tollywoodMovies = useMemo(() => {
    return indianMovies.filter(m => m.industry === 'tollywood');
  }, [indianMovies]);

  const kollywoodMovies = useMemo(() => {
    return indianMovies.filter(m => m.industry === 'kollywood');
  }, [indianMovies]);

  const bollywoodMovies = useMemo(() => {
    return indianMovies.filter(m => m.industry === 'bollywood');
  }, [indianMovies]);

  const sandalwoodMovies = useMemo(() => {
    return indianMovies.filter(m => m.industry === 'sandalwood');
  }, [indianMovies]);

  const mollywoodMovies = useMemo(() => {
    return indianMovies.filter(m => m.industry === 'mollywood');
  }, [indianMovies]);

  const upcomingIndian = useMemo(() => {
    return indianMovies.filter(m => m.isUpcoming);
  }, [indianMovies]);

  const starSpotlight = useMemo(() => {
    // Movies starring Prabhas, Jr NTR, Shah Rukh Khan, Kamal Haasan, Yash
    return indianMovies.filter(m => (m.cast || []).some(actor => ['Prabhas', 'Jr NTR', 'Shah Rukh Khan', 'Kamal Haasan', 'Yash', 'Allu Arjun'].includes(actor)));
  }, [indianMovies]);

  const industries = [
    { id: 'all', label: 'All Indian Cinema' },
    { id: 'tollywood', label: 'Tollywood (Telugu Mass)' },
    { id: 'kollywood', label: 'Kollywood (Tamil LCU)' },
    { id: 'bollywood', label: 'Bollywood (Hindi Action)' },
    { id: 'sandalwood', label: 'Sandalwood (Kannada)' },
    { id: 'mollywood', label: 'Mollywood (Malayalam)' },
  ];

  return (
    <div className="min-h-screen pb-24 pt-20 animate-in fade-in duration-300">
      {/* Indian Cinema Hub Hero Banner */}
      <div className="relative w-full py-12 sm:py-16 px-4 sm:px-6 mb-4 overflow-hidden bg-gradient-to-r from-[#140507] via-[#1E080C] to-[#0B0B0F] border-b border-[#E50914]/20">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#E50914]/10 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-6 relative z-10">
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF2E56] uppercase tracking-wider mb-2">
              <Flame className="w-4 h-4 fill-[#E50914] text-[#E50914]" />
              <span>Cinematic Universe & Mass Spectacles</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-display font-black text-white tracking-tight uppercase">
              Indian Cinema <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] to-[#FF1352]">Action Hub</span>
            </h1>
            <p className="text-sm text-zinc-400 max-w-xl mt-2 leading-relaxed">
              From Tollywood mass blockbusters and Kollywood cinematic universes to high-octane Bollywood thrillers and Sandalwood underworld epics.
            </p>
          </div>

          {/* Quick Metrics / Badges */}
          <div className="flex items-center gap-4 bg-black/40 border border-white/10 rounded-2xl p-4 backdrop-blur-md">
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl font-display font-bold text-[#FF2E56]">{indianMovies.length}</div>
              <div className="text-[10px] text-zinc-400 font-mono">Curated Titles</div>
            </div>
            <div className="text-center px-3 border-r border-white/10">
              <div className="text-xl font-display font-bold text-amber-400">{upcomingIndian.length}</div>
              <div className="text-[10px] text-zinc-400 font-mono">Upcoming</div>
            </div>
            <div className="text-center px-3">
              <div className="text-xl font-display font-bold text-emerald-400">98%</div>
              <div className="text-[10px] text-zinc-400 font-mono">Top Match</div>
            </div>
          </div>
        </div>
      </div>

      {/* Filter / Industry Selector Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 mb-6">
        <div className="flex flex-wrap items-center justify-between gap-3 bg-[#14141B]/80 p-2 sm:p-2.5 rounded-2xl border border-white/10">
          <div className="flex flex-wrap items-center gap-1.5 overflow-x-auto">
            {industries.map((ind) => (
              <button
                key={ind.id}
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  setSelectedIndustry(ind.id);
                }}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                  selectedIndustry === ind.id
                    ? 'bg-[#E50914] text-white shadow-[0_0_15px_rgba(229,9,20,0.4)]'
                    : 'text-zinc-400 hover:text-white hover:bg-white/5'
                }`}
              >
                {ind.label}
              </button>
            ))}
          </div>

          {/* Action Only Toggle */}
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActionOnly(!actionOnly);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold border transition-all cursor-pointer ${
              actionOnly
                ? 'bg-[#FF1352]/20 border-[#FF1352] text-[#FF1352]'
                : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
            }`}
          >
            <Swords className="w-3.5 h-3.5" />
            <span>Mass Action Only</span>
          </button>
        </div>
      </div>

      {/* Featured 1: Indian Action Spectacles (Top Priority as requested) */}
      <MovieCarouselRow
        title="Featured: Indian Action Spectacles & Megahits"
        subtitle="Mass hero elevation, high-octane set-pieces, and box-office monsters"
        movies={indianActionBlockbusters}
        onSelectMovie={onSelectMovie}
        onPlayTrailer={onPlayTrailer}
        onToggleSave={onToggleSave}
        onMarkWatched={onMarkWatched}
        onLikeMovie={onLikeMovie}
        onToggleReminder={onToggleReminder}
        savedIds={savedIds}
        watchedIds={watchedIds}
        likedIds={likedIds}
        remindedIds={remindedIds}
        soundEnabled={soundEnabled}
      />

      {/* Featured 2: Tollywood Mass Action & Pan-India Epics */}
      {tollywoodMovies.length > 0 && (
        <MovieCarouselRow
          title="Tollywood: Telugu Mass Action & Mythology Epics"
          subtitle="RRR, Baahubali, Kalki 2898 AD, Salaar, Devara"
          movies={tollywoodMovies}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Featured 3: Kollywood High-Octane Action & LCU */}
      {kollywoodMovies.length > 0 && (
        <MovieCarouselRow
          title="Kollywood: Tamil Action & LCU Universe"
          subtitle="Vikram, Leo, Kaithi, Jailer"
          movies={kollywoodMovies}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Featured 4: Bollywood Adrenaline, Martial Arts & Spies */}
      {bollywoodMovies.length > 0 && (
        <MovieCarouselRow
          title="Bollywood: High-Stakes Action & Spy Universe"
          subtitle="Jawan, Kill (2024), Pathaan, War"
          movies={bollywoodMovies}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Featured 5: Sandalwood Underworld Wars & Divine Folklore */}
      {sandalwoodMovies.length > 0 && (
        <MovieCarouselRow
          title="Sandalwood: Underworld Wars & Divine Folklore"
          subtitle="K.G.F: Chapter 1 & 2, Kantara"
          movies={sandalwoodMovies}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Featured 6: Mollywood Action & Crime Masterpieces */}
      {mollywoodMovies.length > 0 && (
        <MovieCarouselRow
          title="Mollywood: Malayalam Crime & Action Phenomena"
          subtitle="Aavesham, Lucifer, RDX"
          movies={mollywoodMovies}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Featured 7: Pan-India Star Spotlight */}
      {starSpotlight.length > 0 && (
        <MovieCarouselRow
          title="Pan-India Star Spotlight"
          subtitle="Prabhas, Jr NTR, Shah Rukh Khan, Kamal Haasan, Yash, Allu Arjun"
          movies={starSpotlight}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}

      {/* Featured 8: Upcoming Indian Cinema Radar */}
      {upcomingIndian.length > 0 && (
        <MovieCarouselRow
          title="Upcoming Indian Action Radar (Release Countdown)"
          subtitle="Pushpa 2: The Rule, Kantara: Chapter 1, Salaar 2"
          movies={upcomingIndian}
          onSelectMovie={onSelectMovie}
          onPlayTrailer={onPlayTrailer}
          onToggleSave={onToggleSave}
          onMarkWatched={onMarkWatched}
          onLikeMovie={onLikeMovie}
          onToggleReminder={onToggleReminder}
          savedIds={savedIds}
          watchedIds={watchedIds}
          likedIds={likedIds}
          remindedIds={remindedIds}
          soundEnabled={soundEnabled}
        />
      )}
    </div>
  );
};
