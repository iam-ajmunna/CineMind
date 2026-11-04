import React, { useState, useEffect } from 'react';
import {
  Search,
  Bell,
  Sparkles,
  Film,
  Flame,
  Calendar,
  Bookmark,
  Volume2,
  VolumeX,
  Compass,
  Check,
  Server,
  Settings,
  X,
  Play
} from 'lucide-react';
import { PWAInstallButton } from './PWAInstallButton';
import { soundEffects } from '../utils/sound';
import { NotificationItem, MovieItem } from '../types';

export type NavTab = 'home' | 'movies' | 'indian' | 'upcoming' | 'new_and_hot' | 'my_list' | 'tonight';

interface HeaderProps {
  currentTab: NavTab;
  onSelectTab: (tab: NavTab) => void;
  savedCount: number;
  watchedCount: number;
  serverCount: number;
  notifications: NotificationItem[];
  onMarkNotificationRead: (id: string) => void;
  onSelectMovie: (movie: MovieItem) => void;
  allMovies: MovieItem[];
  soundEnabled: boolean;
  onToggleSound: () => void;
  onOpenSearch: () => void;
  onOpenExtension: () => void;
  onOpenSettings: () => void;
  onOpenTaste: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  watchedCount,
  serverCount,
  notifications,
  onMarkNotificationRead,
  onSelectMovie,
  allMovies,
  soundEnabled,
  onToggleSound,
  onOpenSearch,
  onOpenExtension,
  onOpenSettings,
  onOpenTaste,
}) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Track window scroll for Netflix-style transparent-to-solid navigation transition
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 40) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const unreadNotifs = notifications.filter(n => !n.read);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-40 transition-colors duration-300 ${
        isScrolled
          ? 'bg-[#0B0B0F]/95 backdrop-blur-xl border-b border-white/10 shadow-2xl'
          : 'bg-gradient-to-b from-[#0B0B0F]/90 via-[#0B0B0F]/50 to-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 sm:h-20 flex items-center justify-between gap-4">
        {/* Left Side: Brand Logo & Navigation Links */}
        <div className="flex items-center gap-6 sm:gap-8">
          {/* Brand Logo (Netflix Inspired Custom Identity) */}
          <button
            type="button"
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onSelectTab('home');
            }}
            className="flex items-center gap-2 group cursor-pointer focus:outline-none"
          >
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#E50914] to-[#FF1352] p-0.5 flex items-center justify-center shadow-[0_0_20px_rgba(229,9,20,0.5)] group-hover:scale-105 transition-transform">
              <span className="font-display font-black text-xl text-white tracking-tighter">C</span>
            </div>
            <span className="font-display font-black text-2xl tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#E50914] via-[#FF2E56] to-white uppercase">
              CINEMIND
            </span>
          </button>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-5 text-sm font-medium">
            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onSelectTab('home');
              }}
              className={`transition-colors cursor-pointer ${
                currentTab === 'home'
                  ? 'text-white font-bold border-b-2 border-[#E50914] pb-0.5'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              Home
            </button>

            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onSelectTab('movies');
              }}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'movies'
                  ? 'text-white font-bold border-b-2 border-[#E50914] pb-0.5'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <span>Movies</span>
              <span className="text-[10px] text-zinc-500 font-mono">Interested</span>
            </button>

            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onSelectTab('indian');
              }}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'indian'
                  ? 'text-[#FF2E56] font-bold border-b-2 border-[#FF2E56] pb-0.5'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Flame className="w-3.5 h-3.5 text-[#E50914]" />
              <span>Indian Cinema</span>
            </button>

            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onSelectTab('upcoming');
              }}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'upcoming'
                  ? 'text-white font-bold border-b-2 border-[#E50914] pb-0.5'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-amber-400" />
              <span>Upcoming</span>
            </button>

            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onSelectTab('new_and_hot');
              }}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'new_and_hot'
                  ? 'text-white font-bold border-b-2 border-[#E50914] pb-0.5'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
              <span>New & Hot</span>
            </button>

            <button
              onClick={() => {
                soundEffects.whoosh(soundEnabled);
                onSelectTab('my_list');
              }}
              className={`transition-colors cursor-pointer flex items-center gap-1.5 ${
                currentTab === 'my_list'
                  ? 'text-white font-bold border-b-2 border-[#E50914] pb-0.5'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>My List</span>
              {savedCount > 0 && (
                <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
                  {savedCount}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Right Side: Search, PWA Install, Notifications, Audio, Profile */}
        <div className="flex items-center gap-3 sm:gap-4">
          {/* Natural Search Button */}
          <button
            onClick={() => {
              soundEffects.whoosh(soundEnabled);
              onOpenSearch();
            }}
            title="Search Catalog & Natural Language AI (/)"
            className="flex items-center gap-2 p-2 sm:px-3 sm:py-1.5 rounded-full bg-white/5 hover:bg-white/10 text-zinc-300 hover:text-white border border-white/10 transition-all cursor-pointer"
          >
            <Search className="w-4 h-4 text-[#FF1352]" />
            <span className="text-xs hidden sm:inline font-medium">Search</span>
            <kbd className="hidden lg:inline text-[10px] bg-black/40 px-1.5 py-0.5 rounded border border-white/10 text-zinc-400 font-mono">
              /
            </kbd>
          </button>

          {/* In-App PWA Install Button */}
          <PWAInstallButton />

          {/* Notifications Center Bell with Unread Badge */}
          <div className="relative">
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                setShowNotifications(!showNotifications);
                setShowProfileMenu(false);
              }}
              title="Notifications & Release Alerts"
              className="p-2 rounded-full hover:bg-white/10 text-zinc-300 hover:text-white transition-colors relative cursor-pointer"
            >
              <Bell className="w-5 h-5" />
              {unreadNotifs.length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E50914] ring-2 ring-[#0B0B0F] animate-pulse" />
              )}
            </button>

            {/* Notifications Dropdown Sheet */}
            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl bg-[#14141B]/95 border border-white/15 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.9)] backdrop-blur-2xl z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-white/10 mb-3">
                  <div className="flex items-center gap-2">
                    <Bell className="w-4 h-4 text-[#E50914]" />
                    <span className="text-xs font-bold text-white uppercase tracking-wider">
                      Cinema Alerts & Upcoming
                    </span>
                  </div>
                  <span className="text-[11px] font-mono text-zinc-400">
                    {unreadNotifs.length} new
                  </span>
                </div>

                <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1">
                  {notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => {
                        onMarkNotificationRead(n.id);
                        if (n.movieId) {
                          const m = allMovies.find(mov => mov.id === n.movieId);
                          if (m) {
                            onSelectMovie(m);
                            setShowNotifications(false);
                          }
                        }
                      }}
                      className={`p-3 rounded-xl border text-left transition-all cursor-pointer ${
                        n.read
                          ? 'bg-white/5 border-white/5 text-zinc-400'
                          : 'bg-[#E50914]/10 border-[#E50914]/40 text-white'
                      }`}
                    >
                      <div className="flex items-center justify-between text-xs font-semibold mb-1">
                        <span className={n.read ? 'text-zinc-300' : 'text-white'}>{n.title}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{n.timestamp}</span>
                      </div>
                      <p className="text-[11px] text-zinc-400 leading-snug">{n.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sound Design Toggle */}
          <button
            onClick={onToggleSound}
            title={soundEnabled ? 'Mute Sound (M)' : 'Enable Sound (M)'}
            className={`p-2 rounded-full border transition-all cursor-pointer ${
              soundEnabled
                ? 'bg-[#E50914]/15 border-[#E50914]/50 text-[#FF2E56]'
                : 'bg-white/5 border-white/10 text-zinc-500 hover:text-zinc-300'
            }`}
          >
            {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
          </button>

          {/* Profile Avatar & Menu */}
          <div className="relative">
            <button
              onClick={() => {
                soundEffects.click(soundEnabled);
                setShowProfileMenu(!showProfileMenu);
                setShowNotifications(false);
              }}
              className="w-8 h-8 rounded-lg overflow-hidden border border-white/20 hover:border-[#E50914] transition-colors cursor-pointer bg-gradient-to-br from-red-600 to-indigo-800 flex items-center justify-center"
            >
              <span className="font-bold text-white text-xs">AJ</span>
            </button>

            {showProfileMenu && (
              <div className="absolute right-0 mt-3 w-56 rounded-2xl bg-[#14141B]/95 border border-white/15 p-2 shadow-2xl backdrop-blur-xl z-50">
                <div className="px-3 py-2 border-b border-white/10 mb-1">
                  <div className="text-xs font-bold text-white">Curator Profile</div>
                  <div className="text-[10px] text-zinc-400 truncate">ajmunna.nsu@gmail.com</div>
                </div>

                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onOpenTaste();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Compass className="w-4 h-4 text-[#FF2E56]" />
                  <span>My Taste Profile & Radar</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onOpenExtension();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Server className="w-4 h-4 text-emerald-400" />
                  <span>Media Servers ({serverCount})</span>
                </button>

                <button
                  onClick={() => {
                    soundEffects.click(soundEnabled);
                    onOpenSettings();
                    setShowProfileMenu(false);
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 rounded-xl text-xs text-zinc-300 hover:text-white hover:bg-white/5 transition-all text-left cursor-pointer"
                >
                  <Settings className="w-4 h-4 text-zinc-400" />
                  <span>Settings & API Keys</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
