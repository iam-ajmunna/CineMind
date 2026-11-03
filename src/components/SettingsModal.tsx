import React, { useState } from 'react';
import { AppSettings, MovieItem, TasteProfile, ServerConnection } from '../types';
import {
  X,
  Volume2,
  VolumeX,
  Sparkles,
  Download,
  Upload,
  RotateCcw,
  Key,
  Shield,
  Eye,
  Check
} from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: AppSettings;
  onUpdateSettings: (newSettings: AppSettings) => void;
  allData: {
    movies: MovieItem[];
    taste: TasteProfile;
    servers: ServerConnection[];
    settings: AppSettings;
  };
  onResetAll: () => void;
  onRestoreAll: (importedData: any) => void;
  soundEnabled?: boolean;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  allData,
  onResetAll,
  onRestoreAll,
  soundEnabled = false,
}) => {
  const [geminiKey, setGeminiKey] = useState(settings.geminiApiKey || '');
  const [tmdbKey, setTmdbKey] = useState(settings.tmdbApiKey || '');
  const [savedNotice, setSavedNotice] = useState(false);

  if (!isOpen) return null;

  const handleSaveKeys = () => {
    soundEffects.cinematicHit(soundEnabled);
    onUpdateSettings({
      ...settings,
      geminiApiKey: geminiKey.trim(),
      tmdbApiKey: tmdbKey.trim(),
    });
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 2000);
  };

  const handleExportJSON = () => {
    soundEffects.click(soundEnabled);
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(allData, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', `cinemind-backup-${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const json = JSON.parse(event.target?.result as string);
        onRestoreAll(json);
        soundEffects.cinematicHit(soundEnabled);
        alert('Library & Taste data restored successfully!');
      } catch (err) {
        alert('Invalid JSON backup file');
      }
    };
    reader.readAsText(file);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl glass-panel rounded-3xl border border-white/20 shadow-[0_0_80px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col max-h-[90vh]">
        {/* Top Blade Line */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#CCFF00] to-transparent" />

        {/* Modal Header */}
        <div className="p-6 border-b border-white/10 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-display uppercase tracking-wider text-white">
              System Settings & Intelligence Keys
            </h2>
            <div className="text-xs font-mono-code text-zinc-400">
              CINEMIND Engine • Local Storage Encrypted Profile
            </div>
          </div>
          <button
            onClick={() => {
              soundEffects.click(soundEnabled);
              onClose();
            }}
            className="p-2 rounded-xl bg-white/5 hover:bg-white/10 text-zinc-400 hover:text-white transition-all cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Settings Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Audio & Motion Preferences */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono-code uppercase text-[#CCFF00] tracking-wider">
              Experience & Motion Design
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Sound Toggle */}
              <button
                type="button"
                onClick={() => {
                  const nextVal = !settings.soundEnabled;
                  soundEffects.click(nextVal);
                  onUpdateSettings({ ...settings, soundEnabled: nextVal });
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  settings.soundEnabled
                    ? 'bg-[#CCFF00]/10 border-[#CCFF00] text-white'
                    : 'bg-[#0B0D14] border-white/10 text-zinc-400'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">Cinematic Sound Design</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Blade slashes & sub whooshes</div>
                </div>
                {settings.soundEnabled ? (
                  <Volume2 className="w-5 h-5 text-[#CCFF00]" />
                ) : (
                  <VolumeX className="w-5 h-5 text-zinc-600" />
                )}
              </button>

              {/* Reduced Motion Toggle */}
              <button
                type="button"
                onClick={() => {
                  soundEffects.click(soundEnabled);
                  onUpdateSettings({ ...settings, reducedMotion: !settings.reducedMotion });
                }}
                className={`p-4 rounded-2xl border text-left flex items-center justify-between transition-all ${
                  settings.reducedMotion
                    ? 'bg-[#00F0FF]/10 border-[#00F0FF] text-white'
                    : 'bg-[#0B0D14] border-white/10 text-zinc-400'
                }`}
              >
                <div>
                  <div className="text-xs font-semibold text-white">Reduced Motion Mode</div>
                  <div className="text-[11px] text-zinc-500 mt-0.5">Disables 3D particles & canvas</div>
                </div>
                <Eye className="w-5 h-5 text-zinc-500" />
              </button>
            </div>
          </div>

          {/* API Keys Configuration */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-mono-code uppercase text-[#00F0FF] tracking-wider">
                External Intelligence Keys (Optional)
              </h3>
              <span className="text-[10px] font-mono-code text-zinc-500">
                Stored in local browser only
              </span>
            </div>

            <div className="space-y-3 bg-[#0B0D14] p-4 rounded-2xl border border-white/10">
              <div>
                <label className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                  TMDB (TheMovieDB) API Key (Read Access Token or v3 key)
                </label>
                <input
                  type="password"
                  placeholder="Paste TMDB API key for live movie metadata & cast..."
                  value={tmdbKey}
                  onChange={(e) => setTmdbKey(e.target.value)}
                  className="w-full bg-[#07070A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div>
                <label className="text-[11px] font-mono-code text-zinc-400 block mb-1">
                  Gemini API Key (Overrides server key if provided)
                </label>
                <input
                  type="password"
                  placeholder="Paste Gemini API key..."
                  value={geminiKey}
                  onChange={(e) => setGeminiKey(e.target.value)}
                  className="w-full bg-[#07070A] border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-[#00F0FF]"
                />
              </div>

              <div className="flex items-center justify-between pt-1">
                <span className="text-[11px] font-mono-code text-zinc-500 flex items-center gap-1">
                  <Shield className="w-3 h-3 text-[#CCFF00]" /> Safe client-only storage
                </span>
                <button
                  onClick={handleSaveKeys}
                  className="px-4 py-1.5 bg-[#00F0FF] hover:bg-[#00d6e6] text-black font-semibold text-xs rounded-xl flex items-center gap-1 cursor-pointer transition-all"
                >
                  {savedNotice ? <Check className="w-3.5 h-3.5" /> : <Key className="w-3.5 h-3.5" />}
                  {savedNotice ? 'Saved!' : 'Save Keys'}
                </button>
              </div>
            </div>
          </div>

          {/* Data Backup & Restore */}
          <div className="space-y-3">
            <h3 className="text-xs font-mono-code uppercase text-zinc-400 tracking-wider">
              Data Management & Backup
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                type="button"
                onClick={handleExportJSON}
                className="p-3 bg-[#0B0D14] hover:bg-white/5 border border-white/10 rounded-xl text-left flex items-center gap-3 text-xs text-zinc-200 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[#CCFF00]" />
                <div>
                  <div className="font-semibold text-white">Export Library JSON</div>
                  <div className="text-[10px] text-zinc-500">Backup all servers, taste & ratings</div>
                </div>
              </button>

              <label className="p-3 bg-[#0B0D14] hover:bg-white/5 border border-white/10 rounded-xl text-left flex items-center gap-3 text-xs text-zinc-200 transition-all cursor-pointer">
                <Upload className="w-4 h-4 text-[#FF007F]" />
                <div>
                  <div className="font-semibold text-white">Restore from Backup</div>
                  <div className="text-[10px] text-zinc-500">Upload JSON archive</div>
                </div>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportFile}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Reset Danger Zone */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-between">
            <div className="text-xs text-zinc-500">
              Need a fresh slate? Clears all cached library items and resets taste radar.
            </div>
            <button
              onClick={() => {
                if (confirm('Are you sure you want to reset all movies and taste profile to defaults?')) {
                  onResetAll();
                  soundEffects.cinematicHit(soundEnabled);
                  onClose();
                }
              }}
              className="px-3.5 py-1.5 bg-red-950/60 hover:bg-red-900 border border-red-800 text-red-300 font-medium text-xs rounded-xl flex items-center gap-1.5 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Database
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
