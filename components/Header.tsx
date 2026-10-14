'use client';

import React from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import {
  Flame,
  Moon,
  Sun,
  Volume2,
  VolumeX,
  UserCheck,
  ShieldCheck,
  Settings,
  RefreshCw,
  Wifi,
  WifiOff,
  ArrowLeftRight,
} from 'lucide-react';

interface HeaderProps {
  onOpenSettings: () => void;
  onOpenProfilePicker: () => void;
  onOpenMasterPanel: () => void;
  onReplayIntro?: () => void;
}

export function Header({
  onOpenSettings,
  onOpenProfilePicker,
  onOpenMasterPanel,
  onReplayIntro,
}: HeaderProps) {
  const {
    actorProfileId,
    viewingProfileId,
    profile,
    streakSummary,
    storageMode,
    isOnline,
    isSyncing,
    switchViewingProfile,
    updateSettings,
    refreshNow,
    isMasterModeViewingOther,
  } = useStreakly();

  const isDark = (profile?.settings?.appearance ?? 'dark') === 'dark';
  const soundEnabled = profile?.settings?.sound ?? true;

  const toggleSound = () => {
    const next = !soundEnabled;
    updateSettings({ sound: next });
    if (next) {
      soundEngine.playPetChirp('happy', true);
    }
  };

  const toggleAppearance = () => {
    updateSettings({ appearance: isDark ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-30 w-full backdrop-blur-2xl border-b border-white/10 px-4 py-3 sm:px-6 transition-all duration-300">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
        {/* Left: Brand & Profile Identity */}
        <div className="flex items-center gap-3">
          <div
            onClick={onReplayIntro}
            className="relative flex items-center justify-center w-10 h-10 rounded-2xl accent-gradient-bg shadow-glow shadow-accent-glow text-white font-black text-xl cursor-pointer hover:scale-105 active:scale-95 transition-transform"
            title="Switch Profile & Replay Intro"
          >
            <Flame className="w-5 h-5 fill-current animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span
                onClick={onReplayIntro}
                className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent cursor-pointer"
                title="Streakly Dashboard"
              >
                Streakly
              </span>
              <span className="hidden sm:inline-block text-[10px] font-semibold tracking-wider uppercase px-2 py-0.5 rounded-full bg-white/10 text-white/80 border border-white/10">
                v1.0
              </span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              {actorProfileId === 'visal' && (
                <span className="text-blue-400 font-medium flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> Master
                </span>
              )}
              {actorProfileId === 'pooja' && (
                <span className="text-rose-400 font-medium flex items-center gap-1">
                  <UserCheck className="w-3 h-3" /> Member
                </span>
              )}
              <span>•</span>
              <span className="flex items-center gap-1">
                {isOnline ? (
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    <Wifi className="w-3 h-3" />
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-amber-400">
                    <WifiOff className="w-3 h-3" /> Offline
                  </span>
                )}
              </span>
              <span className="hidden md:inline">•</span>
              <span className="hidden md:inline text-[11px] opacity-75">
                {storageMode === 'redis' ? 'Cloud Redis' : 'Local Fallback'}
              </span>
            </div>
          </div>
        </div>

        {/* Center Banner: Visal viewing Pooja's space notification */}
        {isMasterModeViewingOther && (
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/20 border border-amber-500/30 text-amber-200 text-xs font-medium animate-pulse">
            <span>Viewing Pooja’s space as Master 👑</span>
            <button
              onClick={() => switchViewingProfile('visal')}
              className="ml-1 underline text-white hover:text-amber-100 font-semibold"
            >
              Switch to my space
            </button>
          </div>
        )}

        {/* Right: Actions, Profile Switcher & Settings */}
        <div className="flex items-center gap-1 sm:gap-2">
          {/* Quick Manual Refresh button */}
          <button
            onClick={() => refreshNow()}
            disabled={isSyncing}
            aria-label="Refresh data"
            className="hidden sm:flex p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95 disabled:opacity-50"
            title="Force refresh"
          >
            <RefreshCw className={`w-4 h-4 ${isSyncing ? 'animate-spin text-accent-primary' : ''}`} />
          </button>

          {/* Sound Toggle */}
          <button
            onClick={toggleSound}
            aria-label={soundEnabled ? 'Mute sound effects' : 'Enable sound effects'}
            className="p-1.5 sm:p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title={soundEnabled ? 'Sound Enabled' : 'Sound Muted'}
          >
            {soundEnabled ? (
              <Volume2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <VolumeX className="w-4 h-4 text-muted-foreground" />
            )}
          </button>

          {/* Dark / Light Toggle */}
          <button
            onClick={toggleAppearance}
            aria-label="Toggle dark/light mode"
            className="p-1.5 sm:p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
            title={isDark ? 'Dark Appearance' : 'Light Appearance'}
          >
            {isDark ? (
              <Moon className="w-4 h-4 text-violet-300" />
            ) : (
              <Sun className="w-4 h-4 text-amber-400" />
            )}
          </button>

          {/* Master Panel Shortcut (Only for Visal) */}
          {actorProfileId === 'visal' && (
            <button
              onClick={onOpenMasterPanel}
              className="hidden md:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-500/20 text-blue-300 hover:bg-blue-500/30 border border-blue-500/30 text-xs font-semibold transition-all active:scale-95"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Master Hub</span>
            </button>
          )}

          {/* Profile Switch Button */}
          <button
            onClick={onOpenProfilePicker}
            className="flex items-center gap-1.5 px-2 sm:px-3 py-1.5 rounded-xl glass-card hover:bg-white/15 text-xs font-medium text-white transition-all active:scale-95 border border-white/10"
            title="Switch Profile Space"
          >
            <span className="text-base leading-none">
              {profile?.avatarEmoji || (viewingProfileId === 'pooja' ? '🌸' : '⚡')}
            </span>
            <span className="hidden sm:inline font-semibold">{profile?.displayName || 'Profile'}</span>
            <ArrowLeftRight className="w-3 h-3 text-white/50" />
          </button>

          {/* Settings Modal Toggle */}
          <button
            onClick={onOpenSettings}
            aria-label="Open settings"
            className="p-1.5 sm:p-2 rounded-xl text-white/70 hover:text-white hover:bg-white/10 transition-all active:scale-95"
          >
            <Settings className="w-4 h-4" />
          </button>
        </div>
      </div>
    </header>
  );
}
