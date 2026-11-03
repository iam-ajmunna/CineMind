import React, { useState } from 'react';
import { TasteProfile } from '../types';
import { Sparkles, Sliders, Check, Plus, X, Film, User, Clock, Compass } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface TasteRadarProps {
  taste: TasteProfile;
  onChange: (newTaste: TasteProfile) => void;
  soundEnabled?: boolean;
}

const AVAILABLE_GENRES = [
  'Sci-Fi', 'Thriller', 'Mystery', 'Action', 'Drama', 'Crime', 'Horror', 'Adventure', 'Comedy', 'Animation'
];

const AVAILABLE_VIBES = [
  'mind-bending', 'slow-burn', 'neo-noir', 'cyberpunk', 'adrenaline-rush', 'feel-good', 'cosmic-horror', 'cerebral', 'dystopian', 'claustrophobic'
];

const AVAILABLE_DECADES = ['1970s', '1980s', '1990s', '2000s', '2010s', '2020s'];

export const TasteRadar: React.FC<TasteRadarProps> = ({ taste, onChange, soundEnabled = false }) => {
  const [activeTab, setActiveTab] = useState<'radar' | 'edit'>('radar');
  const [newDirector, setNewDirector] = useState('');
  const [newActor, setNewActor] = useState('');

  // Prepare radar chart points (Genres + Top Vibes)
  const radarItems = [
    { label: 'Sci-Fi', value: taste.genres['Sci-Fi'] || 1, max: 5 },
    { label: 'Thriller', value: taste.genres['Thriller'] || 1, max: 5 },
    { label: 'Mystery', value: taste.genres['Mystery'] || 1, max: 5 },
    { label: 'Action', value: taste.genres['Action'] || 1, max: 5 },
    { label: 'Drama', value: taste.genres['Drama'] || 1, max: 5 },
    { label: 'Crime', value: taste.genres['Crime'] || 1, max: 5 },
    { label: 'Horror', value: taste.genres['Horror'] || 1, max: 5 },
    { label: 'Comedy', value: taste.genres['Comedy'] || 1, max: 5 },
  ];

  const totalPoints = radarItems.length;
  const radius = 105;
  const center = 140;

  // Compute SVG polygon coordinates
  const polygonPoints = radarItems
    .map((item, i) => {
      const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
      const normalizedValue = item.value / item.max;
      const r = normalizedValue * radius;
      const x = center + r * Math.cos(angle);
      const y = center + r * Math.sin(angle);
      return `${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(' ');

  const handleGenreWeightChange = (genre: string, val: number) => {
    soundEffects.click(soundEnabled);
    onChange({
      ...taste,
      genres: {
        ...taste.genres,
        [genre]: val,
      },
    });
  };

  const toggleVibe = (vibe: string) => {
    soundEffects.click(soundEnabled);
    const exists = taste.vibes.includes(vibe);
    const newVibes = exists
      ? taste.vibes.filter((v) => v !== vibe)
      : [...taste.vibes, vibe];
    onChange({ ...taste, vibes: newVibes });
  };

  const toggleDecade = (dec: string) => {
    soundEffects.click(soundEnabled);
    const exists = taste.preferredDecades.includes(dec);
    const newDec = exists
      ? taste.preferredDecades.filter((d) => d !== dec)
      : [...taste.preferredDecades, dec];
    onChange({ ...taste, preferredDecades: newDec });
  };

  const handleAddDirector = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDirector.trim()) return;
    soundEffects.cinematicHit(soundEnabled);
    onChange({
      ...taste,
      favoriteDirectors: [...taste.favoriteDirectors, newDirector.trim()],
    });
    setNewDirector('');
  };

  const handleRemoveDirector = (name: string) => {
    soundEffects.click(soundEnabled);
    onChange({
      ...taste,
      favoriteDirectors: taste.favoriteDirectors.filter((d) => d !== name),
    });
  };

  const handleAddActor = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newActor.trim()) return;
    soundEffects.cinematicHit(soundEnabled);
    onChange({
      ...taste,
      favoriteActors: [...taste.favoriteActors, newActor.trim()],
    });
    setNewActor('');
  };

  const handleRemoveActor = (name: string) => {
    soundEffects.click(soundEnabled);
    onChange({
      ...taste,
      favoriteActors: taste.favoriteActors.filter((a) => a !== name),
    });
  };

  return (
    <div className="relative glass-panel rounded-2xl p-6 border border-white/10 shadow-2xl overflow-hidden">
      {/* Blade accent header */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />

      {/* Top Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono-code text-[#CCFF00] uppercase tracking-wider mb-1">
            <Compass className="w-3.5 h-3.5 text-[#CCFF00]" />
            Personal Taste Intelligence
          </div>
          <h2 className="text-2xl font-display uppercase tracking-wider text-white">
            Cinematic Taste Constellation
          </h2>
        </div>

        {/* Tab switcher */}
        <div className="flex items-center bg-[#07070A]/80 p-1 rounded-xl border border-white/10">
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveTab('radar');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'radar'
                ? 'bg-[#CCFF00] text-black font-semibold shadow-lg shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            Constellation Radar
          </button>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              setActiveTab('edit');
            }}
            className={`px-4 py-1.5 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all ${
              activeTab === 'edit'
                ? 'bg-[#CCFF00] text-black font-semibold shadow-lg shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sliders className="w-3 h-3" />
            Fine-Tune Profile
          </button>
        </div>
      </div>

      {activeTab === 'radar' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* SVG Radar Chart */}
          <div className="lg:col-span-6 flex flex-col items-center justify-center p-2">
            <div className="relative w-[280px] h-[280px]">
              <svg
                width="280"
                height="280"
                className="overflow-visible filter drop-shadow-[0_0_15px_rgba(204,255,0,0.15)]"
              >
                {/* Background Concentric Webs */}
                {[0.25, 0.5, 0.75, 1].map((scale, level) => {
                  const webPoints = radarItems
                    .map((_, i) => {
                      const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
                      const r = radius * scale;
                      const x = center + r * Math.cos(angle);
                      const y = center + r * Math.sin(angle);
                      return `${x.toFixed(1)},${y.toFixed(1)}`;
                    })
                    .join(' ');
                  return (
                    <polygon
                      key={level}
                      points={webPoints}
                      fill="none"
                      stroke="rgba(255, 255, 255, 0.08)"
                      strokeWidth="1"
                      strokeDasharray={level === 3 ? 'none' : '3 3'}
                    />
                  );
                })}

                {/* Radial Axis Spokes */}
                {radarItems.map((_, i) => {
                  const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
                  const x = center + radius * Math.cos(angle);
                  const y = center + radius * Math.sin(angle);
                  return (
                    <line
                      key={i}
                      x1={center}
                      y1={center}
                      x2={x}
                      y2={y}
                      stroke="rgba(255, 255, 255, 0.12)"
                      strokeWidth="1"
                    />
                  );
                })}

                {/* Dynamic Taste Polygon Area */}
                <polygon
                  points={polygonPoints}
                  fill="url(#radarGradient)"
                  stroke="#CCFF00"
                  strokeWidth="2.5"
                  className="transition-all duration-700 ease-out"
                />

                {/* Point Vertices */}
                {radarItems.map((item, i) => {
                  const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
                  const normalizedValue = item.value / item.max;
                  const r = normalizedValue * radius;
                  const x = center + r * Math.cos(angle);
                  const y = center + r * Math.sin(angle);
                  return (
                    <g key={i}>
                      <circle
                        cx={x}
                        cy={y}
                        r="4"
                        fill="#07070A"
                        stroke="#CCFF00"
                        strokeWidth="2"
                        className="transition-all duration-700"
                      />
                      <circle
                        cx={x}
                        cy={y}
                        r="2"
                        fill="#FF007F"
                      />
                    </g>
                  );
                })}

                {/* Axis Labels */}
                {radarItems.map((item, i) => {
                  const angle = (Math.PI * 2 / totalPoints) * i - Math.PI / 2;
                  const labelRadius = radius + 22;
                  const x = center + labelRadius * Math.cos(angle);
                  const y = center + labelRadius * Math.sin(angle);
                  return (
                    <text
                      key={i}
                      x={x}
                      y={y + 4}
                      textAnchor="middle"
                      fill={item.value >= 4 ? '#CCFF00' : '#94A3B8'}
                      fontSize="11"
                      fontFamily="JetBrains Mono, monospace"
                      fontWeight={item.value >= 4 ? '700' : '500'}
                    >
                      {item.label}
                    </text>
                  );
                })}

                <defs>
                  <linearGradient id="radarGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#CCFF00" stopOpacity="0.45" />
                    <stop offset="60%" stopColor="#00F0FF" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#FF007F" stopOpacity="0.35" />
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <div className="mt-4 text-xs font-mono-code text-zinc-500 text-center">
              Constellation adapts live as you rate, watch, and refine films.
            </div>
          </div>

          {/* Taste Insights Breakdown */}
          <div className="lg:col-span-6 space-y-4">
            {/* Active Vibes Badges */}
            <div>
              <div className="text-xs uppercase font-mono-code text-zinc-400 mb-2">Dominant Vibes</div>
              <div className="flex flex-wrap gap-2">
                {taste.vibes.map((v) => (
                  <span
                    key={v}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono-code uppercase bg-[#141721] text-[#00F0FF] border border-[#00F0FF]/30 shadow-[0_0_10px_rgba(0,240,255,0.1)]"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00F0FF] animate-pulse" />
                    {v}
                  </span>
                ))}
              </div>
            </div>

            {/* Favorite Auteurs */}
            <div>
              <div className="text-xs uppercase font-mono-code text-zinc-400 mb-2">Preferred Directors & Cast</div>
              <div className="flex flex-wrap gap-2">
                {taste.favoriteDirectors.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs bg-white/5 text-zinc-200 border border-white/10"
                  >
                    <Film className="w-3 h-3 text-[#CCFF00]" />
                    {d}
                  </span>
                ))}
                {taste.favoriteActors.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-xs bg-white/5 text-zinc-200 border border-white/10"
                  >
                    <User className="w-3 h-3 text-[#FF007F]" />
                    {a}
                  </span>
                ))}
              </div>
            </div>

            {/* Runtime & Decades */}
            <div className="grid grid-cols-2 gap-4 pt-2">
              <div className="bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] font-mono-code text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
                  <Clock className="w-3 h-3 text-[#CCFF00]" /> Runtime Target
                </div>
                <div className="text-sm font-semibold text-white">
                  {taste.runtimePreference === 'under90' && '< 90 Minutes (Quick)'}
                  {taste.runtimePreference === '90to120' && '90 – 120 Min (Sweet Spot)'}
                  {taste.runtimePreference === 'over120' && '120+ Min (Immersive Epic)'}
                  {taste.runtimePreference === 'any' && 'Any Duration'}
                </div>
              </div>

              <div className="bg-[#0B0D14] p-3 rounded-xl border border-white/5">
                <div className="text-[11px] font-mono-code text-zinc-500 uppercase flex items-center gap-1.5 mb-1">
                  <Sparkles className="w-3 h-3 text-[#FF007F]" /> Era Affinities
                </div>
                <div className="text-sm font-semibold text-white truncate">
                  {taste.preferredDecades.join(', ') || 'All Eras'}
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        /* Fine-Tune Interactive Form */
        <div className="space-y-6">
          {/* Genre Sliders */}
          <div>
            <h3 className="text-sm font-mono-code uppercase text-[#CCFF00] tracking-wider mb-3">
              1. Genre Affinity (Weight 1 to 5)
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {AVAILABLE_GENRES.map((genre) => {
                const currentWeight = taste.genres[genre] || 1;
                return (
                  <div
                    key={genre}
                    className="bg-[#0B0D14] p-3 rounded-xl border border-white/5 flex flex-col justify-between"
                  >
                    <div className="flex items-center justify-between text-xs font-semibold mb-2">
                      <span>{genre}</span>
                      <span className="font-mono-code text-[#CCFF00]">{currentWeight}★</span>
                    </div>
                    <input
                      type="range"
                      min="1"
                      max="5"
                      value={currentWeight}
                      onChange={(e) => handleGenreWeightChange(genre, parseInt(e.target.value, 10))}
                      className="w-full accent-[#CCFF00] cursor-pointer h-1.5 bg-zinc-800 rounded-lg appearance-none"
                    />
                  </div>
                );
              })}
            </div>
          </div>

          {/* Vibe Selection Chips */}
          <div>
            <h3 className="text-sm font-mono-code uppercase text-[#00F0FF] tracking-wider mb-3">
              2. Atmospheric Vibes
            </h3>
            <div className="flex flex-wrap gap-2">
              {AVAILABLE_VIBES.map((vibe) => {
                const isSelected = taste.vibes.includes(vibe);
                return (
                  <button
                    key={vibe}
                    type="button"
                    onClick={() => toggleVibe(vibe)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-mono-code uppercase transition-all flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#00F0FF] text-black font-bold shadow-[0_0_12px_rgba(0,240,255,0.4)]'
                        : 'bg-[#141721] text-zinc-400 border border-white/5 hover:border-[#00F0FF]/30'
                    }`}
                  >
                    {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                    {vibe}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Runtime Preference */}
          <div>
            <h3 className="text-sm font-mono-code uppercase text-zinc-300 tracking-wider mb-3">
              3. Runtime Preference
            </h3>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                { id: 'under90', label: 'Under 90 min', desc: 'Punchy & tight' },
                { id: '90to120', label: '90 - 120 min', desc: 'Standard gold spot' },
                { id: 'over120', label: '120+ min', desc: 'Expansive epic' },
                { id: 'any', label: 'No Limit', desc: 'Whatever story takes' },
              ].map((rt) => (
                <button
                  key={rt.id}
                  type="button"
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onChange({ ...taste, runtimePreference: rt.id as any });
                  }}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    taste.runtimePreference === rt.id
                      ? 'border-[#CCFF00] bg-[#CCFF00]/10 text-white'
                      : 'border-white/5 bg-[#0B0D14] text-zinc-400 hover:border-white/20'
                  }`}
                >
                  <div className="text-xs font-semibold text-white mb-0.5">{rt.label}</div>
                  <div className="text-[11px] text-zinc-500">{rt.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Directors & Actors Management */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Directors */}
            <div>
              <h3 className="text-xs font-mono-code uppercase text-zinc-400 mb-2">Favorite Directors</h3>
              <form onSubmit={handleAddDirector} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. David Fincher, Denis Villeneuve"
                  value={newDirector}
                  onChange={(e) => setNewDirector(e.target.value)}
                  className="flex-1 bg-[#0B0D14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#CCFF00]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#CCFF00] text-black font-semibold rounded-lg text-xs hover:bg-[#b8e600] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {taste.favoriteDirectors.map((d) => (
                  <span
                    key={d}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#141721] text-xs text-zinc-200 border border-white/10"
                  >
                    {d}
                    <button
                      type="button"
                      onClick={() => handleRemoveDirector(d)}
                      className="hover:text-red-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Actors */}
            <div>
              <h3 className="text-xs font-mono-code uppercase text-zinc-400 mb-2">Favorite Actors</h3>
              <form onSubmit={handleAddActor} className="flex gap-2 mb-2">
                <input
                  type="text"
                  placeholder="e.g. Florence Pugh, Ryan Gosling"
                  value={newActor}
                  onChange={(e) => setNewActor(e.target.value)}
                  className="flex-1 bg-[#0B0D14] border border-white/10 rounded-lg px-3 py-1.5 text-xs text-white focus:outline-none focus:border-[#FF007F]"
                />
                <button
                  type="submit"
                  className="px-3 py-1.5 bg-[#FF007F] text-white font-semibold rounded-lg text-xs hover:bg-[#e00070] flex items-center gap-1"
                >
                  <Plus className="w-3.5 h-3.5" /> Add
                </button>
              </form>
              <div className="flex flex-wrap gap-1.5">
                {taste.favoriteActors.map((a) => (
                  <span
                    key={a}
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#141721] text-xs text-zinc-200 border border-white/10"
                  >
                    {a}
                    <button
                      type="button"
                      onClick={() => handleRemoveActor(a)}
                      className="hover:text-red-400 p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
