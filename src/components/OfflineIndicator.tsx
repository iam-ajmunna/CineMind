import React, { useEffect, useState } from 'react';
import { WifiOff } from 'lucide-react';

export const OfflineIndicator: React.FC = () => {
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed bottom-16 sm:bottom-6 left-6 z-50 flex items-center gap-2 bg-[#E50914]/90 border border-white/20 text-white px-3.5 py-1.5 rounded-full text-xs font-semibold shadow-2xl backdrop-blur-md animate-bounce">
      <WifiOff className="w-3.5 h-3.5" />
      <span>Offline Mode — Cached Catalog Active</span>
    </div>
  );
};
