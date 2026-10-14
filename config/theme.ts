import {
  ProfileDocument,
  ProfileId,
  ThemePresetId,
} from '@/lib/types';

export interface ThemePreset {
  id: ThemePresetId;
  name: string;
  primary: string;
  secondary: string;
  glow: string;
  soft: string;
  gradient: string;
  badgeBg: string;
}

export const THEME_PRESETS: Record<ThemePresetId, ThemePreset> = {
  'electric-cobalt': {
    id: 'electric-cobalt',
    name: 'Electric Cobalt',
    primary: '#3b82f6',
    secondary: '#8b5cf6',
    glow: 'rgba(59, 130, 246, 0.45)',
    soft: 'rgba(59, 130, 246, 0.14)',
    gradient: 'linear-gradient(135deg, #2563eb 0%, #7c3aed 55%, #c084fc 100%)',
    badgeBg: 'from-blue-500 to-violet-600',
  },
  'sunset-rose': {
    id: 'sunset-rose',
    name: 'Sunset Rose',
    primary: '#f43f5e',
    secondary: '#f59e0b',
    glow: 'rgba(244, 63, 94, 0.45)',
    soft: 'rgba(244, 63, 94, 0.14)',
    gradient: 'linear-gradient(135deg, #f43f5e 0%, #fb7185 45%, #f59e0b 100%)',
    badgeBg: 'from-rose-500 to-amber-500',
  },
  'emerald-zen': {
    id: 'emerald-zen',
    name: 'Emerald Zen',
    primary: '#10b981',
    secondary: '#06b6d4',
    glow: 'rgba(16, 185, 129, 0.42)',
    soft: 'rgba(16, 185, 129, 0.14)',
    gradient: 'linear-gradient(135deg, #059669 0%, #10b981 50%, #06b6d4 100%)',
    badgeBg: 'from-emerald-500 to-cyan-500',
  },
  'aurora-violet': {
    id: 'aurora-violet',
    name: 'Aurora Violet',
    primary: '#a855f7',
    secondary: '#ec4899',
    glow: 'rgba(168, 85, 247, 0.45)',
    soft: 'rgba(168, 85, 247, 0.14)',
    gradient: 'linear-gradient(135deg, #7e22ce 0%, #a855f7 50%, #ec4899 100%)',
    badgeBg: 'from-purple-500 to-pink-500',
  },
  'amber-gold': {
    id: 'amber-gold',
    name: 'Solar Gold',
    primary: '#f59e0b',
    secondary: '#ea580c',
    glow: 'rgba(245, 158, 11, 0.42)',
    soft: 'rgba(245, 158, 11, 0.14)',
    gradient: 'linear-gradient(135deg, #d97706 0%, #f59e0b 50%, #f43f5e 100%)',
    badgeBg: 'from-amber-500 to-orange-600',
  },
};

export const AVATAR_OPTIONS = [
  '⚡',
  '🌸',
  '🚀',
  '✨',
  '🦋',
  '🔥',
  '🌙',
  '🎧',
  '💎',
  '🦊',
  '🐼',
  '👑',
];

export const COUNTDOWN_COLORS = [
  { id: 'blue', label: 'Cobalt', hex: '#3b82f6', classes: 'from-blue-500/30 to-indigo-600/30 border-blue-400/40' },
  { id: 'rose', label: 'Rose', hex: '#f43f5e', classes: 'from-rose-500/30 to-amber-500/30 border-rose-400/40' },
  { id: 'violet', label: 'Violet', hex: '#8b5cf6', classes: 'from-violet-500/30 to-fuchsia-600/30 border-violet-400/40' },
  { id: 'emerald', label: 'Emerald', hex: '#10b981', classes: 'from-emerald-500/30 to-teal-600/30 border-emerald-400/40' },
  { id: 'amber', label: 'Amber', hex: '#f59e0b', classes: 'from-amber-500/30 to-orange-600/30 border-amber-400/40' },
];

export function createInitialProfileDocument(
  profileId: ProfileId,
  todayStr: string,
  yesterdayStr: string,
  twoDaysAgoStr: string
): ProfileDocument {
  const nowISO = new Date().toISOString();
  const inFiveDaysISO = new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString();
  const inFourteenDaysISO = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString();

  if (profileId === 'visal') {
    return {
      profileId: 'visal',
      role: 'master',
      displayName: 'Visal',
      avatarEmoji: '⚡',
      goals: [
        {
          id: 'v-goal-1',
          title: 'Cloud & Architecture Deep Work',
          emoji: '☁️',
          target: '2 hrs',
          order: 0,
          createdAt: nowISO,
        },
        {
          id: 'v-goal-2',
          title: 'Strength & Conditioning Session',
          emoji: '🏋️',
          target: '60 min',
          order: 1,
          createdAt: nowISO,
        },
        {
          id: 'v-goal-3',
          title: 'Hydration & Clean Nutrition',
          emoji: '💧',
          target: '3 Liters',
          order: 2,
          createdAt: nowISO,
        },
        {
          id: 'v-goal-4',
          title: 'Review Project Sprint & Ventures',
          emoji: '🚀',
          target: '45 min',
          order: 3,
          createdAt: nowISO,
        },
      ],
      goalLogs: [
        { date: twoDaysAgoStr, goalId: 'v-goal-1', done: true, doneAt: nowISO },
        { date: twoDaysAgoStr, goalId: 'v-goal-2', done: true, doneAt: nowISO },
        { date: twoDaysAgoStr, goalId: 'v-goal-3', done: true, doneAt: nowISO },
        { date: yesterdayStr, goalId: 'v-goal-1', done: true, doneAt: nowISO },
        { date: yesterdayStr, goalId: 'v-goal-2', done: true, doneAt: nowISO },
        { date: yesterdayStr, goalId: 'v-goal-3', done: true, doneAt: nowISO },
        { date: yesterdayStr, goalId: 'v-goal-4', done: true, doneAt: nowISO },
        { date: todayStr, goalId: 'v-goal-1', done: true, doneAt: nowISO },
      ],
      todos: [
        {
          id: 'v-todo-1',
          date: todayStr,
          title: 'Deploy latest cloud lab YAML templates',
          time: '10:30',
          priority: 'high',
          done: true,
          repeat: null,
          order: 0,
        },
        {
          id: 'v-todo-2',
          date: todayStr,
          title: 'Evening gym session + mobility work',
          time: '18:00',
          priority: 'medium',
          done: false,
          repeat: 'daily',
          order: 1,
        },
        {
          id: 'v-todo-3',
          date: todayStr,
          title: 'Check in on Pooja’s study streak',
          time: '20:30',
          priority: 'low',
          done: false,
          repeat: 'daily',
          order: 2,
        },
      ],
      countdowns: [
        {
          id: 'v-cd-1',
          title: 'Cloud Systems Final Assessment',
          emoji: '⚡',
          color: 'blue',
          targetISO: inFiveDaysISO,
        },
        {
          id: 'v-cd-2',
          title: 'Milestone Launch Sprint',
          emoji: '🚀',
          color: 'violet',
          targetISO: inFourteenDaysISO,
        },
      ],
      pet: {
        name: 'Bloop',
        treats: 6,
        lastSeen: nowISO,
        skin: 'classic-bloop',
      },
      settings: {
        theme: 'electric-cobalt',
        appearance: 'dark',
        backgroundCategory: 'auto',
        streakThreshold: 70,
        sound: true,
        pin: null,
        avatarEmoji: '⚡',
        displayName: 'Visal',
        lastVisitor: null,
      },
      updatedAt: nowISO,
    };
  }

  return {
    profileId: 'pooja',
    role: 'member',
    displayName: 'Pooja',
    avatarEmoji: '🌸',
    goals: [
      {
        id: 'p-goal-1',
        title: 'Focused Study Session',
        emoji: '📚',
        target: '2 hrs',
        order: 0,
        createdAt: nowISO,
      },
      {
        id: 'p-goal-2',
        title: 'Morning Mindfulness & Stretch',
        emoji: '🧘‍♀️',
        target: '20 min',
        order: 1,
        createdAt: nowISO,
      },
      {
        id: 'p-goal-3',
        title: 'Drink 8 Glasses of Water',
        emoji: '💧',
        target: '2 Liters',
        order: 2,
        createdAt: nowISO,
      },
      {
        id: 'p-goal-4',
        title: 'Practice Notes & Flashcards',
        emoji: '✨',
        target: '45 min',
        order: 3,
        createdAt: nowISO,
      },
    ],
    goalLogs: [
      { date: twoDaysAgoStr, goalId: 'p-goal-1', done: true, doneAt: nowISO },
      { date: twoDaysAgoStr, goalId: 'p-goal-2', done: true, doneAt: nowISO },
      { date: twoDaysAgoStr, goalId: 'p-goal-3', done: true, doneAt: nowISO },
      { date: yesterdayStr, goalId: 'p-goal-1', done: true, doneAt: nowISO },
      { date: yesterdayStr, goalId: 'p-goal-2', done: true, doneAt: nowISO },
      { date: yesterdayStr, goalId: 'p-goal-3', done: true, doneAt: nowISO },
      { date: yesterdayStr, goalId: 'p-goal-4', done: true, doneAt: nowISO },
      { date: todayStr, goalId: 'p-goal-1', done: true, doneAt: nowISO },
      { date: todayStr, goalId: 'p-goal-3', done: true, doneAt: nowISO },
    ],
    todos: [
      {
        id: 'p-todo-1',
        date: todayStr,
        title: 'Complete Chapter 4 revision notes',
        time: '14:00',
        priority: 'high',
        done: true,
        repeat: null,
        order: 0,
      },
      {
        id: 'p-todo-2',
        date: todayStr,
        title: 'Practice mock paper questions',
        time: '17:30',
        priority: 'high',
        done: false,
        repeat: 'weekdays',
        order: 1,
      },
      {
        id: 'p-todo-3',
        date: todayStr,
        title: 'Evening playlist & unwind walk',
        time: '20:00',
        priority: 'low',
        done: false,
        repeat: 'daily',
        order: 2,
      },
    ],
    countdowns: [
      {
        id: 'p-cd-1',
        title: 'Upcoming Exam Paper 1',
        emoji: '📝',
        color: 'rose',
        targetISO: inFiveDaysISO,
      },
      {
        id: 'p-cd-2',
        title: 'Special Celebration Weekend',
        emoji: '💜',
        color: 'amber',
        targetISO: inFourteenDaysISO,
      },
    ],
    pet: {
      name: 'Bloop',
      treats: 8,
      lastSeen: nowISO,
      skin: 'berry-bloop',
    },
    settings: {
      theme: 'sunset-rose',
      appearance: 'dark',
      backgroundCategory: 'auto',
      streakThreshold: 70,
      sound: true,
      pin: null,
      avatarEmoji: '🌸',
      displayName: 'Pooja',
      lastVisitor: null,
    },
    updatedAt: nowISO,
  };
}
