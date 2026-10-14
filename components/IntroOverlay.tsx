'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';
import { ProfileId } from '@/lib/types';
import { Flame, ShieldCheck, UserCheck, Lock, Sparkles } from 'lucide-react';

interface NetflixIntroOverlayProps {
  onEnter: () => void;
}

export function IntroOverlay({ onEnter }: NetflixIntroOverlayProps) {
  const {
    markIntroSeen,
    selectActorProfile,
    getProfileLastStreakPreview,
    checkVisalPin,
    visalPinRequired,
  } = useStreakly();

  // Phase: 'ready' (tap to ignite with audio) -> 'animating' (Netflix ribbons + TA-DUM) -> 'profile-pick' ("Who is tracking today?")
  const [phase, setPhase] = useState<'ready' | 'animating' | 'profile-pick'>('ready');
  const [selectedTarget, setSelectedTarget] = useState<ProfileId | null>(null);
  const [pinInput, setPinInput] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  const visalStreak = getProfileLastStreakPreview('visal');
  const poojaStreak = getProfileLastStreakPreview('pooja');

  const startNetflixSequence = () => {
    soundEngine.unlock();
    soundEngine.playNetflixTaDum(true);
    triggerHaptic('celebration');
    setPhase('animating');

    // After 2.4s of ribbon zoom and spectrum fly-through, transition to "Who is tracking today?"
    setTimeout(() => {
      setPhase('profile-pick');
    }, 2400);
  };

  const handleSelectProfile = (profileId: ProfileId) => {
    setPinError(null);
    if (profileId === 'visal' && visalPinRequired) {
      setSelectedTarget('visal');
      setPinInput('');
      return;
    }

    const success = selectActorProfile(profileId);
    if (success) {
      triggerHaptic('success');
      soundEngine.playTone('pop', true);
      markIntroSeen();
      onEnter();
    }
  };

  const handleVerifyPin = () => {
    if (!checkVisalPin(pinInput)) {
      setPinError('Incorrect PIN. Please try again.');
      triggerHaptic('warning');
      return;
    }

    const success = selectActorProfile('visal', pinInput);
    if (success) {
      triggerHaptic('success');
      soundEngine.playTone('pop', true);
      markIntroSeen();
      onEnter();
    } else {
      setPinError('Failed to unlock master profile.');
      triggerHaptic('warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black select-none overflow-hidden font-sans">
      {/* =========================================================================
          STAGE 1: TAP TO START (Ensures iOS AudioContext unlocks without restriction)
         ========================================================================= */}
      {phase === 'ready' && (
        <div className="flex flex-col items-center justify-center p-6 text-center animate-in fade-in duration-300 max-w-sm">
          <div className="relative mb-6">
            <div className="w-24 h-24 rounded-3xl bg-gradient-to-tr from-rose-600 via-red-500 to-amber-500 flex items-center justify-center shadow-[0_0_50px_rgba(244,63,94,0.6)] animate-pulse">
              <Flame className="w-12 h-12 text-white fill-current" />
            </div>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-wider uppercase mb-2">
            Streakly
          </h1>
          <p className="text-xs text-rose-300/80 uppercase tracking-widest font-semibold mb-8">
            Habits • Streaks • Companion
          </p>

          <button
            onClick={startNetflixSequence}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-red-600 via-rose-600 to-red-700 text-white font-extrabold text-base tracking-wide shadow-2xl hover:scale-105 active:scale-95 transition-all text-center"
          >
            Launch Streakly
          </button>
        </div>
      )}

      {/* =========================================================================
          STAGE 2: NETFLIX "TA-DUM" SPECTRUM RIBBON ANIMATION
         ========================================================================= */}
      {phase === 'animating' && (
        <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
          {/* Deep ambient red / ruby backlight */}
          <div className="absolute inset-0 bg-radial-gradient from-red-950/70 via-black to-black animate-pulse" />

          {/* Skip Button */}
          <button
            onClick={() => setPhase('profile-pick')}
            className="absolute top-6 right-6 z-30 px-3.5 py-1.5 rounded-full bg-white/10 hover:bg-white/20 text-white/80 text-xs font-semibold backdrop-blur-md transition-all active:scale-95"
          >
            Skip
          </button>

          {/* 3D Netflix-Style Expanding Flame Ribbon */}
          <div className="relative flex flex-col items-center justify-center z-10 animate-netflix-zoom">
            {/* The Iconic Glowing Flame S Ribbon */}
            <div className="relative w-32 h-44 sm:w-40 sm:h-52 flex items-center justify-center">
              {/* Left Vertical Ribbon */}
              <div className="absolute left-4 top-0 w-8 h-full bg-gradient-to-b from-red-600 via-rose-500 to-red-800 shadow-[0_0_35px_rgba(225,29,72,0.9)] rounded-sm" />
              {/* Diagonal Ribbon */}
              <div className="absolute left-4 top-0 w-8 h-full bg-gradient-to-b from-rose-500 via-red-600 to-rose-700 shadow-[0_0_40px_rgba(244,63,94,0.9)] rounded-sm origin-top-left rotate-[28deg] scale-y-[1.12] z-10" />
              {/* Right Vertical Ribbon */}
              <div className="absolute right-4 top-0 w-8 h-full bg-gradient-to-b from-red-700 via-rose-500 to-red-900 shadow-[0_0_35px_rgba(225,29,72,0.9)] rounded-sm z-20" />

              {/* Central Glowing Sparkle */}
              <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none">
                <Sparkles className="w-16 h-16 text-white drop-shadow-[0_0_20px_#ffffff] animate-spin-slow" />
              </div>
            </div>

            <div className="mt-6 text-xl sm:text-2xl font-black uppercase tracking-[0.4em] text-red-500 drop-shadow-[0_0_15px_rgba(239,68,68,0.8)]">
              STREAKLY
            </div>
          </div>

          {/* Vertical Spectrum Laser Ribbons (Shooting Past Camera) */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-around opacity-80 animate-spectrum-burst">
            <div className="w-1 h-full bg-gradient-to-b from-transparent via-cyan-400 to-transparent blur-[1px]" />
            <div className="w-1.5 h-full bg-gradient-to-b from-transparent via-rose-500 to-transparent blur-[1px]" />
            <div className="w-1 h-full bg-gradient-to-b from-transparent via-purple-500 to-transparent blur-[1px]" />
            <div className="w-2 h-full bg-gradient-to-b from-transparent via-amber-400 to-transparent blur-[1px]" />
            <div className="w-1 h-full bg-gradient-to-b from-transparent via-indigo-400 to-transparent blur-[1px]" />
            <div className="w-2.5 h-full bg-gradient-to-b from-transparent via-red-600 to-transparent blur-[2px]" />
            <div className="w-1 h-full bg-gradient-to-b from-transparent via-fuchsia-400 to-transparent blur-[1px]" />
            <div className="w-1.5 h-full bg-gradient-to-b from-transparent via-emerald-400 to-transparent blur-[1px]" />
            <div className="w-1 h-full bg-gradient-to-b from-transparent via-blue-400 to-transparent blur-[1px]" />
          </div>
        </div>
      )}

      {/* =========================================================================
          STAGE 3: NETFLIX "WHO IS TRACKING TODAY?" PROFILE SELECTOR
         ========================================================================= */}
      {phase === 'profile-pick' && (
        <div className="relative z-20 flex flex-col items-center justify-center p-6 w-full max-w-lg animate-in zoom-in-95 fade-in duration-500">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight mb-2 text-center">
            Who is tracking today?
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mb-8 text-center">
            Select your profile to continue your rituals & care for Bloop.
          </p>

          {/* Profile Cards (Netflix Grid) */}
          <div className="grid grid-cols-2 gap-4 sm:gap-6 w-full max-w-sm mb-6">
            {/* Visal Profile Card */}
            <div
              onClick={() => handleSelectProfile('visal')}
              className="cursor-pointer group flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-blue-500/30 hover:border-blue-400/80 hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-blue-950/40 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-blue-500/20 text-blue-300 border border-blue-400/30 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3" />
                <span>Master</span>
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg my-2 group-hover:shadow-[0_0_25px_rgba(59,130,246,0.6)] transition-shadow">
                ⚡
              </div>

              <span className="text-sm sm:text-base font-extrabold text-white group-hover:text-blue-300 transition-colors">
                Visal
              </span>

              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{visalStreak}d streak</span>
              </span>
            </div>

            {/* Pooja Profile Card */}
            <div
              onClick={() => handleSelectProfile('pooja')}
              className="cursor-pointer group flex flex-col items-center p-4 sm:p-5 rounded-3xl bg-slate-900/80 border border-rose-500/30 hover:border-rose-400/80 hover:bg-slate-800/90 transition-all duration-300 hover:scale-105 active:scale-95 shadow-xl shadow-rose-950/40 relative overflow-hidden"
            >
              <div className="absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/20 text-rose-300 border border-rose-400/30 flex items-center gap-1">
                <UserCheck className="w-3 h-3" />
                <span>Member</span>
              </div>

              <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-tr from-rose-500 via-pink-600 to-amber-400 flex items-center justify-center text-3xl sm:text-4xl shadow-lg my-2 group-hover:shadow-[0_0_25px_rgba(244,63,94,0.6)] transition-shadow">
                🌸
              </div>

              <span className="text-sm sm:text-base font-extrabold text-white group-hover:text-rose-300 transition-colors">
                Pooja
              </span>

              <span className="text-[10px] text-amber-300 font-bold flex items-center gap-1 mt-1">
                <Flame className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{poojaStreak}d streak</span>
              </span>
            </div>
          </div>

          {/* Visal PIN Entry Modal (if PIN enabled) */}
          {selectedTarget === 'visal' && visalPinRequired && (
            <div className="w-full max-w-xs bg-slate-950/90 border border-blue-400/40 rounded-3xl p-4 sm:p-5 shadow-2xl animate-in zoom-in-95 duration-200 text-center">
              <div className="flex items-center justify-center gap-1.5 text-xs font-bold text-blue-300 mb-2">
                <Lock className="w-4 h-4" />
                <span>Master PIN Required</span>
              </div>
              <input
                type="password"
                maxLength={8}
                autoFocus
                placeholder="Enter PIN"
                value={pinInput}
                onChange={(e) => setPinInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                className="w-full text-center tracking-widest text-lg font-mono bg-white/10 border border-white/20 rounded-xl py-2 px-3 text-white placeholder-slate-500 focus:outline-none focus:border-blue-400 mb-2"
              />
              {pinError && <p className="text-[11px] text-rose-400 font-medium mb-2">{pinError}</p>}
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedTarget(null)}
                  className="flex-1 py-1.5 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  onClick={handleVerifyPin}
                  className="flex-1 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-xs font-bold text-white shadow-md active:scale-95"
                >
                  Unlock
                </button>
              </div>
            </div>
          )}

          <div className="mt-6 flex items-center gap-2 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            <span>Timezone: Asia/Colombo • Local & Cloud Sync</span>
          </div>
        </div>
      )}
    </div>
  );
}
