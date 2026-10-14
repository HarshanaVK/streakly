'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';
import { triggerGlobalParticleBurst } from '@/components/ParticleFXOverlay';
import {
  Sparkles,
  Zap,
  Flame,
  Heart,
  Eye,
  CheckCircle2,
  Smile,
  Crown,
} from 'lucide-react';

export function VirtualPetBloop() {
  const {
    profile,
    petReaction,
    petSpeechBubble,
    triggerPetReaction,
    feedPet,
    gainPetXP,
    updateSettings,
    streakSummary,
  } = useStreakly();

  const [expression, setExpression] = useState<
    'normal' | 'happy' | 'starry' | 'curious' | 'focus' | 'sleepy' | 'dizzy' | 'wink'
  >('normal');
  const [mouthState, setMouthState] = useState<'smile' | 'joy' | 'curious'>('smile');
  const [bodyAnim, setBodyAnim] = useState<
    '' | 'pet-squish' | 'pet-jump' | 'pet-tilt' | 'pet-backflip' | 'pet-chew' | 'pet-dizzy' | 'pet-breathe'
  >('');
  const [moodBadgeText, setMoodBadgeText] = useState('Tracking Touch & Gaze');
  const [isBlinking, setIsBlinking] = useState(false);
  const [isDrowsy, setIsDrowsy] = useState(false);
  const [floatingXpText, setFloatingXpText] = useState<string | null>(null);
  const [levelUpModal, setLevelUpModal] = useState<{ level: number } | null>(null);

  // 3D Pointer Gaze Tracking
  const pointerTarget = useRef({ x: 0, y: 0 });
  const currentLook = useRef({ x: 0, y: 0 });
  const petStageRef = useRef<HTMLDivElement | null>(null);
  const pupilsRef = useRef<SVGGElement | null>(null);
  const faceRef = useRef<SVGGElement | null>(null);
  const earsRef = useRef<SVGGElement | null>(null);
  const expressionTimerRef = useRef<NodeJS.Timeout | null>(null);
  const idleSleepTimer = useRef<NodeJS.Timeout | null>(null);
  const rapidTapCount = useRef(0);
  const lastTapTimestamp = useRef(0);

  // Companion Level & XP (from profile.pet or defaults)
  const petName = profile?.pet?.name || 'Nova';
  const petLevel = profile?.pet?.level ?? 4;
  const petXp = profile?.pet?.xp ?? 65;
  const treats = profile?.pet?.treats ?? 8;
  const soundEnabled = profile?.settings?.sound ?? true;

  // Add XP helper with animated floating particle & Level-Up trigger
  const gainXP = useCallback((amount: number, reason?: string) => {
    setFloatingXpText(`+${amount} XP`);
    setTimeout(() => setFloatingXpText(null), 1500);

    const res = gainPetXP(amount, reason);
    if (res?.leveledUp) {
      setLevelUpModal({ level: res.nextLevel });
      setExpression('starry');
      setMouthState('joy');
      setBodyAnim('pet-backflip');
    }
  }, [gainPetXP]);

  // Idle Sleep Timer (soft nap if no touch for 22s)
  const wakeUpPet = useCallback(() => {
    if (isDrowsy) {
      setIsDrowsy(false);
      setExpression('normal');
      setMouthState('smile');
      setBodyAnim('pet-squish');
      setMoodBadgeText('Tracking Touch & Gaze');
      triggerHaptic('tap');
      soundEngine.playTone('pop', soundEnabled);
      triggerPetReaction('happy', '"Yaaawn~ Wide awake and ready for your next habit! ☀️"', 3500);
    }
    if (idleSleepTimer.current) clearTimeout(idleSleepTimer.current);
    idleSleepTimer.current = setTimeout(() => {
      setIsDrowsy(true);
      setExpression('sleepy');
      setMouthState('smile');
      setBodyAnim('pet-breathe');
      setMoodBadgeText('Sleeping Softly Zzz... 🌙');
    }, 22000);
  }, [isDrowsy, soundEnabled, triggerPetReaction]);

  // Track pointer across the viewport
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      pointerTarget.current = { x: e.clientX, y: e.clientY };
    };
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) {
        pointerTarget.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
      }
    };

    window.addEventListener('mousemove', onMove, { passive: true });
    window.addEventListener('touchstart', onTouch, { passive: true });
    window.addEventListener('touchmove', onTouch, { passive: true });

    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('touchstart', onTouch);
      window.removeEventListener('touchmove', onTouch);
    };
  }, []);

  // 60fps gaze animation loop
  useEffect(() => {
    let animId: number;

    const animateGaze = () => {
      if (petStageRef.current) {
        const rect = petStageRef.current.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const dx = pointerTarget.current.x - centerX;
        const dy = pointerTarget.current.y - centerY;
        const dist = Math.min(1, Math.hypot(dx, dy) / 320);
        const angle = Math.atan2(dy, dx);

        const targetX = Math.cos(angle) * dist * 9;
        const targetY = Math.sin(angle) * dist * 8;

        currentLook.current.x += (targetX - currentLook.current.x) * 0.14;
        currentLook.current.y += (targetY - currentLook.current.y) * 0.14;

        if (pupilsRef.current) {
          pupilsRef.current.setAttribute(
            'transform',
            `translate(${currentLook.current.x.toFixed(2)}, ${currentLook.current.y.toFixed(2)})`
          );
        }
        if (faceRef.current) {
          faceRef.current.setAttribute(
            'transform',
            `translate(${(currentLook.current.x * 0.55).toFixed(2)}, ${(
              currentLook.current.y * 0.45
            ).toFixed(2)})`
          );
        }
        if (earsRef.current) {
          earsRef.current.setAttribute(
            'transform',
            `translate(${(-currentLook.current.x * 0.35).toFixed(2)}, ${(
              -currentLook.current.y * 0.25
            ).toFixed(2)})`
          );
        }
      }

      animId = requestAnimationFrame(animateGaze);
    };

    animId = requestAnimationFrame(animateGaze);
    return () => cancelAnimationFrame(animId);
  }, []);

  // Natural periodic blinking (every 4.2s)
  useEffect(() => {
    const interval = setInterval(() => {
      if (expression === 'normal') {
        setIsBlinking(true);
        setTimeout(() => setIsBlinking(false), 140);
      }
    }, 4200);
    return () => clearInterval(interval);
  }, [expression]);

  // Synchronize with external Streakly petReaction bus
  useEffect(() => {
    if (!petReaction || petReaction === 'idle') return;

    if (petReaction === 'all-goals-dance' || petReaction === 'streak-flame' || petReaction === 'celebrate') {
      setExpression('starry');
      setMouthState('joy');
      setBodyAnim('pet-jump');
      setMoodBadgeText('Hyped & Celebrating! 🔥');
    } else if (petReaction === 'goal-cheer' || petReaction === 'eating-treat' || petReaction === 'happy') {
      setExpression('happy');
      setMouthState('joy');
      setBodyAnim('pet-squish');
      setMoodBadgeText('Feeling Loved 💕');
    } else if (petReaction === 'delete-gasp' || petReaction === 'undo' || petReaction === 'curious') {
      setExpression('curious');
      setMouthState('curious');
      setBodyAnim('pet-tilt');
      setMoodBadgeText('Curious Tilt ⊙_⊙');
    } else if (petReaction === 'focus') {
      setExpression('focus');
      setMouthState('smile');
      setBodyAnim('pet-squish');
      setMoodBadgeText('Cyber Focus Visor ON 🕶️');
    }

    if (expressionTimerRef.current) clearTimeout(expressionTimerRef.current);
    if (petReaction !== 'focus') {
      expressionTimerRef.current = setTimeout(() => {
        setExpression('normal');
        setMouthState('smile');
        setBodyAnim('');
        setMoodBadgeText('Tracking Touch & Gaze');
      }, 4200);
    }
  }, [petReaction]);

  // Mobile Touch Gestures & Timers
  const touchStartY = useRef<number | null>(null);
  const touchStartX = useRef<number | null>(null);
  const lastTouchTime = useRef<number>(0);
  const lastRubTime = useRef<number>(0);
  const lastTouchPos = useRef<{ x: number; y: number } | null>(null);
  const longPressTimer = useRef<NodeJS.Timeout | null>(null);
  const [flyingTreat, setFlyingTreat] = useState<{ x: number; y: number } | null>(null);

  // Interactive Action: Pet Nova
  const handlePetNova = (e?: React.MouseEvent | React.TouchEvent, customPhrase?: string) => {
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e) {
      if ('touches' in e && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches[0]) {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
      } else if ('clientX' in e) {
        x = e.clientX;
        y = e.clientY;
      }
    }

    triggerGlobalParticleBurst(x, y, 'hearts');
    triggerHaptic('purr');
    soundEngine.playTone('pet', soundEnabled);
    gainXP(10);

    const phrases = [
      '"Hehe, that tickles! Your touch makes my spirit glow! 💕"',
      '"^ ◡ ^ Best habit partner ever! Ready for the next goal?"',
      '"Purrrr~ Sending you 100% good focus vibes right now! ✨"',
      '"Feeling loved! Touching the screen gives me extra energy! 💖"',
    ];
    const phrase = customPhrase || phrases[Math.floor(Math.random() * phrases.length)];

    setExpression('happy');
    setMouthState('joy');
    setBodyAnim('pet-squish');
    setMoodBadgeText('Feeling Loved 💕');
    triggerPetReaction('happy', phrase, 4000);
  };

  // Interactive Action: Double-Tap Jump & Acrobatic Spin
  const handleDoubleTapJump = (x?: number, y?: number) => {
    wakeUpPet();
    const burstX = x ?? window.innerWidth / 2;
    const burstY = y ?? window.innerHeight / 2;

    triggerGlobalParticleBurst(burstX, burstY, 'celebrate');
    triggerHaptic('celebration');
    soundEngine.playTone('complete', soundEnabled);
    gainXP(20, 'Double-Tap 360 Spin');

    setExpression('starry');
    setMouthState('joy');
    setBodyAnim('pet-backflip');
    setMoodBadgeText('360° Star Flip! 🌟');
    triggerPetReaction('celebrate', '"Double-tap 360° backflip! 🌟✨ Feeling electric!"', 4000);
  };

  // Interactive Action: Hold Hug / Cuddle
  const handleLongPressHug = (x?: number, y?: number) => {
    wakeUpPet();
    const burstX = x ?? window.innerWidth / 2;
    const burstY = y ?? window.innerHeight / 2;

    triggerGlobalParticleBurst(burstX, burstY, 'hearts');
    triggerHaptic('purr');
    soundEngine.playPetChirp('happy', soundEnabled);
    gainXP(15, 'Cuddle Hug');

    setExpression('happy');
    setMouthState('joy');
    setBodyAnim('pet-squish');
    setMoodBadgeText('Cuddle Hug 🤗');
    triggerPetReaction('happy', '"Aww, warm cuddle hug! 🤗💖 Spirit completely recharged!"', 4500);
  };

  // Interactive Action: Feed Energy / Treat
  const handleFeedEnergy = (e?: React.MouseEvent | React.TouchEvent) => {
    wakeUpPet();
    let x = window.innerWidth / 2;
    let y = window.innerHeight / 2;

    if (e) {
      if ('touches' in e && e.touches[0]) {
        x = e.touches[0].clientX;
        y = e.touches[0].clientY;
      } else if ('changedTouches' in e && e.changedTouches[0]) {
        x = e.changedTouches[0].clientX;
        y = e.changedTouches[0].clientY;
      } else if ('clientX' in e) {
        x = e.clientX;
        y = e.clientY;
      }
    }

    // Trigger visual flying treat effect
    setFlyingTreat({ x, y });
    setTimeout(() => setFlyingTreat(null), 700);

    triggerGlobalParticleBurst(x, y, 'celebrate');
    triggerHaptic('celebration');
    soundEngine.playTone('complete', soundEnabled);
    feedPet();
    gainXP(20, 'Cosmic Star-Berry Treat');

    setExpression('starry');
    setMouthState('joy');
    setBodyAnim('pet-chew');
    setMoodBadgeText('Munching Energy! 🍓');
    triggerPetReaction('celebrate', '"Nom nom nom! Cosmic star-berry devoured! 🍓⚡ Energy at 110%!"', 4000);
  };

  // Touch Handlers for Mobile Screens (Rub, Double-Tap, Swipe, Long-Press)
  const handleTouchStart = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    wakeUpPet();
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const now = Date.now();

    touchStartX.current = clientX;
    touchStartY.current = clientY;
    lastTouchPos.current = { x: clientX, y: clientY };

    // Rapid Tap Tickle Combo Detection (4 rapid taps)
    if (now - lastTapTimestamp.current < 400) {
      rapidTapCount.current += 1;
      if (rapidTapCount.current >= 4) {
        rapidTapCount.current = 0;
        setExpression('dizzy');
        setMouthState('joy');
        setBodyAnim('pet-dizzy');
        setMoodBadgeText('Super Tickled! 🌀');
        triggerHaptic('purr');
        soundEngine.playTone('pop', soundEnabled);
        gainXP(12, 'Tickle Combo');
        triggerPetReaction('happy', '"Hehehe! That tickles so much! You found my secret tickle spot! 🌀😂"', 3800);
        return;
      }
    } else {
      rapidTapCount.current = 1;
    }
    lastTapTimestamp.current = now;

    // 1. Detect Double Tap (< 280ms between taps)
    if (now - lastTouchTime.current < 280) {
      if (longPressTimer.current) clearTimeout(longPressTimer.current);
      handleDoubleTapJump(clientX, clientY);
      lastTouchTime.current = 0;
      return;
    }
    lastTouchTime.current = now;

    // 2. Schedule Long-Press Cuddle (550ms hold)
    if (longPressTimer.current) clearTimeout(longPressTimer.current);
    longPressTimer.current = setTimeout(() => {
      handleLongPressHug(clientX, clientY);
    }, 550);

    // Initial pet tap
    handlePetNova(e);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!e.touches[0]) return;
    const clientX = e.touches[0].clientX;
    const clientY = e.touches[0].clientY;
    const now = Date.now();

    // If finger moves more than 10px, cancel long press hold
    if (touchStartY.current !== null && touchStartX.current !== null) {
      const dist = Math.hypot(clientX - touchStartX.current, clientY - touchStartY.current);
      if (dist > 10 && longPressTimer.current) {
        clearTimeout(longPressTimer.current);
        longPressTimer.current = null;
      }
    }

    // 3. Detect Continuous Rubbing / Scratching (every 170ms)
    if (lastTouchPos.current && now - lastRubTime.current > 170) {
      const moveDist = Math.hypot(clientX - lastTouchPos.current.x, clientY - lastTouchPos.current.y);
      if (moveDist > 12) {
        lastRubTime.current = now;
        triggerGlobalParticleBurst(clientX, clientY, 'hearts');
        triggerHaptic('purr');
        soundEngine.playTone('pet', soundEnabled);
        gainXP(2);
        setBodyAnim('pet-squish');
        setMoodBadgeText('Purring happily~ 💕');
      }
    }

    lastTouchPos.current = { x: clientX, y: clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (longPressTimer.current) {
      clearTimeout(longPressTimer.current);
      longPressTimer.current = null;
    }

    if (touchStartY.current !== null && e.changedTouches[0]) {
      const diffY = touchStartY.current - e.changedTouches[0].clientY;
      // 4. If swiped up by > 45px, feed treat!
      if (diffY > 45) {
        handleFeedEnergy(e);
      }
      touchStartY.current = null;
      touchStartX.current = null;
    }
  };

  // Interactive Buttons: Focus Mode
  const handleFocusMode = () => {
    triggerHaptic('tap');
    soundEngine.playTone('pop', soundEnabled);
    gainXP(5);

    setExpression('focus');
    setMouthState('smile');
    setBodyAnim('pet-squish');
    setMoodBadgeText('Cyber Focus Visor ON 🕶️');
    triggerPetReaction('focus', '"🕶️ Focus Visor engaged! Distractions blocked—let’s lock in on your tasks!"', 4000);
  };

  // Interactive Buttons: Vibe Check
  const handleVibeCheck = () => {
    triggerHaptic('tap');
    soundEngine.playTone('pop', soundEnabled);
    const rate = streakSummary?.todayCompletionRate ?? 0;

    if (rate >= 80) {
      setExpression('starry');
      setMouthState('joy');
      setBodyAnim('pet-jump');
      triggerPetReaction(
        'celebrate',
        `"Vibe Check: ELITE! 🔥 You've crushed ${rate}% of today's rituals. Absolute legend!"`,
        4500
      );
    } else if (rate >= 40) {
      setExpression('happy');
      setMouthState('joy');
      setBodyAnim('pet-squish');
      triggerPetReaction(
        'happy',
        `"Vibe Check: Solid momentum (${rate}% done)! Check off 1 more habit to ignite a flame streak! 🚀"`,
        4500
      );
    } else {
      setExpression('focus');
      setMouthState('smile');
      setBodyAnim('pet-tilt');
      triggerPetReaction(
        'focus',
        `"Vibe Check: Fresh runway ahead! Tap your easiest habit first to build momentum! ✨"`,
        4500
      );
    }
  };

  // Dynamic Aura Glow
  const getAuraColor = () => {
    if (expression === 'happy') {
      return 'from-rose-500/40 via-pink-500/30 to-amber-400/30';
    }
    if (expression === 'starry') {
      return 'from-emerald-400/45 via-cyan-400/35 to-amber-400/40';
    }
    if (expression === 'focus') {
      return 'from-cyan-400/50 via-blue-500/40 to-indigo-600/40';
    }
    return 'from-cyan-500/30 via-indigo-500/25 to-fuchsia-500/30';
  };

  const todayRate = streakSummary?.todayCompletionRate ?? 0;

  return (
    <div className="relative w-full rounded-4xl p-5 sm:p-7 glass-card border border-white/15 shadow-xl flex flex-col justify-between overflow-hidden card-shine">
      {/* Ambient Reactive Aura Glow */}
      <div
        className={`absolute -top-16 left-1/2 -translate-x-1/2 w-80 h-80 rounded-full bg-gradient-to-tr ${getAuraColor()} blur-3xl pointer-events-none transition-all duration-700`}
      />

      {/* Full-Screen Companion Level-Up Celebration Modal */}
      {levelUpModal && (
        <div className="absolute inset-0 z-40 bg-slate-950/95 backdrop-blur-2xl rounded-4xl p-6 flex flex-col items-center justify-center text-center animate-in zoom-in-95 fade-in duration-300 border border-amber-400/50 shadow-2xl">
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-tr from-amber-400 via-orange-500 to-yellow-300 flex items-center justify-center text-4xl shadow-[0_0_40px_rgba(251,191,36,0.9)] mb-3 animate-bounce">
            👑
          </div>
          <span className="text-xs font-black uppercase tracking-widest text-amber-300">
            Resonance Breakthrough!
          </span>
          <h3 className="text-2xl sm:text-3xl font-black text-white mt-1 mb-1">
            {petName} Reached Level {levelUpModal.level}!
          </h3>
          <p className="text-xs text-slate-200 max-w-xs mb-5">
            Your daily consistency unlocked <span className="font-bold text-amber-300">+3 Cosmic Star-Berries</span> and boosted spirit radiance! 🍓✨
          </p>
          <button
            onClick={() => setLevelUpModal(null)}
            className="px-8 py-3 rounded-full bg-gradient-to-r from-amber-400 to-orange-500 text-slate-950 font-black text-xs sm:text-sm shadow-xl hover:brightness-110 active:scale-95 transition-all"
          >
            Claim Rewards & Continue
          </button>
        </div>
      )}

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-8 items-center">
        {/* Left (Desktop 5 cols) / Top (Mobile): Pet Avatar Stage & Speech Bubble */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center">
          {/* Live Speech Bubble */}
          <div className="w-full max-w-sm min-h-[46px] flex items-center justify-center mb-3">
            {petSpeechBubble ? (
              <div className="w-full px-4 py-2.5 rounded-2xl bg-white/95 text-slate-900 font-extrabold text-xs sm:text-sm shadow-xl border border-white/40 text-center animate-in zoom-in-95 duration-200">
                {petSpeechBubble}
              </div>
            ) : (
              <div className="px-3.5 py-1.5 rounded-full bg-black/40 border border-white/10 text-[11px] font-medium text-white/70 text-center backdrop-blur-md">
                Touch anywhere on screen—I follow your gaze! ✨
              </div>
            )}
          </div>

          {/* Interactive Spirit Pet Hitbox */}
          <div
            ref={petStageRef}
            onClick={handlePetNova}
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{ touchAction: 'none' }}
            className="relative w-44 h-44 sm:w-48 sm:h-48 flex flex-col items-center justify-center cursor-pointer select-none group my-1 touch-manipulation active:scale-95 transition-transform"
            title="Rub to pet • Double-tap to jump • Swipe up to feed • Hold to hug!"
          >
            {/* Drifting Sleep Bubbles */}
            {isDrowsy && (
              <div className="absolute -top-2 right-4 pointer-events-none flex flex-col items-center animate-bounce z-20">
                <span className="text-xs font-bold text-cyan-300 opacity-90">z</span>
                <span className="text-sm font-extrabold text-indigo-300 opacity-80 -mt-1 ml-2">Z</span>
                <span className="text-base font-black text-rose-300 opacity-70 -mt-1 ml-4">Z</span>
              </div>
            )}

            {/* Flying Treat Animation */}
            {flyingTreat && (
              <div
                className="absolute z-20 pointer-events-none animate-bounce text-2xl transition-all duration-500"
                style={{ bottom: '20px' }}
              >
                🍓
              </div>
            )}

            {/* Orbit Rings with Rotating Satellite Orb */}
            <div className="absolute inset-1 rounded-full border border-white/10 animate-spin-slow pointer-events-none">
              <div className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee] absolute -top-1 left-1/2 -translate-x-1/2" />
            </div>
            <div className="absolute inset-5 rounded-full border border-dashed border-white/10 pointer-events-none" />

            {/* NOVA SVG SPIRIT COMPANION */}
            <div
              className={`relative transition-transform duration-300 will-change-transform ${
                bodyAnim || 'animate-float-slow'
              }`}
            >
              <svg
                viewBox="0 0 220 220"
                className="w-36 h-36 sm:w-44 sm:h-44 drop-shadow-[0_18px_28px_rgba(56,189,248,0.32)]"
              >
                <defs>
                  <radialGradient id="novaBodyGrad" cx="38%" cy="30%" r="70%">
                    <stop offset="0%" stopColor="#a5f3fc" />
                    <stop offset="45%" stopColor="#38bdf8" />
                    <stop offset="100%" stopColor="#4f46e5" />
                  </radialGradient>
                  <linearGradient id="novaGlassShine" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#ffffff" stopOpacity="0.65" />
                    <stop offset="40%" stopColor="#ffffff" stopOpacity="0.08" />
                    <stop offset="100%" stopColor="#ffffff" stopOpacity="0" />
                  </linearGradient>
                  <radialGradient id="cheekBlush" cx="50%" cy="50%" r="50%">
                    <stop offset="0%" stopColor="#fb7185" stopOpacity="0.85" />
                    <stop offset="100%" stopColor="#fb7185" stopOpacity="0" />
                  </radialGradient>
                </defs>

                {/* Antenna with Pulsing Glow Orb */}
                <g style={{ transformOrigin: '110px 45px' }}>
                  <path
                    d="M110 48 Q110 25 124 18"
                    stroke="url(#novaBodyGrad)"
                    strokeWidth="5"
                    strokeLinecap="round"
                    fill="none"
                  />
                  <circle cx="126" cy="17" r="7" fill="#fde047" className="animate-pulse" />
                </g>

                {/* Cute Floating Ears / Wings */}
                <g ref={earsRef}>
                  <ellipse
                    cx="42"
                    cy="96"
                    rx="16"
                    ry="26"
                    transform="rotate(-24 42 96)"
                    fill="url(#novaBodyGrad)"
                  />
                  <ellipse
                    cx="178"
                    cy="96"
                    rx="16"
                    ry="26"
                    transform="rotate(24 178 96)"
                    fill="url(#novaBodyGrad)"
                  />
                </g>

                {/* Main Squishy Spirit Body */}
                <path
                  d="M110 42 C158 42, 184 74, 184 118 C184 162, 156 184, 110 184 C64 184, 36 162, 36 118 C36 74, 62 42, 110 42 Z"
                  fill="url(#novaBodyGrad)"
                  stroke="rgba(255,255,255,0.45)"
                  strokeWidth="2.5"
                />

                {/* Specular Top Glass Reflection */}
                <ellipse cx="110" cy="72" rx="52" ry="26" fill="url(#novaGlassShine)" />

                {/* Crown on 100% completion */}
                {expression === 'starry' && (
                  <path
                    d="M86 42 L94 26 L110 38 L126 26 L134 42 Z"
                    fill="#fde047"
                    stroke="#d97706"
                    strokeWidth="2"
                    className="animate-bounce"
                  />
                )}

                {/* Face Group (Moves with 3D Gaze Tracking!) */}
                <g ref={faceRef}>
                  {/* Blushing Cheeks */}
                  <ellipse cx="68" cy="126" rx="13" ry="8" fill="url(#cheekBlush)" opacity="0.65" />
                  <ellipse cx="152" cy="126" rx="13" ry="8" fill="url(#cheekBlush)" opacity="0.65" />

                  {/* 1. Normal Tracking Eyes */}
                  {expression === 'normal' && (
                    <g
                      style={{
                        transformOrigin: '110px 108px',
                        transform: isBlinking ? 'scaleY(0.08)' : 'scaleY(1)',
                        transition: 'transform 0.1s ease',
                      }}
                    >
                      <ellipse cx="82" cy="108" rx="13.5" ry="15.5" fill="#090d16" />
                      <ellipse cx="138" cy="108" rx="13.5" ry="15.5" fill="#090d16" />

                      <g ref={pupilsRef}>
                        <circle cx="82" cy="108" r="7.5" fill="#38bdf8" opacity="0.35" />
                        <circle cx="85" cy="103" r="5" fill="#ffffff" />
                        <circle cx="78" cy="113" r="2.2" fill="#ffffff" opacity="0.8" />
                        <circle cx="138" cy="108" r="7.5" fill="#38bdf8" opacity="0.35" />
                        <circle cx="141" cy="103" r="5" fill="#ffffff" />
                        <circle cx="134" cy="113" r="2.2" fill="#ffffff" opacity="0.8" />
                      </g>
                    </g>
                  )}

                  {/* 2. Happy Arc Eyes (^ ◡ ^) */}
                  {expression === 'happy' && (
                    <g>
                      <path
                        d="M68 110 Q82 94 96 110"
                        stroke="#090d16"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M124 110 Q138 94 152 110"
                        stroke="#090d16"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  )}

                  {/* 3. Starry Ecstatic Eyes (★ ‿ ★) */}
                  {expression === 'starry' && (
                    <g>
                      <circle cx="82" cy="108" r="14" fill="#090d16" />
                      <circle cx="138" cy="108" r="14" fill="#090d16" />
                      <path
                        d="M82 96 L85 104 L94 104 L87 109 L89 118 L82 113 L75 118 L77 109 L70 104 L79 104 Z"
                        fill="#fde047"
                      />
                      <path
                        d="M138 96 L141 104 L150 104 L143 109 L145 118 L138 113 L131 118 L133 109 L126 104 L135 104 Z"
                        fill="#fde047"
                      />
                    </g>
                  )}

                  {/* 4. Curious Surprised Eyes (⊙ _ ⊙) */}
                  {expression === 'curious' && (
                    <g>
                      <circle cx="82" cy="108" r="14" fill="#090d16" />
                      <circle cx="82" cy="108" r="8" fill="#ffffff" />
                      <circle cx="82" cy="108" r="4" fill="#090d16" />
                      <circle cx="138" cy="108" r="14" fill="#090d16" />
                      <circle cx="138" cy="108" r="8" fill="#ffffff" />
                      <circle cx="138" cy="108" r="4" fill="#090d16" />
                    </g>
                  )}

                  {/* 5. Focus Mode Visor (•̀ ᴗ •́) */}
                  {expression === 'focus' && (
                    <g>
                      <ellipse cx="82" cy="108" rx="13.5" ry="15.5" fill="#090d16" />
                      <ellipse cx="138" cy="108" rx="13.5" ry="15.5" fill="#090d16" />
                      <path
                        d="M56 96 Q110 108 164 96 L158 118 Q110 126 62 118 Z"
                        fill="rgba(6, 182, 212, 0.75)"
                        stroke="#a5f3fc"
                        strokeWidth="2"
                      />
                      <path d="M68 94 L96 101" stroke="#090d16" strokeWidth="4.5" strokeLinecap="round" />
                      <path d="M152 94 L124 101" stroke="#090d16" strokeWidth="4.5" strokeLinecap="round" />
                    </g>
                  )}

                  {/* 6. Sleepy Soft Eyes (- _ -) */}
                  {expression === 'sleepy' && (
                    <g>
                      <path
                        d="M70 114 Q82 122 94 114"
                        stroke="#090d16"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <path
                        d="M126 114 Q138 122 150 114"
                        stroke="#090d16"
                        strokeWidth="5"
                        strokeLinecap="round"
                        fill="none"
                      />
                    </g>
                  )}

                  {/* 7. Dizzy Spiral Eyes (@ _ @) */}
                  {expression === 'dizzy' && (
                    <g>
                      <circle cx="82" cy="108" r="14" fill="#090d16" />
                      <circle cx="138" cy="108" r="14" fill="#090d16" />
                      <path
                        d="M82 108 m -8, 0 a 8,8 0 1,0 16,0 a 5,5 0 1,0 -10,0 a 2.5,2.5 0 1,0 5,0"
                        fill="none"
                        stroke="#fde047"
                        strokeWidth="2.5"
                      />
                      <path
                        d="M138 108 m -8, 0 a 8,8 0 1,0 16,0 a 5,5 0 1,0 -10,0 a 2.5,2.5 0 1,0 5,0"
                        fill="none"
                        stroke="#fde047"
                        strokeWidth="2.5"
                      />
                    </g>
                  )}

                  {/* 8. Winking Star Eye (^ _ ★) */}
                  {expression === 'wink' && (
                    <g>
                      <path
                        d="M68 110 Q82 94 96 110"
                        stroke="#090d16"
                        strokeWidth="5.5"
                        strokeLinecap="round"
                        fill="none"
                      />
                      <circle cx="138" cy="108" r="14" fill="#090d16" />
                      <path
                        d="M138 96 L141 104 L150 104 L143 109 L145 118 L138 113 L131 118 L133 109 L126 104 L135 104 Z"
                        fill="#fde047"
                      />
                    </g>
                  )}

                  {/* Mouth Expressions */}
                  {mouthState === 'joy' ? (
                    <path
                      d="M97 122 Q110 142 123 122 Z"
                      fill="#f43f5e"
                      stroke="#090d16"
                      strokeWidth="3.5"
                    />
                  ) : mouthState === 'curious' ? (
                    <circle cx="110" cy="128" r="5.5" fill="#090d16" />
                  ) : (
                    <path
                      d="M100 125 Q110 134 120 125"
                      stroke="#090d16"
                      strokeWidth="4.5"
                      strokeLinecap="round"
                      fill="none"
                    />
                  )}
                </g>
              </svg>
            </div>

            {/* Live Gaze Tracking Status Badge */}
            <div className="absolute -bottom-1 px-3 py-0.5 rounded-full bg-black/60 border border-white/15 text-[10px] text-cyan-300 flex items-center gap-1.5 backdrop-blur-md shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              <span>{moodBadgeText}</span>
            </div>
          </div>

          {/* Mobile Gestures Interactive Quick Chips */}
          <div className="flex flex-wrap items-center justify-center gap-1.5 mt-2.5 max-w-xs">
            <button
              type="button"
              onClick={() => handlePetNova()}
              className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              <span>🐾</span>
              <span>Rub to Pet</span>
            </button>

            <button
              type="button"
              onClick={() => handleFeedEnergy()}
              className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              <span>🍓</span>
              <span>Swipe to Feed</span>
            </button>

            <button
              type="button"
              onClick={() => handleDoubleTapJump()}
              className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              <span>🌟</span>
              <span>Double-Tap Jump</span>
            </button>

            <button
              type="button"
              onClick={() => handleLongPressHug()}
              className="px-2 py-0.5 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 text-[10px] text-slate-300 font-medium active:scale-95 transition-all flex items-center gap-1"
            >
              <span>🤗</span>
              <span>Hold to Hug</span>
            </button>
          </div>
        </div>

        {/* Right (Desktop 7 cols) / Bottom (Mobile): Status, XP & 4 Command Deck Buttons */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2.5">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-extrabold tracking-tight text-white flex items-center gap-2">
                  <span>{petName} Companion</span>
                </h2>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-gradient-to-r from-cyan-500/25 to-indigo-500/25 border border-cyan-400/30 text-cyan-200">
                  Lv. {petLevel} Spirit
                </span>
              </div>
              <p className="text-xs sm:text-sm text-slate-300 mt-0.5">
                Reacts in real time to your touch, habits, countdowns & daily focus.
              </p>
            </div>

            {/* Today's Total Momentum Score Pill */}
            <div className="flex items-center gap-2">
              <div className="px-3.5 py-1.5 rounded-2xl bg-black/40 border border-white/15 flex items-center gap-2 backdrop-blur-md shadow-sm">
                <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-slate-950 font-black text-sm shadow-md">
                  <Flame className="w-4 h-4 fill-current" />
                </div>
                <div>
                  <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">Daily Sync</div>
                  <div className="text-xs font-extrabold text-white tabular-nums">{todayRate}% Complete</div>
                </div>
              </div>

              <div className="px-3 py-1.5 rounded-2xl bg-white/10 border border-white/10 text-xs font-bold text-white/90 flex items-center gap-1">
                <span>🍓</span>
                <span>{treats} Treats</span>
              </div>
            </div>
          </div>

          {/* Companion Energy / XP Bar with Live Floating +XP */}
          <div className="relative bg-black/35 border border-white/10 rounded-2xl p-3.5 shadow-inner">
            {floatingXpText && (
              <div className="absolute -top-3.5 right-4 px-2.5 py-0.5 rounded-full bg-gradient-to-r from-cyan-400 via-fuchsia-500 to-amber-400 text-slate-950 font-black text-xs shadow-lg animate-bounce z-20">
                {floatingXpText}
              </div>
            )}
            <div className="flex justify-between items-center text-xs mb-1.5">
              <span className="font-semibold text-slate-200 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400 fill-amber-400" /> Companion Resonance XP
              </span>
              <span className="font-mono text-cyan-300 font-bold">{petXp} / 100 XP</span>
            </div>
            <div className="w-full h-2.5 bg-white/10 rounded-full overflow-hidden p-0.5">
              <div
                className="h-full rounded-full bg-gradient-to-r from-cyan-400 via-blue-500 to-fuchsia-500 transition-all duration-500 shadow-sm"
                style={{ width: `${petXp}%` }}
              />
            </div>
          </div>

          {/* 4 Interactive Command Deck Buttons */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-2.5">
            <button
              onClick={() => handlePetNova()}
              className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 text-xs font-bold text-white transition-all active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
            >
              <span>👋</span>
              <span>Pet Nova</span>
            </button>

            <button
              onClick={() => handleFeedEnergy()}
              className="py-3 px-3 rounded-2xl bg-white/10 hover:bg-white/15 border border-white/15 flex items-center justify-center gap-2 text-xs font-bold text-white transition-all active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
            >
              <span>🍓</span>
              <span>Feed Energy</span>
            </button>

            <button
              onClick={handleFocusMode}
              className="py-3 px-3 rounded-2xl bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 flex items-center justify-center gap-2 text-xs font-bold text-cyan-200 transition-all active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
            >
              <span>🕶️</span>
              <span>Focus Mode</span>
            </button>

            <button
              onClick={handleVibeCheck}
              className="py-3 px-3 rounded-2xl bg-amber-500/15 hover:bg-amber-500/25 border border-amber-400/30 flex items-center justify-center gap-2 text-xs font-bold text-amber-200 transition-all active:scale-95 shadow-sm touch-manipulation min-h-[44px]"
            >
              <span>✨</span>
              <span>Vibe Check</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
