'use client';

import React from 'react';
import { useStreakly } from '@/lib/storage';

export function AppleActivityRings() {
  const { profile, streakSummary } = useStreakly();

  const totalGoals = profile?.goals?.length ?? 0;
  const completedGoals = streakSummary?.todayCompletedCount ?? 0;
  const habitsPct = totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const totalTodos = profile?.todos?.length ?? 0;
  const completedTodos = profile?.todos?.filter((t) => t.done).length ?? 0;
  const todosPct = totalTodos > 0 ? Math.round((completedTodos / totalTodos) * 100) : 0;

  const weeklyAvgPct = streakSummary?.weeklyCompletionRate ?? 0;
  const overallSyncPct = Math.round((habitsPct + todosPct) / 2);

  // Circumferences for concentric rings with enlarged inner aperture for maximum margin & clarity
  // ViewBox: 144 x 144, Center: (72, 72), strokeWidth = 9
  // Outer radius = 58  -> Track: 53.5 to 62.5
  // Middle radius = 46.5 -> Track: 42.0 to 51.0
  // Inner radius = 35  -> Track: 30.5 to 39.5
  // Clear center hole diameter = 61px in viewBox (generous 16px+ breathing room around text)
  const cOuter = 364.42;  // 2 * PI * 58
  const cMiddle = 292.17; // 2 * PI * 46.5
  const cInner = 219.91;  // 2 * PI * 35

  const offsetOuter = cOuter - (Math.min(100, habitsPct) / 100) * cOuter;
  const offsetMiddle = cMiddle - (Math.min(100, todosPct) / 100) * cMiddle;
  const offsetInner = cInner - (Math.min(100, weeklyAvgPct) / 100) * cInner;

  return (
    <div className="bg-black/40 border border-white/10 rounded-3xl p-4 sm:p-5 flex items-center justify-between gap-5 shadow-inner">
      {/* Concentric SVG Activity Rings with Generous Center Margin */}
      <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
        <svg
          className="w-32 h-32 -rotate-90 transform-gpu drop-shadow-[0_0_12px_rgba(0,0,0,0.5)]"
          viewBox="0 0 144 144"
        >
          {/* Outer Ring Track (Habits / Rituals - Rose) */}
          <circle
            cx="72"
            cy="72"
            r="58"
            fill="none"
            stroke="rgba(244,63,94,0.18)"
            strokeWidth="9"
          />
          <circle
            cx="72"
            cy="72"
            r="58"
            fill="none"
            stroke="#f43f5e"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={cOuter}
            strokeDashoffset={offsetOuter}
            className="transition-all duration-700 ease-out"
          />

          {/* Middle Ring Track (Tasks / To-Dos - Emerald) */}
          <circle
            cx="72"
            cy="72"
            r="46.5"
            fill="none"
            stroke="rgba(16,185,129,0.18)"
            strokeWidth="9"
          />
          <circle
            cx="72"
            cy="72"
            r="46.5"
            fill="none"
            stroke="#10b981"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={cMiddle}
            strokeDashoffset={offsetMiddle}
            className="transition-all duration-700 ease-out"
          />

          {/* Inner Ring Track (Weekly Momentum - Cyan) */}
          <circle
            cx="72"
            cy="72"
            r="35"
            fill="none"
            stroke="rgba(56,189,248,0.18)"
            strokeWidth="9"
          />
          <circle
            cx="72"
            cy="72"
            r="35"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="9"
            strokeLinecap="round"
            strokeDasharray={cInner}
            strokeDashoffset={offsetInner}
            className="transition-all duration-700 ease-out"
          />
        </svg>

        {/* Clean, Non-Crowded Center Text with Ample Margins */}
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
          <span className="text-base sm:text-lg font-black text-white tabular-nums tracking-tight leading-none drop-shadow-md">
            {overallSyncPct}%
          </span>
          <span className="text-[10px] uppercase font-black text-cyan-300 tracking-wider mt-1 opacity-90">
            Sync
          </span>
        </div>
      </div>

      {/* Ring Legend Telemetry */}
      <div className="space-y-2.5 text-xs flex-1 pl-1">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-rose-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
            Rituals
          </span>
          <span className="font-mono font-bold text-white text-sm">{habitsPct}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-emerald-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_8px_#10b981]" />
            To-Dos
          </span>
          <span className="font-mono font-bold text-white text-sm">{todosPct}%</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-cyan-300 font-semibold">
            <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 shadow-[0_0_8px_#38bdf8]" />
            Weekly Avg
          </span>
          <span className="font-mono font-bold text-white text-sm">{weeklyAvgPct}%</span>
        </div>
      </div>
    </div>
  );
}

