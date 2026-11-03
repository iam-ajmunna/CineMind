import React from 'react';
import {
  Sparkles,
  Search,
  Server,
  Layers,
  Compass,
  Check,
  Settings,
  Volume2,
  VolumeX,
  Command,
  Film
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface HeaderProps {
  currentTab: 'tonight' | 'library' | 'gaps' | 'taste' | 'history';
  onSelectTab: (tab: 'tonight' | 'library' | 'gaps' | 'taste' | 'history') => void;
  libraryCount: number;
  gapsCount: number;
  serverCount: number;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSearch: () => void;
  onOpenExtension: () => void;
  onOpenSettings: () => void;
  onOpenShortcuts: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  libraryCount,
  gapsCount,
  serverCount,
  soundEnabled,
  onToggleSound,
  onOpenSearch,
  onOpenExtension,
  onOpenSettings,
  onOpenShortcuts,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#07070A]/85 backdrop-blur-xl border-b border-white/10 transition-all">
      {/* Top subtle light blade accent */}
      <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#CCFF00] via-[#00F0FF] to-transparent opacity-80" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
        {/* Brand Logo */}
        <div
          onClick={() => {
            soundEffects.bladeSlash(soundEnabled);
            onSelectTab('tonight');
          }}
          className="flex items-center gap-3 cursor-pointer group"
        >
          {/* Stylized Katana Slash Icon */}
          <div className="relative w-9 h-9 rounded-xl bg-gradient-to-br from-[#141721] to-[#07070A] border border-white/20 flex items-center justify-center overflow-hidden group-hover:border-[#CCFF00] transition-colors shadow-[0_0_15px_rgba(204,255,0,0.15)]">
            <span className="font-display text-xl text-[#CCFF00] tracking-tighter">C</span>
            <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
          </div>

          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-display text-2xl tracking-widest text-white uppercase group-hover:text-[#CCFF00] transition-colors">
                CINEMIND
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-[#CCFF00] animate-pulse" />
            </div>
            <div className="text-[9px] font-mono-code text-zinc-400 tracking-wider uppercase -mt-1 hidden sm:block">
              Katana Cinema AI
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center bg-[#0B0D14] p-1 rounded-2xl border border-white/10">
          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab('tonight');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono-code uppercase transition-all flex items-center gap-1.5 ${
              currentTab === 'tonight'
                ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Tonight
          </button>

          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab('library');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono-code uppercase transition-all flex items-center gap-1.5 ${
              currentTab === 'library'
                ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Server className="w-3.5 h-3.5" />
            My Library
            <span
              className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                currentTab === 'library' ? 'bg-black/20 text-black' : 'bg-white/10 text-zinc-300'
              }`}
            >
              {libraryCount}
            </span>
          </button>

          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab('gaps');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono-code uppercase transition-all flex items-center gap-1.5 ${
              currentTab === 'gaps'
                ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Film className="w-3.5 h-3.5" />
            Gaps
            {gapsCount > 0 && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-md ${
                  currentTab === 'gaps' ? 'bg-black/20 text-black' : 'bg-[#FF007F]/20 text-[#FF007F]'
                }`}
              >
                {gapsCount}
              </span>
            )}
          </button>

          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab('taste');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono-code uppercase transition-all flex items-center gap-1.5 ${
              currentTab === 'taste'
                ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            Taste Radar
          </button>

          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab('history');
            }}
            className={`px-4 py-1.5 rounded-xl text-xs font-mono-code uppercase transition-all flex items-center gap-1.5 ${
              currentTab === 'history'
                ? 'bg-[#CCFF00] text-black font-bold shadow-md shadow-[#CCFF00]/20'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Check className="w-3.5 h-3.5" />
            History
          </button>
        </nav>

        {/* Right Action Icons & Extension Status */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Natural Search Button */}
          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onOpenSearch();
            }}
            title="Natural Language Search (/)"
            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 text-xs font-mono-code flex items-center gap-2 transition-all cursor-pointer"
          >
            <Search className="w-3.5 h-3.5 text-[#00F0FF]" />
            <span className="hidden sm:inline">Ask AI</span>
            <kbd className="hidden lg:inline px-1 py-0.5 rounded bg-black/50 text-[10px] text-zinc-400">
              /
            </kbd>
          </button>

          {/* Extension Server Badge */}
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onOpenExtension();
            }}
            title="Connected Media Servers"
            className="px-3 py-1.5 rounded-xl bg-[#141721] hover:bg-[#1a1e2b] border border-[#CCFF00]/30 text-xs font-mono-code text-[#CCFF00] flex items-center gap-1.5 transition-all cursor-pointer shadow-[0_0_12px_rgba(204,255,0,0.15)]"
          >
            <span className="w-2 h-2 rounded-full bg-[#CCFF00] animate-pulse" />
            <span className="hidden sm:inline">{serverCount} Servers</span>
          </button>

          {/* Sound Design Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound Design (M)' : 'Enable Sound Design (M)'}
            aria-label="Toggle Sound"
            className={`p-2 rounded-xl border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-[#CCFF00]/10 border-[#CCFF00]/40 text-[#CCFF00]'
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Keyboard Shortcuts (?) */}
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onOpenShortcuts();
            }}
            title="Tactical Keyboard Shortcuts"
            aria-label="Keyboard Shortcuts"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer hidden sm:block"
          >
            <Command className="w-4 h-4" />
          </button>

          {/* Settings */}
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onOpenSettings();
            }}
            title="System Settings"
            aria-label="Settings"
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Mobile Sub-Navigation Bar */}
      <div className="md:hidden flex items-center justify-around border-t border-white/5 px-2 py-2 bg-[#0B0D14]/90 overflow-x-auto text-[11px] font-mono-code">
        {[
          { id: 'tonight', label: 'Tonight' },
          { id: 'library', label: `Library (${libraryCount})` },
          { id: 'gaps', label: `Gaps (${gapsCount})` },
          { id: 'taste', label: 'Taste' },
          { id: 'history', label: 'History' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => onSelectTab(tab.id as any)}
            className={`px-3 py-1 rounded-lg uppercase ${
              currentTab === tab.id ? 'bg-[#CCFF00] text-black font-bold' : 'text-zinc-400'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>
    </header>
  );
};
