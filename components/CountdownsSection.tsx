'use client';

import React, { useEffect, useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { getCountdownBreakdown } from '@/lib/time';
import { Countdown } from '@/lib/types';
import {
  Timer,
  Plus,
  Trash2,
  Calendar,
  X,
  AlertTriangle,
  Sparkles,
  Zap,
} from 'lucide-react';

export function CountdownsSection() {
  const {
    profile,
    addCountdown,
    updateCountdown,
    deleteCountdown,
    triggerPetReaction,
  } = useStreakly();

  const [nowMs, setNowMs] = useState(Date.now());
  const [showDrawer, setShowDrawer] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  // Form states
  const [cdTitle, setCdTitle] = useState('');
  const [cdDateTime, setCdDateTime] = useState('');
  const [cdCategory, setCdCategory] = useState('🎓 Exam');

  const countdowns = profile?.countdowns ?? [];
  const soundEnabled = profile?.settings?.sound ?? true;

  useEffect(() => {
    const interval = setInterval(() => setNowMs(Date.now()), 1000);
    return () => clearInterval(interval);
  }, []);

  const openDrawer = (c?: Countdown) => {
    if (c) {
      setEditId(c.id);
      setCdTitle(c.title);
      setCdDateTime(c.targetISO.slice(0, 16));
      setCdCategory(c.category || '🎓 Exam');
    } else {
      setEditId(null);
      setCdTitle('');
      // Default 7 days ahead at 09:00
      const d = new Date(Date.now() + 7 * 86400000);
      const pad = (n: number) => String(n).padStart(2, '0');
      setCdDateTime(
        `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T09:00`
      );
      setCdCategory('🎓 Exam');
    }
    setShowDrawer(true);
    triggerPetReaction(
      'focus',
      '"Setting a target countdown! Having a clear deadline sharpens our focus 10x! ⏱️"',
      3500
    );
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!cdTitle.trim() || !cdDateTime) return;

    const iso = new Date(cdDateTime).toISOString();

    if (editId) {
      updateCountdown(editId, {
        title: cdTitle.trim(),
        targetISO: iso,
        category: cdCategory,
      });
    } else {
      addCountdown(cdTitle.trim(), iso, '🎯', 'blue');
    }

    soundEngine.playTone('pop', soundEnabled);
    setShowDrawer(false);
    triggerPetReaction(
      'focus',
      `"Target locked: '${cdTitle.trim()}'! Let's make every hour count! ⚡"`,
      3500
    );
  };

  const handleFocusExam = (title: string, e: React.MouseEvent) => {
    e.stopPropagation();
    soundEngine.playTone('pop', soundEnabled);
    triggerPetReaction(
      'focus',
      `"🕶️ EXAM LOCK-IN MODE for '${title}'! Distractions blocked—let's do a deep study sprint!"`,
      4000
    );
  };

  const pad = (n: number) => String(n).padStart(2, '0');

  const getCategoryColor = (cat?: string) => {
    switch (cat) {
      case '🎓 Exam':
        return 'bg-indigo-500/25 text-indigo-200 border-indigo-400/35';
      case '🏆 Certification':
        return 'bg-amber-500/25 text-amber-200 border-amber-400/35';
      case '🚀 Project Deadline':
        return 'bg-violet-500/25 text-violet-200 border-violet-400/35';
      case '💜 Celebration':
        return 'bg-pink-500/25 text-pink-200 border-pink-400/35';
      case '🎯 Milestone':
      default:
        return 'bg-cyan-500/25 text-cyan-200 border-cyan-400/35';
    }
  };

  return (
    <div className="relative w-full rounded-4xl p-5 sm:p-7 glass-card border border-white/15 shadow-xl flex flex-col justify-between card-shine">
      {/* Section Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300 shrink-0 shadow-sm">
            <Timer className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight truncate">
              Live Milestone & Exam Countdowns
            </h2>
            <p className="text-xs text-slate-300 truncate">
              Second-by-second precision • Lock-in focus modes
            </p>
          </div>
        </div>

        <button
          onClick={() => openDrawer()}
          className="px-4 py-2 rounded-full text-xs font-bold text-indigo-200 bg-indigo-500/20 hover:bg-indigo-500/30 border border-indigo-400/35 flex items-center gap-1.5 transition-all active:scale-95 shadow-md shrink-0"
        >
          <Plus className="w-4 h-4 stroke-[2.5]" />
          <span>Add Target</span>
        </button>
      </div>

      {/* Add / Edit Inline Drawer */}
      {showDrawer && (
        <form
          onSubmit={handleSave}
          className="mb-6 bg-slate-950/80 border border-indigo-400/40 rounded-3xl p-4 sm:p-5 space-y-4 animate-in fade-in zoom-in-95 duration-200 shadow-2xl backdrop-blur-xl"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-indigo-300 flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              <span>{editId ? 'Edit Countdown Target' : 'Set New Milestone Target'}</span>
            </span>
            <button
              type="button"
              onClick={() => setShowDrawer(false)}
              className="text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                Event / Exam Title
              </label>
              <input
                type="text"
                required
                placeholder="e.g. AWS Solutions Architect Exam"
                value={cdTitle}
                onChange={(e) => setCdTitle(e.target.value)}
                className="w-full bg-white/10 border border-white/15 rounded-xl px-3.5 py-2.5 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-indigo-400 transition-colors"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Target Date & Time
                </label>
                <input
                  type="datetime-local"
                  required
                  value={cdDateTime}
                  onChange={(e) => setCdDateTime(e.target.value)}
                  className="w-full bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-indigo-400 transition-colors"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-300 mb-1">
                  Category Tag
                </label>
                <select
                  value={cdCategory}
                  onChange={(e) => setCdCategory(e.target.value)}
                  className="w-full bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-indigo-400"
                >
                  <option value="🎓 Exam">🎓 Exam</option>
                  <option value="🏆 Certification">🏆 Certification</option>
                  <option value="🚀 Project Deadline">🚀 Project Deadline</option>
                  <option value="🎯 Milestone">🎯 Milestone</option>
                  <option value="💜 Celebration">💜 Celebration</option>
                </select>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-2 pt-1">
            <button
              type="button"
              onClick={() => setShowDrawer(false)}
              className="px-4 py-2 rounded-xl bg-white/10 text-xs font-semibold text-slate-300 hover:text-white transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-gradient-to-r from-indigo-500 via-cyan-500 to-teal-400 text-white font-extrabold text-xs shadow-lg hover:brightness-110 active:scale-95 transition-all"
            >
              Lock In Target
            </button>
          </div>
        </form>
      )}

      {/* Countdown Cards Responsive Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
        {countdowns.length === 0 ? (
          <div className="col-span-full text-center py-10 bg-black/25 rounded-3xl border border-white/10 p-6">
            <Sparkles className="w-8 h-8 text-indigo-400/40 mx-auto mb-2.5 animate-pulse" />
            <h3 className="text-sm font-bold text-white mb-1">No Active Countdown Targets</h3>
            <p className="text-xs text-slate-300 max-w-sm mx-auto">
              Tap "+ Add Target" above to lock in upcoming exams, certification dates, or major life milestones!
            </p>
          </div>
        ) : (
          countdowns.map((item) => {
            const breakdown = getCountdownBreakdown(item.targetISO, nowMs);
            const isUrgent = !breakdown.isPast && breakdown.days < 5;

            // Formatted date string
            const formattedDate = new Date(item.targetISO).toLocaleString([], {
              month: 'short',
              day: 'numeric',
              year: 'numeric',
              hour: '2-digit',
              minute: '2-digit',
            });

            // Preparation runway calculation
            const targetMs = new Date(item.targetISO).getTime();
            const createdMs = item.createdAt || targetMs - 14 * 86400000;
            const totalWindow = Math.max(1, targetMs - createdMs);
            const elapsedPct = Math.min(
              100,
              Math.max(6, Math.round(((nowMs - createdMs) / totalWindow) * 100))
            );

            const categoryStyle = getCategoryColor(item.category);

            return (
              <div
                key={item.id}
                onClick={() => openDrawer(item)}
                className={`cursor-pointer rounded-3xl p-4 sm:p-5 border transition-all duration-300 relative overflow-hidden group select-none flex flex-col justify-between ${
                  isUrgent
                    ? 'bg-gradient-to-br from-indigo-950/85 via-slate-900/90 to-purple-950/80 border-indigo-400/45 shadow-xl hover:border-indigo-400/70'
                    : 'bg-black/45 hover:bg-black/60 border-white/15 hover:border-white/30 shadow-lg'
                }`}
              >
                {/* Ambient Card Background Glow for urgent countdowns */}
                {isUrgent && (
                  <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-amber-500/15 blur-2xl pointer-events-none" />
                )}

                <div>
                  {/* Card Top Row: Badges & Actions */}
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-1.5 flex-wrap min-w-0">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border ${categoryStyle}`}>
                        {item.category || '🎯 Milestone'}
                      </span>
                      {isUrgent && (
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 animate-pulse flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-400" />
                          <span>Final Sprint</span>
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <button
                        onClick={(e) => handleFocusExam(item.title, e)}
                        className="px-2.5 py-1 rounded-xl text-[11px] font-bold text-cyan-300 bg-cyan-500/15 hover:bg-cyan-500/25 border border-cyan-400/30 transition-all flex items-center gap-1 active:scale-95 shadow-sm"
                        title="Lock-In Focus Mode with Companion"
                      >
                        <span>🕶️</span>
                        <span>Focus</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteCountdown(item.id);
                        }}
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/20 rounded-lg transition-colors"
                        title="Remove target"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>

                  {/* Title & Target Date */}
                  <div className="mb-4">
                    <h3 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-snug group-hover:text-cyan-200 transition-colors line-clamp-2">
                      {item.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-1 text-[11px] text-slate-300 font-mono flex-wrap">
                      <span className="flex items-center gap-1 text-slate-400">
                        <Calendar className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                        <span>Target:</span>
                      </span>
                      <span className="text-slate-200 font-medium">{formattedDate}</span>
                    </div>
                  </div>

                  {/* 4-Block Live Tabular Countdown Readout (Polished margins, high-contrast digits) */}
                  <div className="grid grid-cols-4 gap-2 sm:gap-2.5 my-3.5">
                    {/* Days */}
                    <div className="bg-slate-950/70 border border-white/10 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center justify-center text-center shadow-inner group-hover:border-white/20 transition-colors">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-white tabular-nums tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(255,255,255,0.25)]">
                        {breakdown.isPast ? '00' : pad(breakdown.days)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400 tracking-wider mt-2">
                        Days
                      </span>
                    </div>

                    {/* Hours */}
                    <div className="bg-slate-950/70 border border-white/10 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center justify-center text-center shadow-inner group-hover:border-white/20 transition-colors">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-blue-200 tabular-nums tracking-tight leading-none drop-shadow-[0_2px_8px_rgba(191,219,254,0.25)]">
                        {breakdown.isPast ? '00' : pad(breakdown.hours)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-bold text-slate-400 tracking-wider mt-2">
                        Hours
                      </span>
                    </div>

                    {/* Mins */}
                    <div className="bg-slate-950/70 border border-cyan-400/25 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center justify-center text-center shadow-inner group-hover:border-cyan-400/40 transition-colors">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-cyan-300 tabular-nums tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(34,211,238,0.35)]">
                        {breakdown.isPast ? '00' : pad(breakdown.minutes)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-bold text-cyan-300/80 tracking-wider mt-2">
                        Mins
                      </span>
                    </div>

                    {/* Secs (Radiant Amber Pulse) */}
                    <div className="bg-slate-950/80 border border-amber-400/35 rounded-2xl py-3 px-1 sm:px-2 flex flex-col items-center justify-center text-center relative overflow-hidden shadow-inner group-hover:border-amber-400/50 transition-colors">
                      <span className="font-mono text-2xl sm:text-3xl font-black text-amber-300 tabular-nums tracking-tight leading-none drop-shadow-[0_2px_10px_rgba(251,191,36,0.45)]">
                        {breakdown.isPast ? '00' : pad(breakdown.seconds)}
                      </span>
                      <span className="text-[10px] sm:text-[11px] uppercase font-bold text-amber-200/80 tracking-wider mt-2">
                        Secs
                      </span>
                    </div>
                  </div>
                </div>

                {/* Timeline Runway Progress Bar */}
                <div className="mt-3 pt-3 border-t border-white/10">
                  <div className="flex justify-between items-center text-[11px] text-slate-300 mb-2">
                    <span className="font-medium text-slate-400">Prep Runway</span>
                    <span className="text-indigo-300 font-bold">
                      {breakdown.isPast
                        ? 'Target Reached 🎯'
                        : `${elapsedPct}% elapsed • ${breakdown.days}d ${breakdown.hours}h left`}
                    </span>
                  </div>
                  <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-indigo-500 via-cyan-400 to-emerald-400 rounded-full transition-all duration-700 shadow-sm"
                      style={{ width: `${elapsedPct}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
