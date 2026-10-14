'use client';

import React, { useEffect, useState } from 'react';
import { useStreakly } from '@/lib/storage';
import { formatHeroDate, getGreetingForHour, getLocalTimeZone } from '@/lib/time';
import { Flame, Trophy, Award, CheckCircle2, AlertCircle, Sparkles } from 'lucide-react';

export function HeroStreakSection() {
  const { profile, streakSummary } = useStreakly();
  const [currentTimeStr, setCurrentTimeStr] = useState<string>('');
  const [greeting, setGreeting] = useState<string>('Welcome');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const tz = getLocalTimeZone();
      const timeFormatter = new Intl.DateTimeFormat('en-US', {
        timeZone: tz,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
        hour12: true,
      });
      setCurrentTimeStr(`${timeFormatter.format(now)} (${tz.replace('_', ' ')})`);
      setGreeting(getGreetingForHour(now.getHours()));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const currentStreak = streakSummary?.currentStreak ?? 0;
  const bestStreak = streakSummary?.bestStreak ?? 0;
  const todayDone = streakSummary?.todayCompletedCount ?? 0;
  const todayTotal = streakSummary?.todayTotalCount ?? 0;
  const todayRate = streakSummary?.todayCompletionRate ?? 0;
  const allDone = streakSummary?.allTodayGoalsDone ?? false;
  const missedYesterday = streakSummary?.missedYesterday ?? false;

  return (
    <section className="relative w-full rounded-4xl p-6 sm:p-8 glass-card border border-white/15 overflow-hidden shadow-2xl">
      {/* Background glow orbs */}
      <div className="absolute -top-24 -right-24 w-80 h-80 rounded-full bg-accent-glow blur-3xl pointer-events-none opacity-40" />
      <div className="absolute -bottom-24 -left-24 w-72 h-72 rounded-full bg-accent-secondary/20 blur-3xl pointer-events-none opacity-30" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
        {/* Left Column: Greeting & Date */}
        <div className="space-y-2 max-w-xl">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold tracking-wider text-muted-foreground uppercase">
            <span>{formatHeroDate()}</span>
            <span>•</span>
            <span className="font-mono text-white/70">{currentTimeStr}</span>
          </div>

          <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black tracking-tight text-white flex flex-wrap items-center gap-2">
            <span>{greeting},</span>
            <span className="accent-gradient-text">
              {profile?.displayName ?? 'Track-Star'}
            </span>
            <span className="text-2xl sm:text-4xl">{profile?.avatarEmoji}</span>
          </h1>

          <p className="text-sm sm:text-base text-white/75 font-normal leading-relaxed">
            {allDone
              ? 'Incredible work! You have completed all your daily habits. Bloop is celebrating! 👑'
              : missedYesterday
              ? 'Yesterday was a rest day. Today is your moment to ignite a brand new streak! 🔥'
              : todayRate >= (profile?.settings?.streakThreshold ?? 70)
              ? 'Streak secured for today! Keep up the momentum or rest well.'
              : `${todayTotal - todayDone} habit${todayTotal - todayDone === 1 ? '' : 's'} remaining today to maintain your streak.`}
          </p>

          {allDone && (
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold animate-bounce">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>All daily goals 100% achieved today!</span>
            </div>
          )}
        </div>

        {/* Right Column: Hero Streak Stat Cards */}
        <div className="w-full lg:w-auto grid grid-cols-2 gap-2.5 sm:flex sm:items-stretch sm:gap-4">
          {/* Main Streak Card */}
          <div className="relative p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-white/25 transition-all sm:w-52">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span className="uppercase tracking-wider text-[10px] sm:text-xs">Current Streak</span>
              <div className="p-1 rounded-xl bg-amber-500/20 text-amber-400">
                <Flame className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-amber-400 animate-pulse" />
              </div>
            </div>

            <div className="my-2 sm:my-3 flex items-baseline gap-1.5 sm:gap-2">
              <span className="text-3xl sm:text-5xl font-black tracking-tight text-white">
                {currentStreak}
              </span>
              <span className="text-xs sm:text-sm font-bold text-white/60">
                {currentStreak === 1 ? 'day' : 'days'}
              </span>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] sm:text-xs font-medium text-amber-300/90 truncate">
              <Trophy className="w-3 h-3 sm:w-3.5 sm:h-3.5 shrink-0" />
              <span className="truncate">Best: {bestStreak} days</span>
            </div>
          </div>

          {/* Today's Completion Card */}
          <div className="relative p-4 sm:p-5 rounded-3xl bg-white/5 border border-white/15 backdrop-blur-xl flex flex-col justify-between shadow-lg hover:border-white/25 transition-all sm:w-56">
            <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
              <span className="uppercase tracking-wider text-[10px] sm:text-xs">Today’s Goal</span>
              <div className="p-1 rounded-xl bg-accent-soft text-accent-primary">
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </div>
            </div>

            <div className="my-2 sm:my-3">
              <div className="flex items-baseline justify-between mb-1.5 sm:mb-2">
                <span className="text-xl sm:text-3xl font-black text-white">
                  {todayDone}/{todayTotal}
                </span>
                <span className="text-xs sm:text-sm font-bold text-accent-primary">
                  {todayRate}%
                </span>
              </div>

              {/* Linear Progress Bar */}
              <div className="w-full h-2 sm:h-2.5 rounded-full bg-white/10 overflow-hidden p-0.5">
                <div
                  className="h-full rounded-full accent-gradient-bg transition-all duration-700 ease-out shadow-sm"
                  style={{ width: `${Math.min(100, todayRate)}%` }}
                />
              </div>
            </div>

            <div className="text-[10px] sm:text-[11px] text-white/60 font-medium flex items-center justify-between">
              <span>Goal: {profile?.settings?.streakThreshold ?? 70}%+</span>
              <span className={todayRate >= (profile?.settings?.streakThreshold ?? 70) ? 'text-emerald-400 font-semibold' : 'text-white/50'}>
                {todayRate >= (profile?.settings?.streakThreshold ?? 70) ? '✓ Met' : 'Active'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
