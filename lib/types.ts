export type ProfileId = 'visal' | 'pooja';

export type ProfileRole = 'master' | 'member';

export type ThemePresetId =
  | 'electric-cobalt'
  | 'sunset-rose'
  | 'emerald-zen'
  | 'aurora-violet'
  | 'amber-gold';

export type BackgroundCategory =
  | 'auto'
  | 'sunrise'
  | 'study'
  | 'mountains'
  | 'ocean'
  | 'night'
  | 'alpine'
  | 'aurora'
  | 'dunes'
  | 'zen'
  | 'cyber';

export type AppearanceMode = 'dark' | 'light';

export interface Goal {
  id: string;
  title: string;
  emoji?: string;
  category?: string;
  target?: string;
  order: number;
  createdAt: string;
  archived?: boolean;
}

export interface GoalLog {
  date: string; // 'YYYY-MM-DD'
  goalId: string;
  done: boolean;
  doneAt?: string;
}

export type TodoPriority = 'low' | 'medium' | 'high' | 'chill';

export interface Todo {
  id: string;
  date: string; // 'YYYY-MM-DD'
  title: string;
  time?: string;
  priority: TodoPriority;
  done: boolean;
  repeat?: 'daily' | 'weekdays' | null;
  order: number;
}

export interface Countdown {
  id: string;
  title: string;
  emoji?: string;
  color: string;
  targetISO: string;
  category?: string;
  createdAt?: number;
  archived?: boolean;
}

export type PetSkin = 'classic-bloop' | 'berry-bloop' | 'mint-bloop' | 'cosmic-bloop';

export interface Pet {
  name: string;
  treats: number;
  lastSeen: string;
  skin?: PetSkin;
  level?: number;
  xp?: number;
}

export interface Settings {
  theme: ThemePresetId;
  appearance: AppearanceMode;
  backgroundCategory: BackgroundCategory;
  streakThreshold: number; // default 70 (%)
  sound: boolean;
  pin?: string | null;
  avatarEmoji?: string;
  displayName?: string;
  lastVisitor?: {
    actor: ProfileId;
    at: string;
  } | null;
}

export interface ActivityEntry {
  id: string;
  actor: ProfileId;
  subject: ProfileId;
  text: string;
  at: string; // ISO timestamp
}

export interface ProfileDocument {
  profileId: ProfileId;
  role: ProfileRole;
  displayName: string;
  avatarEmoji: string;
  goals: Goal[];
  goalLogs: GoalLog[];
  todos: Todo[];
  countdowns: Countdown[];
  pet: Pet;
  settings: Settings;
  updatedAt: string;
}

export interface DayStreakStat {
  date: string; // 'YYYY-MM-DD'
  dayLabel: string; // 'Mon', 'Tue', etc.
  totalGoals: number;
  completedGoals: number;
  completionRate: number; // 0 to 100
  isStreakDay: boolean;
  isToday: boolean;
  isFuture: boolean;
}

export interface StreakSummary {
  currentStreak: number;
  bestStreak: number;
  weeklyCompletionRate: number;
  todayCompletionRate: number;
  todayCompletedCount: number;
  todayTotalCount: number;
  allTodayGoalsDone: boolean;
  missedYesterday: boolean;
  weeklyDays: DayStreakStat[]; // Mon-Sun of current week
  heatmapDays: DayStreakStat[]; // 84 days (12 weeks)
}

export type PetReactionState =
  | 'idle'
  | 'pet'
  | 'celebrate'
  | 'happy'
  | 'focus'
  | 'undo'
  | 'curious'
  | 'squish-giggle'
  | 'double-tap-jump'
  | 'purring-hold'
  | 'dragging'
  | 'dizzy-rapid'
  | 'shaken'
  | 'goal-cheer'
  | 'all-goals-dance'
  | 'curious-notepad'
  | 'delete-gasp'
  | 'streak-flame'
  | 'sad-rain'
  | 'urgent-sweat'
  | 'urgent-headband'
  | 'countdown-party'
  | 'scroll-dart'
  | 'yawning'
  | 'sleeping'
  | 'startled-wake'
  | 'night-sleepy'
  | 'welcome-wave'
  | 'visitor-alert'
  | 'eating-treat';

export type PetMood = 'ecstatic' | 'happy' | 'neutral' | 'hungry-for-progress';

export interface ApiProfileResponse {
  profile: ProfileDocument;
  activity: ActivityEntry[];
  storageMode: 'redis' | 'local-fallback';
  serverTime: string;
}

export interface ApiPutPayload {
  profile: ProfileDocument;
  activityText?: string;
}
