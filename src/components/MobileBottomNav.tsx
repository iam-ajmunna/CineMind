import React from 'react';
import { NavTab } from './Header';
import { Home, Film, Flame, Calendar, Bookmark } from 'lucide-react';
import { soundEffects } from '../utils/sound';

interface MobileBottomNavProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
  soundEnabled: boolean;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  soundEnabled,
}) => {
  const tabs = [
    { id: 'home' as NavTab, label: 'Home', icon: Home },
    { id: 'movies' as NavTab, label: 'Movies', icon: Film },
    { id: 'indian' as NavTab, label: 'Indian', icon: Flame, highlight: true },
    { id: 'upcoming' as NavTab, label: 'Upcoming', icon: Calendar },
    { id: 'my_list' as NavTab, label: 'My List', icon: Bookmark, badge: savedCount },
  ];

  return (
    <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0B0B0F]/95 backdrop-blur-xl border-t border-white/10 px-2 py-2 flex items-center justify-around">
      {tabs.map((tab) => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;

        return (
          <button
            key={tab.id}
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab(tab.id);
            }}
            className={`flex flex-col items-center justify-center py-1 px-2 rounded-xl transition-all cursor-pointer relative ${
              isActive
                ? tab.highlight
                  ? 'text-[#FF2E56]'
                  : 'text-white'
                : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            <Icon className={`w-5 h-5 mb-0.5 ${isActive && tab.highlight ? 'text-[#E50914]' : ''}`} />
            <span className="text-[10px] font-medium tracking-tight">{tab.label}</span>

            {/* Notification / Count Badge */}
            {typeof tab.badge === 'number' && tab.badge > 0 && (
              <span className="absolute top-0 right-1 px-1 rounded-full bg-[#E50914] text-white text-[9px] font-mono leading-none">
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </nav>
  );
};
