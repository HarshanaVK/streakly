'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { AppleActivityRings } from '@/components/AppleActivityRings';
import { Flame, BarChart3, Sparkles } from 'lucide-react';

export function WeeklyStreakChart() {
  const { streakSummary, profile, triggerPetReaction } = useStreakly();
  const [selectedDayIdx, setSelectedDayIdx] = useState<number>(6); // Index 6 = Today

  const weeklyDays = streakSummary?.weeklyDays ?? [];
  const currentStreak = streakSummary?.currentStreak ?? 0;
  const streakThreshold = profile?.settings?.streakThreshold ?? 70;
  const soundEnabled = profile?.settings?.sound ?? true;

  const selectedDay = weeklyDays[selectedDayIdx] || weeklyDays[weeklyDays.length - 1];

  const handleSelectDay = (idx: number) => {
    setSelectedDayIdx(idx);
    soundEngine.playTone('pop', soundEnabled);
    const day = weeklyDays[idx];
    if (day) {
      if (day.completionRate >= 80) {
        triggerPetReaction('celebrate', `"${day.dayLabel}: ${day.completionRate}% completion! Absolute flame streak!"`, 3500);
      } else {
        triggerPetReaction('happy', `"${day.dayLabel}: ${day.completedGoals}/${day.totalGoals} habits completed (${day.completionRate}%)."`, 3500);
      }
    }
  };

  return (
    <div className="relative w-full rounded-4xl p-6 sm:p-7 glass-card border border-white/15 shadow-xl flex flex-col justify-between card-shine">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-white/10 text-accent-primary">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Weekly Streak & Apple Rings
            </h2>
            <p className="text-xs text-muted-foreground">
              Concentric telemetry & interactive Mon–Sun day inspection
            </p>
          </div>
        </div>

        <div className="px-3 py-1.5 rounded-full bg-amber-500/15 border border-amber-500/25 flex items-center gap-1.5 text-xs font-bold text-amber-300">
          <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
          <span>{currentStreak} Day Peak Streak</span>
        </div>
      </div>

      {/* Concentric Apple Activity Rings */}
      <div className="mb-5">
        <AppleActivityRings />
      </div>

      {/* Interactive 7-Day Capsule Bars */}
      <div className="bg-black/30 border border-white/10 rounded-3xl p-4 sm:p-5">
        <div className="flex items-center justify-between text-xs mb-3">
          <span className="font-semibold text-accent-primary">
            {selectedDayIdx === 6 ? "Today's Live Activity" : `${selectedDay?.dayLabel}'s Snapshot`}
          </span>
          <span className="font-mono font-bold text-white">
            {selectedDay?.completionRate ?? 0}% Goal Hit
          </span>
        </div>

        <div className="grid grid-cols-7 gap-2 sm:gap-3 items-end h-36 pt-4 px-1">
          {weeklyDays.map((day, idx) => {
            const isSelected = idx === selectedDayIdx;
            const isHigh = day.completionRate >= 80;
            const barHeight = Math.max(14, day.isFuture ? 10 : day.completionRate);

            return (
              <div
                key={day.date}
                onClick={() => handleSelectDay(idx)}
                className="flex flex-col items-center justify-end h-full cursor-pointer group select-none"
              >
                {/* Flame indicator icon */}
                <div
                  className={`mb-1.5 text-xs transition-transform group-hover:scale-125 ${
                    isHigh ? 'opacity-100 animate-bounce' : 'opacity-25'
                  }`}
                >
                  {isHigh ? '🔥' : '•'}
                </div>

                {/* Capsule Bar */}
                <div
                  className={`w-full max-w-[32px] h-24 bg-white/10 rounded-full p-0.5 flex items-end overflow-hidden border transition-all ${
                    isSelected
                      ? 'border-accent-primary shadow-[0_0_14px_var(--accent-glow)]'
                      : 'border-white/5 hover:border-white/20'
                  }`}
                >
                  <div
                    className={`w-full rounded-full transition-all duration-700 ${
                      day.isToday
                        ? 'accent-gradient-bg shadow-sm'
                        : isHigh
                        ? 'bg-gradient-to-t from-indigo-500 via-purple-400 to-pink-400'
                        : 'bg-white/35'
                    }`}
                    style={{ height: `${barHeight}%` }}
                  />
                </div>

                {/* Day Label */}
                <span
                  className={`mt-2 text-[11px] font-bold transition-colors ${
                    isSelected ? 'text-accent-primary font-black scale-105' : 'text-slate-400 group-hover:text-white'
                  }`}
                >
                  {day.dayLabel}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-[11px] text-white/50 flex items-center justify-between">
        <span>🔥 Flame = 80%+ goal achieved</span>
        <span className="text-accent-primary font-medium">Tap bar to inspect</span>
      </div>
    </div>
  );
}
