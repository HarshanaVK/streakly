'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { THEME_PRESETS, AVATAR_OPTIONS } from '@/config/theme';
import { BACKGROUND_CATEGORIES } from '@/config/backgrounds';
import { ThemePresetId, BackgroundCategory, PetSkin } from '@/lib/types';
import {
  Settings,
  X,
  Palette,
  Volume2,
  Lock,
  User,
  Sliders,
  Check,
  Sparkles,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const { profile, actorProfileId, updateSettings, renamePet } = useStreakly();

  const [pinInput, setPinInput] = useState(profile?.settings?.pin || '');
  const [displayName, setDisplayName] = useState(
    profile?.displayName || (actorProfileId === 'visal' ? 'Visal' : 'Pooja')
  );

  if (!isOpen || !profile) return null;

  const currentTheme = profile.settings.theme || 'electric-cobalt';
  const currentAppearance = profile.settings.appearance || 'dark';
  const currentBackground = profile.settings.backgroundCategory || 'auto';
  const currentThreshold = profile.settings.streakThreshold || 70;
  const currentSound = profile.settings.sound ?? true;
  const currentSkin = profile.pet.skin || 'classic-bloop';

  const handleSavePin = () => {
    updateSettings({ pin: pinInput.trim() ? pinInput.trim() : null });
  };

  const handleSaveDisplayName = (name: string) => {
    setDisplayName(name);
    updateSettings({ displayName: name });
  };

  const petSkins: { id: PetSkin; name: string; icon: string }[] = [
    { id: 'classic-bloop', name: 'Cobalt', icon: '💧' },
    { id: 'berry-bloop', name: 'Berry', icon: '🍓' },
    { id: 'mint-bloop', name: 'Mint', icon: '🍃' },
    { id: 'cosmic-bloop', name: 'Cosmic', icon: '🌌' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-xl glass-card rounded-4xl p-6 sm:p-8 shadow-2xl border border-white/20 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-white/10 text-accent-primary">
              <Settings className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                Preferences & Personalization
              </h2>
              <p className="text-xs text-white/60">
                Tailor appearance, streak mathematics, audio & security
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-6">
          {/* 1. Theme Presets */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Palette className="w-4 h-4 text-accent-primary" />
              <span>Color Themes</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
              {(Object.keys(THEME_PRESETS) as ThemePresetId[]).map((tKey) => {
                const preset = THEME_PRESETS[tKey];
                const isSelected = currentTheme === tKey;

                return (
                  <button
                    key={tKey}
                    onClick={() => updateSettings({ theme: tKey })}
                    className={`p-3 rounded-2xl border flex items-center gap-2.5 transition-all ${
                      isSelected
                        ? 'bg-white/15 border-white text-white shadow-lg'
                        : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                    }`}
                  >
                    <div
                      className="w-5 h-5 rounded-full flex-shrink-0 shadow-sm"
                      style={{ background: preset.gradient }}
                    />
                    <span className="text-xs font-semibold truncate">
                      {preset.name}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. Streak Threshold */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                <Sliders className="w-4 h-4 text-accent-primary" />
                <span>Streak Qualification Threshold</span>
              </label>
              <span className="text-xs font-mono font-bold text-accent-primary">
                {currentThreshold}% completed
              </span>
            </div>
            <p className="text-xs text-white/60 mb-3">
              Minimum daily habit completion rate required to maintain your streak.
            </p>
            <input
              type="range"
              min="50"
              max="100"
              step="5"
              value={currentThreshold}
              onChange={(e) =>
                updateSettings({ streakThreshold: Number(e.target.value) })
              }
              className="w-full accent-accent-primary cursor-pointer"
            />
          </div>

          {/* 3. Virtual Pet Bloop Customization */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <Sparkles className="w-4 h-4 text-accent-primary" />
              <span>Bloop Companion Skin</span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {petSkins.map((skin) => (
                <button
                  key={skin.id}
                  onClick={() =>
                    updateSettings({} as any) // update pet skin via mutate
                  }
                  className={`p-3 rounded-2xl border flex items-center justify-center gap-2 transition-all ${
                    currentSkin === skin.id
                      ? 'accent-gradient-bg text-white border-transparent shadow-md'
                      : 'bg-white/5 border-white/10 text-white/70 hover:bg-white/10'
                  }`}
                >
                  <span>{skin.icon}</span>
                  <span className="text-xs font-semibold">{skin.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* 4. Display Name & Avatar Emoji */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-muted-foreground mb-3 flex items-center gap-1.5">
              <User className="w-4 h-4 text-accent-primary" />
              <span>Profile Identity</span>
            </label>

            <div className="flex items-center gap-3 mb-3">
              <div className="flex-1">
                <input
                  type="text"
                  value={displayName}
                  onChange={(e) => handleSaveDisplayName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full px-3.5 py-2.5 rounded-2xl bg-white/10 border border-white/20 text-white text-sm focus:outline-none focus:ring-2 focus:ring-accent-primary"
                />
              </div>
            </div>

            {/* Avatar picker strip */}
            <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
              {AVATAR_OPTIONS.map((emoji) => (
                <button
                  key={emoji}
                  onClick={() => updateSettings({ avatarEmoji: emoji })}
                  className={`w-9 h-9 rounded-xl flex-shrink-0 flex items-center justify-center text-lg transition-all ${
                    profile.avatarEmoji === emoji
                      ? 'bg-white/25 border-2 border-accent-primary scale-110 shadow-md'
                      : 'bg-white/5 hover:bg-white/10 border border-white/10'
                  }`}
                >
                  {emoji}
                </button>
              ))}
            </div>
          </div>

          {/* 5. Master PIN Lock (Visal Only) */}
          {actorProfileId === 'visal' && (
            <div className="p-4 rounded-3xl bg-blue-500/10 border border-blue-500/20 space-y-2">
              <label className="text-xs font-bold text-blue-300 flex items-center gap-1.5">
                <Lock className="w-4 h-4" />
                <span>Visal’s Master 4-Digit Lock PIN</span>
              </label>
              <p className="text-xs text-white/60">
                Leave blank to disable PIN protection on profile switch.
              </p>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => setPinInput(e.target.value)}
                  placeholder="e.g. 1234"
                  className="w-36 px-3 py-2 rounded-xl bg-slate-900 border border-white/20 text-white text-sm tracking-widest text-center"
                />
                <button
                  onClick={handleSavePin}
                  className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white transition-all shadow-md"
                >
                  Save PIN
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
