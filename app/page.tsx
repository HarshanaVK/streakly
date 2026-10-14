'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { BackgroundSlideshow } from '@/components/BackgroundSlideshow';
import { ParticleFXOverlay } from '@/components/ParticleFXOverlay';
import { Header } from '@/components/Header';
import { HeroStreakSection } from '@/components/HeroStreakSection';
import { WeeklyStreakChart } from '@/components/WeeklyStreakChart';
import { DailyGoalsCard } from '@/components/DailyGoalsCard';
import { DailyTodoList } from '@/components/DailyTodoList';
import { StreakHeatmap } from '@/components/StreakHeatmap';
import { CountdownsSection } from '@/components/CountdownsSection';
import { VirtualPetBloop } from '@/components/VirtualPetBloop';
import { ProfilePickerModal } from '@/components/ProfilePickerModal';
import { SettingsModal } from '@/components/SettingsModal';
import { MasterAdminPanel } from '@/components/MasterAdminPanel';
import { IntroOverlay } from '@/components/IntroOverlay';
import { AppleActivityRings } from '@/components/AppleActivityRings';
import {
  Sparkles,
  Flame,
  Timer,
  CheckSquare,
  BarChart3,
  Layers,
  ArrowRight,
} from 'lucide-react';
import { triggerHaptic } from '@/lib/haptics';
import { getTodayDateString } from '@/lib/time';

type MobileTab = 'hub' | 'habits' | 'countdowns' | 'todos' | 'stats' | 'all';

export default function Home() {
  const {
    hasSeenIntro,
    actorProfileId,
    profile,
  } = useStreakly();

  const [showSettings, setShowSettings] = useState(false);
  const [showProfilePicker, setShowProfilePicker] = useState(false);
  const [showMasterPanel, setShowMasterPanel] = useState(false);
  const [showIntro, setShowIntro] = useState(!hasSeenIntro);
  const [activeTab, setActiveTab] = useState<MobileTab>('hub');

  // Live real-time pending counters for mobile bottom dock badges
  const todayStr = getTodayDateString();
  const completedGoalsCount = profile?.goalLogs?.filter(
    (l) => l.date === todayStr && l.done
  ).length ?? 0;
  const totalGoals = profile?.goals?.length ?? 0;
  const pendingGoals = Math.max(0, totalGoals - completedGoalsCount);
  const pendingTodos = profile?.todos?.filter((t) => !t.done).length ?? 0;
  const totalCountdowns = profile?.countdowns?.length ?? 0;

  const switchTab = (tab: MobileTab) => {
    setActiveTab(tab);
    triggerHaptic('tap');
    soundEngine.playTone('pop', profile?.settings?.sound ?? true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // If user hasn't seen intro yet or tapped replay, display cinematic Netflix intro overlay
  if (showIntro) {
    return (
      <main className="relative min-h-screen">
        <BackgroundSlideshow />
        <IntroOverlay
          onEnter={() => {
            setShowIntro(false);
          }}
        />
      </main>
    );
  }

  // If no actor profile selected yet, force profile picker modal
  const needsProfileSelection = !actorProfileId;

  return (
    <main className="relative min-h-screen pb-28 sm:pb-32 pt-safe text-white">
      {/* 1. Global Interactive Particle Burst Canvas & Touch Follower Glow */}
      <ParticleFXOverlay />

      {/* 2. Glassmorphic dynamic background slideshow & ambient mood switcher */}
      <BackgroundSlideshow />

      {/* 3. Sticky Glass Header */}
      <Header
        onOpenSettings={() => setShowSettings(true)}
        onOpenProfilePicker={() => setShowProfilePicker(true)}
        onOpenMasterPanel={() => setShowMasterPanel(true)}
        onReplayIntro={() => setShowIntro(true)}
      />

      {/* 4. Mobile Optimized Views with Fluid Page Transition Animations */}
      <div className="relative z-10 max-w-7xl mx-auto px-3.5 sm:px-6 py-4 sm:py-6 space-y-6 min-h-[600px]">
        <AnimatePresence mode="wait">
          {/* VIEW 1: NOVA COMPANION & TODAY'S MOMENTUM HUB */}
          {activeTab === 'hub' && (
            <motion.div
              key="view-hub"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
              className="space-y-5"
            >
              {/* Hero Section: Timezone Greeting & Current Streak Hero */}
              <HeroStreakSection />

              {/* Interactive Nova Companion Stage */}
              <div id="section-pet">
                <VirtualPetBloop />
              </div>

              {/* Concentric Apple Activity Rings Telemetry (Today's Sync) */}
              <div className="glass-card rounded-4xl p-5 border border-white/15 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Today’s Telemetry Rings</span>
                  </span>
                  <button
                    onClick={() => switchTab('habits')}
                    className="text-xs text-cyan-300 hover:text-cyan-200 font-bold flex items-center gap-1 active:scale-95 transition-transform"
                  >
                    <span>Log Habits</span>
                    <ArrowRight className="w-3 h-3" />
                  </button>
                </div>
                <AppleActivityRings />
              </div>
            </motion.div>
          )}

          {/* VIEW 2: DAILY HABIT RITUALS */}
          {activeTab === 'habits' && (
            <motion.div
              key="view-habits"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
              className="space-y-5"
            >
              <DailyGoalsCard />
            </motion.div>
          )}

          {/* VIEW 3: LIVE MILESTONE & EXAM COUNTDOWNS */}
          {activeTab === 'countdowns' && (
            <motion.div
              key="view-countdowns"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
              className="space-y-5"
            >
              <CountdownsSection />
            </motion.div>
          )}

          {/* VIEW 4: DAILY ACTION TO-DOS */}
          {activeTab === 'todos' && (
            <motion.div
              key="view-todos"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
              className="space-y-5"
            >
              <DailyTodoList />
            </motion.div>
          )}

          {/* VIEW 5: WEEKLY STREAK & CONSISTENCY MATRIX */}
          {activeTab === 'stats' && (
            <motion.div
              key="view-stats"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
              className="space-y-5"
            >
              <div id="section-streaks">
                <WeeklyStreakChart />
              </div>
              <div id="section-heatmap">
                <StreakHeatmap />
              </div>
            </motion.div>
          )}

          {/* VIEW 6: ALL COMBINED SCROLL VIEW */}
          {activeTab === 'all' && (
            <motion.div
              key="view-all"
              initial={{ opacity: 0, y: 14, scale: 0.985 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.985 }}
              transition={{ type: 'spring', stiffness: 380, damping: 28, mass: 0.6 }}
              className="space-y-6"
            >
              <HeroStreakSection />
              <div id="section-pet">
                <VirtualPetBloop />
              </div>
              <div className="glass-card rounded-4xl p-5 border border-white/15 shadow-xl">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Today’s Telemetry Rings</span>
                  </span>
                </div>
                <AppleActivityRings />
              </div>
              <div id="section-habits">
                <DailyGoalsCard />
              </div>
              <div id="section-countdown">
                <CountdownsSection />
              </div>
              <div id="section-todos">
                <DailyTodoList />
              </div>
              <div id="section-streaks">
                <WeeklyStreakChart />
              </div>
              <div id="section-heatmap">
                <StreakHeatmap />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* 6. Fixed Floating Apple Glass Bottom Dock with Spring Sliding Indicator & Tactile Bounces */}
      <nav className="fixed bottom-safe-tab left-1/2 -translate-x-1/2 z-40 w-[95%] max-w-md pointer-events-auto">
        <div className="glass-card rounded-full p-1.5 flex items-center justify-between border border-white/20 shadow-2xl backdrop-blur-2xl bg-slate-950/85">
          {/* Nova Hub Tab */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => switchTab('hub')}
            className="relative flex flex-col items-center py-1.5 px-3 rounded-full select-none touch-manipulation"
          >
            {activeTab === 'hub' && (
              <motion.div
                layoutId="activeBottomDockPill"
                className="absolute inset-0 rounded-full bg-cyan-500/25 border border-cyan-400/40 shadow-md shadow-cyan-500/25"
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              <Sparkles className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'hub' ? 'text-cyan-400 scale-110 drop-shadow-[0_0_8px_rgba(34,211,238,0.7)]' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-0.5 transition-colors ${activeTab === 'hub' ? 'text-cyan-200 font-black' : 'text-slate-400'}`}>Nova</span>
            </span>
          </motion.button>

          {/* Habits Tab with Pending Badge */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => switchTab('habits')}
            className="relative flex flex-col items-center py-1.5 px-3 rounded-full select-none touch-manipulation"
          >
            {activeTab === 'habits' && (
              <motion.div
                layoutId="activeBottomDockPill"
                className="absolute inset-0 rounded-full bg-rose-500/25 border border-rose-400/40 shadow-md shadow-rose-500/25"
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              <Flame className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'habits' ? 'text-rose-400 scale-110 drop-shadow-[0_0_8px_rgba(244,63,94,0.7)]' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-0.5 transition-colors ${activeTab === 'habits' ? 'text-rose-200 font-black' : 'text-slate-400'}`}>Habits</span>
            </span>
            {pendingGoals > 0 ? (
              <span className="absolute top-0.5 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-rose-500 text-white shadow-sm ring-1 ring-black z-20">
                {pendingGoals}
              </span>
            ) : totalGoals > 0 ? (
              <span className="absolute top-0.5 right-1 w-2 h-2 rounded-full bg-emerald-400 ring-1 ring-black z-20" />
            ) : null}
          </motion.button>

          {/* Countdowns / Exams Tab with Active Badge */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => switchTab('countdowns')}
            className="relative flex flex-col items-center py-1.5 px-3 rounded-full select-none touch-manipulation"
          >
            {activeTab === 'countdowns' && (
              <motion.div
                layoutId="activeBottomDockPill"
                className="absolute inset-0 rounded-full bg-indigo-500/25 border border-indigo-400/40 shadow-md shadow-indigo-500/25"
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              <Timer className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'countdowns' ? 'text-indigo-400 scale-110 drop-shadow-[0_0_8px_rgba(129,140,248,0.7)]' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-0.5 transition-colors ${activeTab === 'countdowns' ? 'text-indigo-200 font-black' : 'text-slate-400'}`}>Exams</span>
            </span>
            {totalCountdowns > 0 && (
              <span className="absolute top-0.5 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-indigo-500 text-white shadow-sm ring-1 ring-black z-20">
                {totalCountdowns}
              </span>
            )}
          </motion.button>

          {/* To-Dos Tab with Pending Badge */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => switchTab('todos')}
            className="relative flex flex-col items-center py-1.5 px-3 rounded-full select-none touch-manipulation"
          >
            {activeTab === 'todos' && (
              <motion.div
                layoutId="activeBottomDockPill"
                className="absolute inset-0 rounded-full bg-emerald-500/25 border border-emerald-400/40 shadow-md shadow-emerald-500/25"
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              <CheckSquare className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'todos' ? 'text-emerald-400 scale-110 drop-shadow-[0_0_8px_rgba(52,211,153,0.7)]' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-0.5 transition-colors ${activeTab === 'todos' ? 'text-emerald-200 font-black' : 'text-slate-400'}`}>To-Dos</span>
            </span>
            {pendingTodos > 0 && (
              <span className="absolute top-0.5 right-1 px-1.5 py-0.2 rounded-full text-[9px] font-extrabold bg-emerald-500 text-white shadow-sm ring-1 ring-black z-20">
                {pendingTodos}
              </span>
            )}
          </motion.button>

          {/* Stats Tab */}
          <motion.button
            whileTap={{ scale: 0.88 }}
            whileHover={{ scale: 1.05 }}
            onClick={() => switchTab('stats')}
            className="relative flex flex-col items-center py-1.5 px-3 rounded-full select-none touch-manipulation"
          >
            {activeTab === 'stats' && (
              <motion.div
                layoutId="activeBottomDockPill"
                className="absolute inset-0 rounded-full bg-amber-500/25 border border-amber-400/40 shadow-md shadow-amber-500/25"
                transition={{ type: 'spring', stiffness: 480, damping: 32 }}
              />
            )}
            <span className="relative z-10 flex flex-col items-center">
              <BarChart3 className={`w-5 h-5 transition-transform duration-200 ${activeTab === 'stats' ? 'text-amber-400 scale-110 drop-shadow-[0_0_8px_rgba(251,191,36,0.7)]' : 'text-slate-400'}`} />
              <span className={`text-[10px] font-bold mt-0.5 transition-colors ${activeTab === 'stats' ? 'text-amber-200 font-black' : 'text-slate-400'}`}>Stats</span>
            </span>
          </motion.button>
        </div>
      </nav>


      {/* 7. Modals and Overlays */}
      <ProfilePickerModal
        isOpen={showProfilePicker || needsProfileSelection}
        onClose={() => setShowProfilePicker(false)}
        canDismiss={!needsProfileSelection}
      />

      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />

      <MasterAdminPanel
        isOpen={showMasterPanel}
        onClose={() => setShowMasterPanel(false)}
      />
    </main>
  );
}
