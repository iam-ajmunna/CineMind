import React, { useState } from 'react';
import { usePWAInstall } from '../utils/usePWAInstall';
import { Download, Smartphone, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running standalone, hide button
  if (isInstalled) {
    return null;
  }

  // Desktop Chrome / Edge / Android native prompt
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gradient-to-r from-[#E50914] to-[#FF1352] hover:brightness-110 text-white font-semibold text-xs tracking-wide shadow-[0_0_15px_rgba(229,9,20,0.4)] transition-all cursor-pointer"
        title="Install CINEMIND App"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-zinc-200 text-xs font-medium border border-white/15 transition-all cursor-pointer"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#E50914]" />
          <span>Install PWA</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 animate-in fade-in">
            <div className="w-full max-w-sm rounded-3xl bg-[#14141B] border border-white/20 p-6 shadow-2xl relative">
              <button
                onClick={() => setShowIOSGuide(false)}
                className="absolute top-4 right-4 p-1.5 text-zinc-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
              <h3 className="text-lg font-bold text-white mb-2">Install on iOS Safari</h3>
              <p className="text-xs text-zinc-400 leading-relaxed space-y-2">
                1. Tap the <strong className="text-white">Share</strong> button in the bottom Safari toolbar.<br />
                2. Scroll down and tap <strong className="text-[#E50914]">Add to Home Screen</strong>.<br />
                3. Open CINEMIND from your home screen for full-screen cinema mode.
              </p>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full py-2.5 rounded-xl bg-white/10 text-white text-xs font-semibold hover:bg-white/20 transition-all"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
