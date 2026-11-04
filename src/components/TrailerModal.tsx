import React from 'react';
import { MovieItem } from '../types';
import { X, ExternalLink } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface TrailerModalProps {
  movie: MovieItem | null;
  onClose: () => void;
  soundEnabled: boolean;
}

export const TrailerModal: React.FC<TrailerModalProps> = ({
  movie,
  onClose,
  soundEnabled,
}) => {
  if (!movie) return null;

  const videoId =
    movie.youtubeTrailerId ||
    movie.trailerUrl?.split('v=')[1]?.split('&')[0] ||
    'NgBoMJy386M';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/95 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-5xl aspect-video bg-black rounded-3xl overflow-hidden border border-white/20 shadow-[0_0_100px_rgba(229,9,20,0.4)] flex flex-col">
        {/* Top Header Bar */}
        <div className="absolute top-4 left-6 right-6 z-30 flex items-center justify-between pointer-events-none">
          <div className="bg-black/70 px-4 py-1.5 rounded-full border border-white/10 backdrop-blur-md pointer-events-auto">
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              {movie.title} • Official Trailer
            </span>
          </div>

          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onClose();
            }}
            className="p-2.5 rounded-full bg-black/70 hover:bg-[#E50914] text-white border border-white/20 backdrop-blur-md pointer-events-auto cursor-pointer transition-all"
            aria-label="Close Trailer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Iframe Player */}
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1`}
          title={`${movie.title} Trailer`}
          className="w-full h-full border-none"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
        />
      </div>
    </div>
  );
};
