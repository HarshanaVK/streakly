'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { DayStreakStat } from '@/lib/types';
import { Calendar, Info } from 'lucide-react';

export function StreakHeatmap() {
  const { streakSummary } = useStreakly();
  const [hoveredCell, setHoveredCell] = useState<DayStreakStat | null>(null);

  const heatmapDays = streakSummary?.heatmapDays ?? [];

  // Group 84 days into 12 columns of 7 days (Mon to Sun)
  const columns: DayStreakStat[][] = [];
  for (let i = 0; i < heatmapDays.length; i += 7) {
    columns.push(heatmapDays.slice(i, i + 7));
  }

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  const getCellBgClass = (stat: DayStreakStat) => {
    if (stat.isFuture) return 'bg-white/5 opacity-30 cursor-not-allowed';
    if (stat.totalGoals === 0 || stat.completedGoals === 0) {
      return 'bg-white/5 hover:bg-white/15';
    }
    if (stat.completionRate >= 100) {
      return 'accent-gradient-bg shadow-sm shadow-accent-glow';
    }
    if (stat.isStreakDay) {
      return 'bg-accent-primary/80';
    }
    if (stat.completionRate >= 40) {
      return 'bg-accent-primary/50';
    }
    return 'bg-accent-primary/25';
  };

  return (
    <div className="relative w-full rounded-4xl p-6 sm:p-7 glass-card border border-white/15 shadow-xl">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-2xl bg-white/10 text-accent-primary">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-white tracking-tight">
              12-Week Consistency Matrix
            </h2>
            <p className="text-xs text-muted-foreground">
              84-day habit overview • Every square represents 1 day
            </p>
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-1.5 text-[11px] text-muted-foreground font-medium">
          <span>Less</span>
          <div className="w-3 h-3 rounded-md bg-white/5 border border-white/10" />
          <div className="w-3 h-3 rounded-md bg-accent-primary/25" />
          <div className="w-3 h-3 rounded-md bg-accent-primary/50" />
          <div className="w-3 h-3 rounded-md bg-accent-primary/80" />
          <div className="w-3 h-3 rounded-md accent-gradient-bg" />
          <span>More</span>
        </div>
      </div>

      {/* Heatmap Grid */}
      <div className="relative overflow-x-auto pb-2 scrollbar-none">
        {/* Hover Tooltip */}
        {hoveredCell && (
          <div className="absolute top-0 right-0 px-3 py-1 rounded-xl bg-slate-900/90 text-white border border-white/20 text-xs shadow-xl backdrop-blur-md z-20 pointer-events-none flex items-center gap-2 animate-in fade-in zoom-in-95 duration-150">
            <span className="font-bold">{hoveredCell.date} ({hoveredCell.dayLabel})</span>
            <span>•</span>
            <span>{hoveredCell.completedGoals}/{hoveredCell.totalGoals} habits ({hoveredCell.completionRate}%)</span>
            {hoveredCell.isStreakDay && (
              <span className="text-amber-400 font-bold">🔥 Streak</span>
            )}
          </div>
        )}

        <div className="flex gap-2 items-start pt-3">
          {/* Day of week row labels */}
          <div className="flex flex-col gap-1.5 pt-1 text-[10px] font-bold text-white/40 select-none pr-1">
            {dayLabels.map((l, i) => (
              <div key={i} className="h-4 sm:h-5 flex items-center justify-center">
                {l}
              </div>
            ))}
          </div>

          {/* 12 Columns */}
          <div className="flex gap-1.5 sm:gap-2 flex-1">
            {columns.map((week, colIdx) => (
              <div key={colIdx} className="flex flex-col gap-1.5 flex-1 min-w-[20px]">
                {week.map((day) => {
                  return (
                    <div
                      key={day.date}
                      onMouseEnter={() => setHoveredCell(day)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`h-4 sm:h-5 rounded-lg border border-white/10 transition-all duration-200 ${
                        day.isToday ? 'ring-2 ring-accent-primary ring-offset-1 ring-offset-black' : ''
                      } ${getCellBgClass(day)}`}
                    />
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
