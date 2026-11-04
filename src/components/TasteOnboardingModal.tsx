import React, { useState } from 'react';
import { TasteProfile } from '../types';
import { Sparkles, Check, Flame, ChevronRight, X } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface TasteOnboardingModalProps {
  isOpen: boolean;
  onClose: () => void;
  taste: TasteProfile;
  onSaveTaste: (taste: TasteProfile) => void;
  soundEnabled: boolean;
}

export const TasteOnboardingModal: React.FC<TasteOnboardingModalProps> = ({
  isOpen,
  onClose,
  taste,
  onSaveTaste,
  soundEnabled,
}) => {
  const [step, setStep] = useState<number>(1);
  const [selectedIndustries, setSelectedIndustries] = useState<string[]>(
    taste.preferredIndustries || ['tollywood', 'bollywood', 'kollywood', 'sandalwood', 'hollywood']
  );
  const [selectedGenres, setSelectedGenres] = useState<string[]>(
    Object.keys(taste.genres || {})
  );
  const [prioritizeIndianAction, setPrioritizeIndianAction] = useState<boolean>(
    taste.prioritizeIndianAction !== false
  );

  if (!isOpen) return null;

  const industriesList = [
    { id: 'tollywood', name: 'Tollywood (Telugu Mass & Epics)' },
    { id: 'bollywood', name: 'Bollywood (Hindi Action & Thrillers)' },
    { id: 'kollywood', name: 'Kollywood (Tamil LCU & Action)' },
    { id: 'sandalwood', name: 'Sandalwood (Kannada Epics & Folklore)' },
    { id: 'mollywood', name: 'Mollywood (Malayalam Crime & Drama)' },
    { id: 'hollywood', name: 'Hollywood (Blockbusters & Sci-Fi)' },
    { id: 'korean', name: 'Korean (K-Thrillers & Action)' },
    { id: 'bengali', name: 'Bengali Cinema' },
    { id: 'punjabi', name: 'Punjabi Cinema' },
    { id: 'japanese', name: 'Japanese Cinema & Anime' },
  ];

  const genresList = [
    'Action',
    'Sci-Fi',
    'Thriller',
    'Crime',
    'Mystery',
    'Drama',
    'Adventure',
    'Comedy',
    'Horror',
    'Fantasy',
  ];

  const toggleIndustry = (id: string) => {
    soundEffects.click(soundEnabled);
    if (selectedIndustries.includes(id)) {
      setSelectedIndustries(selectedIndustries.filter(x => x !== id));
    } else {
      setSelectedIndustries([...selectedIndustries, id]);
    }
  };

  const toggleGenre = (genre: string) => {
    soundEffects.click(soundEnabled);
    if (selectedGenres.includes(genre)) {
      setSelectedGenres(selectedGenres.filter(x => x !== genre));
    } else {
      setSelectedGenres([...selectedGenres, genre]);
    }
  };

  const handleFinish = () => {
    soundEffects.cinematicHit(soundEnabled);
    const newGenresRecord: Record<string, number> = {};
    selectedGenres.forEach(g => {
      newGenresRecord[g] = 5;
    });

    onSaveTaste({
      ...taste,
      preferredIndustries: selectedIndustries,
      genres: newGenresRecord,
      prioritizeIndianAction,
      includeIndianCinema: true,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in">
      <div className="relative w-full max-w-2xl bg-[#14141B] rounded-3xl border border-white/20 p-6 sm:p-8 shadow-[0_0_80px_rgba(229,9,20,0.3)]">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 mb-6">
          <div className={`h-1.5 rounded-full transition-all ${step === 1 ? 'w-8 bg-[#E50914]' : 'w-2 bg-white/20'}`} />
          <div className={`h-1.5 rounded-full transition-all ${step === 2 ? 'w-8 bg-[#E50914]' : 'w-2 bg-white/20'}`} />
        </div>

        {step === 1 ? (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF2E56] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 1 of 2 • Industries & Cinema Universes</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
              Select Your Preferred Film Industries
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Pick the languages and film industries you love exploring. We highlight these first across your Netflix-style carousels.
            </p>

            {/* Indian Action Highlight Toggle */}
            <div
              onClick={() => {
                soundEffects.click(soundEnabled);
                setPrioritizeIndianAction(!prioritizeIndianAction);
              }}
              className={`p-4 rounded-2xl border mb-6 cursor-pointer flex items-center justify-between transition-all ${
                prioritizeIndianAction
                  ? 'bg-[#E50914]/15 border-[#E50914] text-white shadow-[0_0_20px_rgba(229,9,20,0.25)]'
                  : 'bg-white/5 border-white/10 text-zinc-400'
              }`}
            >
              <div className="flex items-center gap-3">
                <Flame className="w-5 h-5 text-[#E50914]" />
                <div>
                  <div className="text-sm font-bold text-white">Prioritize Indian Mass Action (Recommended)</div>
                  <div className="text-xs text-zinc-400">Features high-octane blockbusters from Tollywood, Bollywood, Kollywood, Sandalwood</div>
                </div>
              </div>
              <div className={`w-5 h-5 rounded-md flex items-center justify-center border ${prioritizeIndianAction ? 'bg-[#E50914] border-[#E50914] text-white' : 'border-white/30'}`}>
                {prioritizeIndianAction && <Check className="w-3.5 h-3.5" />}
              </div>
            </div>

            {/* Industries Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-8 max-h-60 overflow-y-auto pr-1">
              {industriesList.map((ind) => {
                const active = selectedIndustries.includes(ind.id);
                return (
                  <button
                    key={ind.id}
                    onClick={() => toggleIndustry(ind.id)}
                    className={`p-3 rounded-xl border text-left text-xs font-semibold flex items-center justify-between transition-all cursor-pointer ${
                      active
                        ? 'bg-white/15 border-white text-white'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white'
                    }`}
                  >
                    <span>{ind.name}</span>
                    {active && <Check className="w-4 h-4 text-[#46D369]" />}
                  </button>
                );
              })}
            </div>

            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                setStep(2);
              }}
              className="w-full py-3 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
            >
              <span>Continue to Genres</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div>
            <div className="flex items-center gap-2 text-xs font-mono font-bold text-[#FF2E56] uppercase tracking-wider mb-1">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step 2 of 2 • Core Genres</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-display font-black text-white uppercase tracking-tight mb-2">
              Select Your Favorite Genres
            </h2>
            <p className="text-xs text-zinc-400 mb-6">
              Choose the genres that drive your movie choices. We use these to calculate transparent Match % scores.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 mb-8">
              {genresList.map((g) => {
                const active = selectedGenres.includes(g);
                return (
                  <button
                    key={g}
                    onClick={() => toggleGenre(g)}
                    className={`py-3 px-4 rounded-xl border text-center text-xs font-bold transition-all cursor-pointer ${
                      active
                        ? 'bg-[#E50914] border-[#E50914] text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-zinc-400 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    {g}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setStep(1)}
                className="py-3 px-5 rounded-xl bg-white/10 text-zinc-300 font-semibold text-xs hover:bg-white/20 transition-all cursor-pointer"
              >
                Back
              </button>
              <button
                onClick={handleFinish}
                className="flex-1 py-3 rounded-xl bg-[#E50914] hover:bg-[#b80710] text-white font-bold text-sm tracking-wider uppercase flex items-center justify-center gap-2 cursor-pointer shadow-lg"
              >
                <span>Save Preferences & Enter CINEMIND</span>
                <Check className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
