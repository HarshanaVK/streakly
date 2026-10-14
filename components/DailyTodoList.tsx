'use client';

import React, { useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { soundEngine } from '@/lib/audio';
import { getTodayDateString } from '@/lib/time';
import { triggerGlobalParticleBurst } from '@/components/ParticleFXOverlay';
import { Todo } from '@/lib/types';
import {
  Check,
  Plus,
  Trash2,
  Calendar,
  Sun,
  RotateCcw,
  Sparkles,
} from 'lucide-react';

export function DailyTodoList() {
  const {
    profile,
    addTodo,
    updateTodo,
    toggleTodo,
    deleteTodo,
    triggerPetReaction,
    gainPetXP,
  } = useStreakly();

  const todayStr = getTodayDateString();
  const [currentFilter, setCurrentFilter] = useState<'all' | 'active' | 'completed'>('all');
  const [taskInput, setTaskInput] = useState('');
  const [taskPriority, setTaskPriority] = useState<Todo['priority']>('medium');

  const todos = profile?.todos ?? [];
  const soundEnabled = profile?.settings?.sound ?? true;

  const handleAdd = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskInput.trim()) return;

    addTodo(todayStr, taskInput.trim(), undefined, taskPriority);
    setTaskInput('');
    triggerPetReaction(
      'focus',
      `"Added '${taskInput.trim()}' to today's mission list! Let's knock it out! 🎯"`,
      3500
    );
  };

  const handleToggle = (todo: Todo, e: React.MouseEvent) => {
    const nextDone = !todo.done;
    const rect = e.currentTarget.getBoundingClientRect();

    if (nextDone) {
      triggerGlobalParticleBurst(
        rect.left + rect.width / 2,
        rect.top + rect.height / 2,
        'celebrate'
      );
      soundEngine.playTone('complete', soundEnabled);
      gainPetXP(15, todo.title);
      triggerPetReaction(
        'celebrate',
        `"Task checked off! ★‿★ '${todo.title}' is DONE! (+15 XP)"`,
        3500
      );
    } else {
      soundEngine.playTone('undo', soundEnabled);
      triggerPetReaction(
        'undo',
        `"Moved '${todo.title}' back to active list! Ready whenever you are."`,
        3000
      );
    }

    toggleTodo(todo.id);
  };

  const handleInlineEdit = (todoId: string, currentText: string, newText: string) => {
    const trimmed = newText.trim();
    if (trimmed && trimmed !== currentText) {
      updateTodo(todoId, { title: trimmed });
      soundEngine.playTone('pop', soundEnabled);
      triggerPetReaction(
        'focus',
        `"Updated task to: '${trimmed}'! Adaptability is key! ✏️"`,
        3000
      );
    }
  };

  const handleNewDayReset = () => {
    todos.forEach((t) => {
      if (t.done) updateTodo(t.id, { done: false });
    });
    soundEngine.playTone('pop', soundEnabled);
    triggerPetReaction(
      'happy',
      '"🌅 Fresh day reset! All daily tasks are unchecked and ready for today’s run!"',
      3500
    );
  };

  const handleClearCompleted = () => {
    const completed = todos.filter((t) => t.done);
    completed.forEach((t) => deleteTodo(t.id));
    soundEngine.playTone('pop', soundEnabled);
    triggerPetReaction(
      'celebrate',
      '"✨ Cleared completed tasks! Look how clean that workspace is!"',
      3500
    );
  };

  const filtered = todos.filter((t) => {
    if (currentFilter === 'active') return !t.done;
    if (currentFilter === 'completed') return t.done;
    return true;
  });

  const getPriorityStyle = (p: Todo['priority']) => {
    switch (p) {
      case 'high':
        return { label: '🔥 High', cls: 'bg-rose-500/20 text-rose-300 border-rose-400/30' };
      case 'chill':
        return { label: '🌿 Chill', cls: 'bg-emerald-500/20 text-emerald-300 border-emerald-400/30' };
      case 'medium':
      default:
        return { label: '⚡ Medium', cls: 'bg-amber-500/20 text-amber-300 border-amber-400/30' };
    }
  };

  return (
    <div className="relative w-full rounded-4xl p-6 sm:p-7 glass-card border border-white/15 shadow-xl flex flex-col justify-between card-shine">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-cyan-500/20 border border-cyan-400/30 flex items-center justify-center text-cyan-300">
            <Calendar className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-white tracking-tight">
              Daily Action To-Do List
            </h2>
            <p className="text-xs text-slate-300">
              Click checkbox to complete • <span className="text-cyan-300 font-medium">Tap task text to edit inline</span>
            </p>
          </div>
        </div>

        {/* Filter Pills + Actions */}
        <div className="flex flex-wrap items-center gap-1.5">
          <div className="bg-black/35 border border-white/10 rounded-full p-1 flex items-center text-xs">
            {(['all', 'active', 'completed'] as const).map((f) => (
              <button
                key={f}
                onClick={() => setCurrentFilter(f)}
                className={`px-2.5 py-1 rounded-full text-xs transition-all ${
                  currentFilter === f
                    ? 'font-bold bg-white/20 text-white shadow-sm'
                    : 'font-medium text-slate-300 hover:text-white'
                }`}
              >
                {f === 'all' ? 'All' : f === 'active' ? 'Active' : 'Done'}
              </button>
            ))}
          </div>

          <button
            onClick={handleNewDayReset}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-amber-200 bg-white/5 hover:bg-amber-500/20 border border-white/10 transition-all flex items-center gap-1"
            title="Uncheck all tasks for a fresh day"
          >
            <span>🌅</span>
            <span className="hidden sm:inline">New Day</span>
          </button>

          <button
            onClick={handleClearCompleted}
            className="px-3 py-1.5 rounded-full text-xs font-medium text-rose-200 bg-white/5 hover:bg-rose-500/20 border border-white/10 transition-all flex items-center gap-1"
            title="Remove completed tasks"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Clear Done</span>
          </button>
        </div>
      </div>

      {/* Fast Add To-Do Input Bar */}
      <form onSubmit={handleAdd} className="flex flex-col sm:flex-row gap-2 mb-4">
        <input
          type="text"
          value={taskInput}
          onChange={(e) => setTaskInput(e.target.value)}
          placeholder="Add a task for today (or tap any existing task below to rewrite it)..."
          className="flex-1 bg-black/40 border border-white/15 rounded-2xl px-4 py-3 text-base sm:text-sm text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 transition-colors"
        />

        <div className="flex gap-2">
          <select
            value={taskPriority}
            onChange={(e) => setTaskPriority(e.target.value as Todo['priority'])}
            className="bg-slate-900 border border-white/15 rounded-2xl px-3.5 py-3 text-xs font-semibold text-white focus:outline-none focus:border-cyan-400"
          >
            <option value="high">🔥 High Priority</option>
            <option value="medium">⚡ Medium</option>
            <option value="chill">🌿 Chill</option>
          </select>

          <button
            type="submit"
            className="px-5 py-3 rounded-2xl bg-gradient-to-r from-cyan-400 to-blue-500 text-slate-950 font-extrabold text-xs sm:text-sm shadow-lg shadow-cyan-500/20 hover:brightness-110 active:scale-95 whitespace-nowrap"
          >
            Add Task
          </button>
        </div>
      </form>

      {/* To-Do Items List */}
      <div className="space-y-2 max-h-[350px] overflow-y-auto pr-1">
        {filtered.length === 0 ? (
          <div className="p-8 text-center rounded-3xl bg-black/25 border border-white/10">
            <p className="text-xs text-slate-300">No tasks in this view. Add a new task above or switch filter tabs!</p>
          </div>
        ) : (
          filtered.map((todo) => {
            const p = getPriorityStyle(todo.priority);

            return (
              <div
                key={todo.id}
                className={`group rounded-2xl p-3 sm:px-4 border transition-all flex items-center justify-between gap-3 ${
                  todo.done
                    ? 'bg-emerald-950/20 border-emerald-400/25 opacity-80'
                    : 'bg-black/35 hover:bg-black/50 border-white/10'
                }`}
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  {/* Checkbox Button */}
                  <button
                    onClick={(e) => handleToggle(todo, e)}
                    className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 transition-all ${
                      todo.done
                        ? 'bg-emerald-400 text-slate-950 shadow-[0_0_12px_rgba(52,211,153,0.5)]'
                        : 'border-2 border-white/30 hover:border-cyan-400 bg-white/5'
                    }`}
                  >
                    {todo.done && <Check className="w-4 h-4 stroke-[3]" />}
                  </button>

                  {/* Inline Editable Task Text */}
                  <input
                    type="text"
                    defaultValue={todo.title}
                    onBlur={(e) => handleInlineEdit(todo.id, todo.title, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') e.currentTarget.blur();
                    }}
                    title="Click to edit task inline"
                    className={`w-full bg-transparent text-xs sm:text-sm font-medium focus:outline-none focus:bg-white/10 focus:px-2.5 py-1 rounded-lg transition-all ${
                      todo.done ? 'line-through text-slate-400' : 'text-white'
                    }`}
                  />
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${p.cls}`}>
                    {p.label}
                  </span>
                  <button
                    onClick={() => deleteTodo(todo.id)}
                    className="opacity-60 hover:opacity-100 p-1.5 text-slate-400 hover:text-rose-400 rounded-lg"
                    title="Delete task"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
