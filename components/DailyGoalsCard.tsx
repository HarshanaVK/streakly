'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { getTodayDateString } from '@/lib/time';
import { triggerGlobalParticleBurst } from '@/components/ParticleFXOverlay';
import { Goal } from '@/lib/types';
import {
  Check,
  Plus,
  Trash2,
  Edit2,
  CheckCircle2,
  X,
  Flame,
} from 'lucide-react';

const HABIT_ICONS = ['🏋️', '☁️', '💧', '🚀', '🧠', '📚', '🧘‍♀️', '✨', '🍎', '🎯'];
const HABIT_CATEGORIES = [
  '⚡ Fitness',
  '💻 Tech Lab',
  '💧 Wellness',
  '📚 Deep Work',
  '🧘 Mindfulness',
];

export function DailyGoalsCard() {
  const {
    profile,
    toggleGoalToday,
    addGoal,
    updateGoal,
    deleteGoal,
    streakSummary,
    triggerPetReaction,
    gainPetXP,
  } = useStreakly();

  const [showAddDrawer, setShowAddDrawer] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newEmoji, setNewEmoji] = useState('🏋️');
  const [newCategory, setNewCategory] = useState('⚡ Fitness');
  const [newTarget, setNewTarget] = useState('');
  const [editingGoal, setEditingGoal] = useState<Goal | null>(null);

  const todayStr = getTodayDateString();
  const goals = profile?.goals ?? [];
  const goalLogs = profile?.goalLogs ?? [];
  const soundEnabled = profile?.settings?.sound ?? true;

  const completedGoalIds = new Set(
    goalLogs
      .filter((l) => l.date === todayStr && l.done)
      .map((l) => l.goalId)
  );

  const handleToggle = (goal: Goal, e: React.MouseEvent) => {
    const isAlreadyDone = completedGoalIds.has(goal.id);
    const rect = e.currentTarget.getBoundingClientRect();

    if (!isAlreadyDone) {
      triggerGlobalParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        'celebrate'
      );
      soundEngine.playTone('complete', soundEnabled);
      gainPetXP(25, goal.title);
      triggerPetReaction(
        'celebrate',
        `"Yes!! '${goal.title}' completed! 🔥 +25 XP powered up!"`,
        3800
      );
    } else {
      soundEngine.playTone('undo', soundEnabled);
      triggerPetReaction(
        'undo',
        `"Unchecked '${goal.title}'? ⊙_⊙ No worries, tap it again whenever you finish!"`,
        3200
      );
    }

    toggleGoalToday(goal.id, todayStr);
  };

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    addGoal(newTitle.trim(), newEmoji, newTarget.trim());
    setNewTitle('');
    setNewTarget('');
    setShowAddDrawer(false);
    triggerPetReaction(
      'celebrate',
      `"New ritual '${newTitle.trim()}' locked in! Let's start Day 1 strong! 🔥"`,
      3500
    );
  };

  const totalStreakDays = (streakSummary?.currentStreak ?? 0) * (goals.length || 1);

  return (
    <div className="relative w-full rounded-4xl p-6 sm:p-7 glass-card border border-white/15 shadow-xl flex flex-col justify-between card-shine">
      {/* Header */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-emerald-500/20 border border-emerald-400/30 flex items-center justify-center text-emerald-300">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Daily Habit Rituals
            </h2>
            <p className="text-xs text-slate-300">
              {completedGoalIds.size} of {goals.length} completed today ({streakSummary?.todayCompletionRate ?? 0}%)
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddDrawer(!showAddDrawer)}
          className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-emerald-300 bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-400/30 flex items-center gap-1.5 transition-all active:scale-95 shadow-sm"
        >
          <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
          <span>New Habit</span>
        </button>
      </div>

      {/* Add Habit Inline Drawer */}
      {showAddDrawer && (
        <form
          onSubmit={handleCreate}
          className="mb-4 bg-black/45 border border-white/15 rounded-3xl p-4 space-y-3 animate-in fade-in zoom-in-95 duration-200"
        >
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
              Create Custom Habit Ritual
            </span>
            <button
              type="button"
              onClick={() => setShowAddDrawer(false)}
              className="text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <input
              type="text"
              required
              placeholder="e.g. 45m Strength & Mobility"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              className="sm:col-span-2 bg-white/10 border border-white/15 rounded-xl px-3 py-2 text-base sm:text-xs text-white placeholder-slate-400 focus:outline-none focus:border-emerald-400"
            />
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              className="bg-slate-900 border border-white/15 rounded-xl px-3 py-2 text-base sm:text-xs text-white focus:outline-none focus:border-emerald-400"
            >
              {HABIT_CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>

          {/* Quick Icon Selector */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
              <span className="text-[11px] text-slate-300 mr-1">Icon:</span>
              {HABIT_ICONS.map((icon) => (
                <button
                  key={icon}
                  type="button"
                  onClick={() => setNewEmoji(icon)}
                  className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm transition-all ${
                    newEmoji === icon
                      ? 'bg-white/25 ring-2 ring-emerald-400 scale-105'
                      : 'bg-white/10 hover:bg-white/15'
                  }`}
                >
                  {icon}
                </button>
              ))}
            </div>

            <button
              type="submit"
              className="px-4 py-1.5 rounded-xl bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-950 font-extrabold text-xs shadow-md hover:brightness-110 active:scale-95"
            >
              Save Habit
            </button>
          </div>
        </form>
      )}

      {/* Habit Items List */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-1">
        {goals.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-black/25 border border-white/10">
            <p className="text-xs text-slate-300">No habits yet. Tap "+ New Habit" above to start tracking!</p>
          </div>
        ) : (
          goals.map((goal) => {
            const isDone = completedGoalIds.has(goal.id);

            return (
              <div
                key={goal.id}
                onClick={(e) => handleToggle(goal, e)}
                className={`group cursor-pointer rounded-2xl p-3 sm:p-3.5 transition-all duration-300 border flex items-center justify-between gap-3 ${
                  isDone
                    ? 'bg-gradient-to-r from-emerald-500/20 via-teal-500/15 to-transparent border-emerald-400/35 shadow-lg shadow-emerald-950/30'
                    : 'bg-black/30 hover:bg-white/10 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  {/* Animated Icon Ring */}
                  <div
                    className={`w-11 h-11 rounded-2xl flex items-center justify-center text-lg shrink-0 transition-transform duration-300 group-active:scale-90 ${
                      isDone
                        ? 'bg-emerald-400 text-slate-950 shadow-[0_0_16px_rgba(52,211,153,0.5)]'
                        : 'bg-white/10 text-white border border-white/15'
                    }`}
                  >
                    {isDone ? (
                      <Check className="w-5 h-5 stroke-[3]" />
                    ) : (
                      <span>{goal.emoji || '⚡'}</span>
                    )}
                  </div>

                  <div className="min-w-0">
                    <h3
                      className={`text-xs sm:text-sm font-bold truncate transition-all ${
                        isDone
                          ? 'text-emerald-200 line-through decoration-emerald-400/60'
                          : 'text-white'
                      }`}
                    >
                      {goal.title}
                    </h3>
                    <div className="flex items-center gap-1.5 sm:gap-2 mt-0.5 flex-wrap">
                      <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-white/10 text-slate-300">
                        {goal.category || 'Habit'}
                      </span>
                      {goal.target && (
                        <span className="text-[10px] text-white/60">
                          🎯 {goal.target}
                        </span>
                      )}
                      <span className="text-[11px] font-bold text-orange-300 flex items-center gap-0.5">
                        <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400" />
                        <span>{streakSummary?.currentStreak ?? 1}d streak</span>
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span
                    className={`text-[11px] font-semibold px-2.5 py-1 rounded-full ${
                      isDone
                        ? 'bg-emerald-400/20 text-emerald-300'
                        : 'bg-white/5 text-slate-400 group-hover:text-white'
                    }`}
                  >
                    {isDone ? 'Done' : 'Log'}
                  </span>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteGoal(goal.id);
                    }}
                    className="opacity-60 hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 rounded-lg transition-opacity"
                    title="Delete habit"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Info */}
      <div className="mt-4 pt-3 border-t border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 text-[11px] text-slate-300">
        <span className="flex items-center gap-1.5">
          <Flame className="w-3.5 h-3.5 text-orange-400 fill-orange-400 shrink-0" />
          <span>Completing habits powers up your companion & updates weekly rings</span>
        </span>
        <span className="font-bold text-amber-300 shrink-0">
          🔥 {streakSummary?.currentStreak ?? 0} Current Streak Days
        </span>
      </div>
    </div>
  );
}
