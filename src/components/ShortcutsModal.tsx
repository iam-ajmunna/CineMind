import React from 'react';
import { X, Command } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface ShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled?: boolean;
}

const SHORTCUTS = [
  { key: 'J / K', label: 'Previous / Next Film', desc: 'Browse horizontal alternate queue' },
  { key: 'Enter', label: 'Stream on Server', desc: 'Open direct media server stream link' },
  { key: 'S', label: 'Save / Watchlist', desc: 'Toggle film in your personal watchlist' },
  { key: '/', label: 'Natural Language AI', desc: 'Open the Gemini discovery oracle' },
  { key: 'T', label: 'Tonight View', desc: 'Return to main suggestion engine' },
  { key: 'L', label: 'My Library', desc: 'Jump to connected server inventory' },
  { key: 'G', label: 'Gaps View', desc: 'Review high-affinity missing films' },
  { key: 'P', label: 'Taste Constellation', desc: 'Open taste radar and fine-tuning' },
  { key: 'M', label: 'Toggle Sound', desc: 'Mute / unmute synthesized sound design' },
  { key: 'Esc', label: 'Close Modals', desc: 'Dismiss any open sheet or dialog' },
];

export const ShortcutsModal: React.FC<ShortcutsModalProps> = ({
  isOpen,
  onClose,
  soundEnabled = false,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-panel rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col blade-edge">
        {/* Top Blade Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />

        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Command className="w-5 h-5 text-[#CCFF00]" />
            <h2 className="text-xl font-display uppercase tracking-wider text-white">
              Tactical Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-2.5 max-h-[70vh] overflow-y-auto">
          {SHORTCUTS.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between p-3 rounded-xl bg-[#0B0D14] border border-white/5"
            >
              <div>
                <div className="text-xs font-semibold text-white">{sc.label}</div>
                <div className="text-[11px] text-zinc-500">{sc.desc}</div>
              </div>
              <kbd className="px-3 py-1 rounded-lg bg-white/10 text-[#CCFF00] font-mono-code text-xs font-bold border border-white/10">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
