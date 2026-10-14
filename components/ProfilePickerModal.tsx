'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';
import { ProfileId } from '@/lib/types';
import { Lock, ShieldCheck, UserCheck, X, KeyRound, Sparkles } from 'lucide-react';

interface ProfilePickerModalProps {
  isOpen: boolean;
  onClose?: () => void;
  canDismiss?: boolean;
}

export function ProfilePickerModal({
  isOpen,
  onClose,
  canDismiss = true,
}: ProfilePickerModalProps) {
  const {
    actorProfileId,
    selectActorProfile,
    getProfileLastStreakPreview,
    checkVisalPin,
    visalPinRequired,
  } = useStreakly();

  const [selectedTarget, setSelectedTarget] = useState<ProfileId | null>(null);
  const [pinInput, setPinInput] = useState<string>('');
  const [pinError, setPinError] = useState<string | null>(null);

  if (!isOpen) return null;

  const visalStreak = getProfileLastStreakPreview('visal');
  const poojaStreak = getProfileLastStreakPreview('pooja');

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
      soundEngine.playIntroSignature(true);
      onClose?.();
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
      soundEngine.playIntroSignature(true);
      setSelectedTarget(null);
      setPinInput('');
      onClose?.();
    } else {
      setPinError('Failed to unlock master profile.');
      triggerHaptic('warning');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xl animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg glass-card rounded-4xl p-6 sm:p-8 shadow-2xl border border-white/20">
        {canDismiss && onClose && (
          <button
            onClick={onClose}
            aria-label="Close profile switcher"
            className="absolute top-5 right-5 p-2 rounded-full bg-white/10 text-white/70 hover:text-white hover:bg-white/20 transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        )}

        {/* Modal Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-3xl accent-gradient-bg shadow-glow shadow-accent-glow text-white text-2xl font-bold mb-3">
            <Sparkles className="w-7 h-7" />
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Who is tracking today?
          </h2>
          <p className="text-sm text-white/60 mt-1">
            Select your space to view habits, log daily progress, and care for Bloop.
          </p>
        </div>

        {/* PIN Entry for Visal if required */}
        {selectedTarget === 'visal' ? (
          <div className="space-y-4 animate-in zoom-in-95 duration-150">
            <div className="p-4 rounded-2xl bg-white/5 border border-white/10 text-center">
              <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-blue-500/20 text-blue-400 mb-2">
                <KeyRound className="w-6 h-6" />
              </div>
              <h3 className="font-semibold text-white">Enter Visal’s Master PIN</h3>
              <p className="text-xs text-white/60 mt-0.5">
                4-digit PIN is enabled for master access.
              </p>

              <div className="mt-4 flex justify-center">
                <input
                  type="password"
                  maxLength={6}
                  value={pinInput}
                  onChange={(e) => {
                    setPinInput(e.target.value);
                    setPinError(null);
                  }}
                  onKeyDown={(e) => e.key === 'Enter' && handleVerifyPin()}
                  placeholder="••••"
                  autoFocus
                  className="w-40 text-center tracking-widest text-2xl py-2 px-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/30 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              {pinError && (
                <p className="text-xs text-rose-400 mt-2 font-medium">{pinError}</p>
              )}

              <div className="mt-5 flex gap-2 justify-center">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedTarget(null);
                    setPinInput('');
                    setPinError(null);
                  }}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-white/70 hover:text-white hover:bg-white/10 transition-all"
                >
                  Back
                </button>
                <button
                  type="button"
                  onClick={handleVerifyPin}
                  className="px-6 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-500 shadow-lg shadow-blue-600/30 transition-all active:scale-95"
                >
                  Unlock Space
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* Profile Cards */
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Visal Card */}
            <button
              onClick={() => handleSelectProfile('visal')}
              className="group relative flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b from-blue-500/10 to-violet-600/10 hover:from-blue-500/20 hover:to-violet-600/20 border border-blue-500/30 hover:border-blue-400 shadow-lg hover:shadow-blue-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <div className="relative mb-3">
                <span className="text-5xl group-hover:scale-110 transition-transform block">
                  ⚡
                </span>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-blue-500 text-[10px] font-black text-white uppercase tracking-wider">
                  Master
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-blue-300 transition-colors">
                Visal
              </h3>
              <p className="text-xs text-blue-200/70 mt-1 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" /> Full Access
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-500/30 text-blue-300 text-xs font-semibold">
                🔥 {visalStreak} Day Streak
              </div>
              {visalPinRequired && (
                <div className="mt-2 text-[11px] text-white/50 flex items-center gap-1">
                  <Lock className="w-3 h-3" /> PIN Protected
                </div>
              )}
            </button>

            {/* Pooja Card */}
            <button
              onClick={() => handleSelectProfile('pooja')}
              className="group relative flex flex-col items-center text-center p-6 rounded-3xl bg-gradient-to-b from-rose-500/10 to-amber-500/10 hover:from-rose-500/20 hover:to-amber-500/20 border border-rose-500/30 hover:border-rose-400 shadow-lg hover:shadow-rose-500/20 transition-all duration-300 hover:scale-[1.02] active:scale-95"
            >
              <div className="relative mb-3">
                <span className="text-5xl group-hover:scale-110 transition-transform block">
                  🌸
                </span>
                <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-full bg-rose-500 text-[10px] font-black text-white uppercase tracking-wider">
                  Member
                </span>
              </div>
              <h3 className="text-xl font-bold text-white group-hover:text-rose-300 transition-colors">
                Pooja
              </h3>
              <p className="text-xs text-rose-200/70 mt-1 flex items-center gap-1 font-medium">
                <UserCheck className="w-3.5 h-3.5" /> Personal Space
              </p>
              <div className="mt-4 px-3 py-1 rounded-full bg-rose-500/20 border border-rose-500/30 text-rose-300 text-xs font-semibold">
                🔥 {poojaStreak} Day Streak
              </div>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
