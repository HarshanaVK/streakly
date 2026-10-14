'use client';

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { createInitialProfileDocument, THEME_PRESETS } from '@/config/theme';
import { soundEngine } from '@/lib/audio';
import { triggerHaptic } from '@/lib/haptics';
import { canReadProfile, canWriteProfile, isValidProfileId } from '@/lib/permissions';
import { computeStreakSummary } from '@/lib/streaks';
import { addDays, getTodayDateString } from '@/lib/time';
import {
  ActivityEntry,
  ApiProfileResponse,
  Countdown,
  Goal,
  PetReactionState,
  ProfileDocument,
  ProfileId,
  Settings,
  StreakSummary,
  Todo,
} from '@/lib/types';

const LS_ACTIVE_ACTOR_KEY = 'streakly:actorProfileId';
const LS_LAST_PROFILE_KEY = 'streakly:lastProfileId';
const LS_PROFILE_CACHE_PREFIX = 'streakly:cache:profile:';
const LS_ACTIVITY_CACHE_KEY = 'streakly:cache:activity';
const LS_DIRTY_QUEUE_PREFIX = 'streakly:dirty:';
const SS_INTRO_SEEN_KEY = 'streakly:introSeen';

interface StreaklyContextValue {
  // Navigation & identity
  hasSeenIntro: boolean;
  markIntroSeen: () => void;
  actorProfileId: ProfileId | null;
  viewingProfileId: ProfileId | null;
  selectActorProfile: (profileId: ProfileId, pinAttempt?: string) => boolean;
  switchViewingProfile: (targetId: ProfileId) => void;
  logoutToPicker: () => void;
  isMasterModeViewingOther: boolean;

  // Data & computed state
  profile: ProfileDocument | null;
  visalPinRequired: boolean;
  checkVisalPin: (pin: string) => boolean;
  streakSummary: StreakSummary | null;
  activityLog: ActivityEntry[];
  storageMode: 'redis' | 'local-fallback';
  isOnline: boolean;
  isSyncing: boolean;
  lastSyncedAt: string | null;

  // Pet reaction bus
  petReaction: PetReactionState;
  petSpeechBubble: string | null;
  triggerPetReaction: (
    state: PetReactionState,
    speech?: string,
    durationMs?: number
  ) => void;

  // Goal mutations
  toggleGoalToday: (goalId: string, dateStr?: string) => void;
  addGoal: (title: string, emoji?: string, target?: string) => void;
  updateGoal: (goalId: string, updates: Partial<Goal>) => void;
  deleteGoal: (goalId: string) => void;
  reorderGoals: (orderedGoals: Goal[]) => void;

  // Todo mutations
  addTodo: (
    date: string,
    title: string,
    time?: string,
    priority?: Todo['priority'],
    repeat?: Todo['repeat']
  ) => void;
  updateTodo: (todoId: string, updates: Partial<Todo>) => void;
  toggleTodo: (todoId: string) => void;
  deleteTodo: (todoId: string) => Todo | null;
  restoreTodo: (todo: Todo) => void;
  moveUnfinishedTodosToTomorrow: (fromDateStr: string) => number;

  // Countdown mutations
  addCountdown: (
    title: string,
    targetISO: string,
    emoji?: string,
    color?: string
  ) => void;
  updateCountdown: (countdownId: string, updates: Partial<Countdown>) => void;
  deleteCountdown: (countdownId: string) => void;

  // Pet & Settings mutations
  feedPet: () => boolean;
  renamePet: (newName: string) => void;
  gainPetXP: (
    amount: number,
    reason?: string
  ) => { leveledUp: boolean; nextLevel: number; nextXp: number } | undefined;
  updateSettings: (updates: Partial<Settings>) => void;

  // Master-only actions
  resetProfileStreak: () => void;
  exportProfileJson: () => string;
  importProfileJson: (rawJson: string) => boolean;
  refreshNow: () => Promise<void>;
  getProfileLastStreakPreview: (profileId: ProfileId) => number;
}

const StreaklyContext = createContext<StreaklyContextValue | null>(null);

function loadLocalProfile(profileId: ProfileId): ProfileDocument {
  if (typeof window === 'undefined') {
    const today = getTodayDateString();
    return createInitialProfileDocument(
      profileId,
      today,
      addDays(today, -1),
      addDays(today, -2)
    );
  }
  try {
    const raw = localStorage.getItem(`${LS_PROFILE_CACHE_PREFIX}${profileId}`);
    if (raw) {
      return JSON.parse(raw) as ProfileDocument;
    }
  } catch {
    // ignore parse error
  }
  const today = getTodayDateString();
  const seed = createInitialProfileDocument(
    profileId,
    today,
    addDays(today, -1),
    addDays(today, -2)
  );
  try {
    localStorage.setItem(
      `${LS_PROFILE_CACHE_PREFIX}${profileId}`,
      JSON.stringify(seed)
    );
  } catch {
    // ignore quota error
  }
  return seed;
}

function saveLocalProfile(profileId: ProfileId, doc: ProfileDocument): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(
      `${LS_PROFILE_CACHE_PREFIX}${profileId}`,
      JSON.stringify(doc)
    );
  } catch {
    // ignore storage errors
  }
}

export function StreaklyProvider({ children }: { children: React.ReactNode }) {
  const [hasSeenIntro, setHasSeenIntro] = useState<boolean>(false);
  const [actorProfileId, setActorProfileId] = useState<ProfileId | null>(null);
  const [viewingProfileId, setViewingProfileId] = useState<ProfileId | null>(null);

  const [profilesMap, setProfilesMap] = useState<Record<ProfileId, ProfileDocument>>(
    () => ({
      visal: loadLocalProfile('visal'),
      pooja: loadLocalProfile('pooja'),
    })
  );

  const [activityLog, setActivityLog] = useState<ActivityEntry[]>([]);
  const [storageMode, setStorageMode] = useState<'redis' | 'local-fallback'>(
    'local-fallback'
  );
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);

  // Pet state machine transient reaction
  const [petReaction, setPetReaction] = useState<PetReactionState>('idle');
  const [petSpeechBubble, setPetSpeechBubble] = useState<string | null>(null);
  const reactionTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  const triggerPetReaction = useCallback(
    (
      state: PetReactionState,
      speech?: string,
      durationMs: number = 3200
    ) => {
      if (reactionTimeoutRef.current) {
        clearTimeout(reactionTimeoutRef.current);
      }
      setPetReaction(state);
      setPetSpeechBubble(speech ?? null);

      if (state !== 'idle' && state !== 'sleeping') {
        reactionTimeoutRef.current = setTimeout(() => {
          setPetReaction('idle');
          setPetSpeechBubble(null);
        }, durationMs);
      }
    },
    []
  );

  // Hydrate client session & local caches on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const introSeen = sessionStorage.getItem(SS_INTRO_SEEN_KEY) === 'true';
    setHasSeenIntro(introSeen);

    const vDoc = loadLocalProfile('visal');
    const pDoc = loadLocalProfile('pooja');
    setProfilesMap({ visal: vDoc, pooja: pDoc });

    const savedActor = localStorage.getItem(LS_ACTIVE_ACTOR_KEY) as ProfileId | null;
    const savedViewing = localStorage.getItem(LS_LAST_PROFILE_KEY) as ProfileId | null;
    if (savedActor && isValidProfileId(savedActor)) {
      setActorProfileId(savedActor);
      setViewingProfileId(
        savedViewing && isValidProfileId(savedViewing) ? savedViewing : savedActor
      );
    }

    try {
      const cachedActivity = localStorage.getItem(LS_ACTIVITY_CACHE_KEY);
      if (cachedActivity) {
        setActivityLog(JSON.parse(cachedActivity));
      }
    } catch {
      // ignore
    }

    setIsOnline(navigator.onLine);
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const activeProfile = useMemo(() => {
    if (!viewingProfileId) return null;
    return profilesMap[viewingProfileId] ?? null;
  }, [profilesMap, viewingProfileId]);

  // Apply CSS variables & data attributes for active profile theme and appearance
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const targetId = viewingProfileId || 'visal';
    const currentDoc = profilesMap[targetId];

    root.setAttribute('data-profile', targetId);
    root.setAttribute(
      'data-appearance',
      currentDoc?.settings?.appearance || 'dark'
    );

    const preset =
      THEME_PRESETS[currentDoc?.settings?.theme || 'electric-cobalt'] ||
      THEME_PRESETS['electric-cobalt'];

    root.style.setProperty('--accent-primary', preset.primary);
    root.style.setProperty('--accent-secondary', preset.secondary);
    root.style.setProperty('--accent-glow', preset.glow);
    root.style.setProperty('--accent-soft', preset.soft);
    root.style.setProperty('--accent-gradient', preset.gradient);
  }, [viewingProfileId, profilesMap]);

  // Server fetch helper
  const fetchProfileFromServer = useCallback(
    async (actor: ProfileId, target: ProfileId) => {
      if (!canReadProfile(actor, target)) return;
      try {
        setIsSyncing(true);
        const res = await fetch(`/api/profile/${target}`, {
          method: 'GET',
          headers: {
            'x-profile': actor,
          },
          cache: 'no-store',
        });

        if (!res.ok) return;
        const data = (await res.json()) as ApiProfileResponse;

        setStorageMode(data.storageMode);
        setLastSyncedAt(data.serverTime);

        setProfilesMap((prev) => {
          const prevDoc = prev[target];
          // Check if Visal just visited Pooja's space
          if (
            target === 'pooja' &&
            actor === 'pooja' &&
            data.profile.settings.lastVisitor?.at &&
            data.profile.settings.lastVisitor.at !==
              prevDoc?.settings?.lastVisitor?.at
          ) {
            triggerPetReaction('visitor-alert', "Visal's here 👋", 4500);
          }

          saveLocalProfile(target, data.profile);
          return {
            ...prev,
            [target]: data.profile,
          };
        });

        if (Array.isArray(data.activity)) {
          setActivityLog(data.activity);
          try {
            localStorage.setItem(
              LS_ACTIVITY_CACHE_KEY,
              JSON.stringify(data.activity)
            );
          } catch {
            // ignore
          }
        }
      } catch {
        // Offline or network error: stay gracefully on local cache
      } finally {
        setIsSyncing(false);
      }
    },
    [triggerPetReaction]
  );

  // Push update to server (debounced + optimistic with rollback on 403/400)
  const syncProfileToServer = useCallback(
    async (
      actor: ProfileId,
      target: ProfileId,
      nextDoc: ProfileDocument,
      previousDoc: ProfileDocument,
      activityText?: string
    ) => {
      if (!canWriteProfile(actor, target)) return;

      if (typeof navigator !== 'undefined' && !navigator.onLine) {
        try {
          localStorage.setItem(
            `${LS_DIRTY_QUEUE_PREFIX}${target}`,
            JSON.stringify({ doc: nextDoc, activityText })
          );
        } catch {
          // ignore
        }
        return;
      }

      try {
        setIsSyncing(true);
        const res = await fetch(`/api/profile/${target}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'x-profile': actor,
          },
          body: JSON.stringify({
            profile: nextDoc,
            activityText,
          }),
        });

        if (res.status === 403 || res.status === 400) {
          // Rollback optimistic update on server rejection
          saveLocalProfile(target, previousDoc);
          setProfilesMap((prev) => ({ ...prev, [target]: previousDoc }));
          return;
        }

        if (res.ok) {
          const data = (await res.json()) as ApiProfileResponse;
          setStorageMode(data.storageMode);
          setLastSyncedAt(data.serverTime);
          saveLocalProfile(target, data.profile);
          setProfilesMap((prev) => ({ ...prev, [target]: data.profile }));
          if (Array.isArray(data.activity)) {
            setActivityLog(data.activity);
          }
          try {
            localStorage.removeItem(`${LS_DIRTY_QUEUE_PREFIX}${target}`);
          } catch {
            // ignore
          }
        }
      } catch {
        // Network drop: queue dirty state for next reconnect
        try {
          localStorage.setItem(
            `${LS_DIRTY_QUEUE_PREFIX}${target}`,
            JSON.stringify({ doc: nextDoc, activityText })
          );
        } catch {
          // ignore
        }
      } finally {
        setIsSyncing(false);
      }
    },
    []
  );

  // Flush offline queue when coming back online
  useEffect(() => {
    if (!isOnline || !actorProfileId || !viewingProfileId) return;
    try {
      const rawDirty = localStorage.getItem(
        `${LS_DIRTY_QUEUE_PREFIX}${viewingProfileId}`
      );
      if (rawDirty) {
        const parsed = JSON.parse(rawDirty) as {
          doc: ProfileDocument;
          activityText?: string;
        };
        syncProfileToServer(
          actorProfileId,
          viewingProfileId,
          parsed.doc,
          parsed.doc,
          parsed.activityText
        );
      }
    } catch {
      // ignore
    }
  }, [isOnline, actorProfileId, viewingProfileId, syncProfileToServer]);

  // Poll every 15 seconds & re-fetch on window focus / visibility change
  useEffect(() => {
    if (!actorProfileId || !viewingProfileId) return;

    fetchProfileFromServer(actorProfileId, viewingProfileId);

    const interval = setInterval(() => {
      fetchProfileFromServer(actorProfileId, viewingProfileId);
    }, 15000);

    const handleVisibility = () => {
      if (document.visibilityState === 'visible') {
        fetchProfileFromServer(actorProfileId, viewingProfileId);
        triggerPetReaction('welcome-wave', 'Welcome back! 👋', 3000);
      }
    };

    window.addEventListener('focus', () =>
      fetchProfileFromServer(actorProfileId, viewingProfileId)
    );
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearInterval(interval);
      document.removeEventListener('visibilitychange', handleVisibility);
    };
  }, [
    actorProfileId,
    viewingProfileId,
    fetchProfileFromServer,
    triggerPetReaction,
  ]);

  // Core optimistic mutation dispatcher
  const mutateActiveProfile = useCallback(
    (
      updater: (current: ProfileDocument) => ProfileDocument,
      activityText?: string
    ) => {
      if (!actorProfileId || !viewingProfileId) return;
      if (!canWriteProfile(actorProfileId, viewingProfileId)) return;

      setProfilesMap((prev) => {
        const currentDoc = prev[viewingProfileId];
        const nextDoc: ProfileDocument = {
          ...updater(currentDoc),
          updatedAt: new Date().toISOString(),
        };

        saveLocalProfile(viewingProfileId, nextDoc);

        if (debounceTimerRef.current) {
          clearTimeout(debounceTimerRef.current);
        }
        debounceTimerRef.current = setTimeout(() => {
          syncProfileToServer(
            actorProfileId,
            viewingProfileId,
            nextDoc,
            currentDoc,
            activityText
          );
        }, 320);

        return {
          ...prev,
          [viewingProfileId]: nextDoc,
        };
      });
    },
    [actorProfileId, viewingProfileId, syncProfileToServer]
  );

  // Intro & Profile selection handlers
  const markIntroSeen = useCallback(() => {
    setHasSeenIntro(true);
    if (typeof window !== 'undefined') {
      sessionStorage.setItem(SS_INTRO_SEEN_KEY, 'true');
    }
  }, []);

  const checkVisalPin = useCallback(
    (pin: string): boolean => {
      const configuredPin = profilesMap.visal?.settings?.pin;
      if (!configuredPin) return true;
      return configuredPin.trim() === pin.trim();
    },
    [profilesMap.visal]
  );

  const selectActorProfile = useCallback(
    (profileId: ProfileId, pinAttempt?: string): boolean => {
      if (!isValidProfileId(profileId)) return false;

      if (profileId === 'visal') {
        const configuredPin = profilesMap.visal?.settings?.pin;
        if (configuredPin && configuredPin.trim() !== (pinAttempt ?? '').trim()) {
          return false;
        }
      }

      setActorProfileId(profileId);
      setViewingProfileId(profileId);

      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_ACTIVE_ACTOR_KEY, profileId);
        localStorage.setItem(LS_LAST_PROFILE_KEY, profileId);
      }

      soundEngine.unlock();
      return true;
    },
    [profilesMap.visal]
  );

  const switchViewingProfile = useCallback(
    (targetId: ProfileId) => {
      if (!actorProfileId) return;
      if (!canReadProfile(actorProfileId, targetId)) return;
      setViewingProfileId(targetId);
      if (typeof window !== 'undefined') {
        localStorage.setItem(LS_LAST_PROFILE_KEY, targetId);
      }
      fetchProfileFromServer(actorProfileId, targetId);
    },
    [actorProfileId, fetchProfileFromServer]
  );

  const logoutToPicker = useCallback(() => {
    setActorProfileId(null);
    setViewingProfileId(null);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(LS_ACTIVE_ACTOR_KEY);
      localStorage.removeItem(LS_LAST_PROFILE_KEY);
    }
  }, []);

  // Computed streak summary for the active profile
  const streakSummary = useMemo(() => {
    if (!activeProfile) return null;
    return computeStreakSummary(
      activeProfile.goals,
      activeProfile.goalLogs,
      activeProfile.settings.streakThreshold || 70
    );
  }, [activeProfile]);

  const getProfileLastStreakPreview = useCallback(
    (profileId: ProfileId): number => {
      const doc = profilesMap[profileId];
      if (!doc) return 0;
      const summary = computeStreakSummary(
        doc.goals,
        doc.goalLogs,
        doc.settings.streakThreshold || 70
      );
      return summary.currentStreak;
    },
    [profilesMap]
  );

  // Goal operations
  const toggleGoalToday = useCallback(
    (goalId: string, dateStr: string = getTodayDateString()) => {
      if (!activeProfile || !actorProfileId || !viewingProfileId) return;
      const targetGoal = activeProfile.goals.find((g) => g.id === goalId);
      if (!targetGoal) return;

      const existingLog = activeProfile.goalLogs.find(
        (l) => l.date === dateStr && l.goalId === goalId
      );
      const nextDone = !(existingLog?.done ?? false);

      const prevSummary = computeStreakSummary(
        activeProfile.goals,
        activeProfile.goalLogs,
        activeProfile.settings.streakThreshold
      );

      let nextLogs = activeProfile.goalLogs.filter(
        (l) => !(l.date === dateStr && l.goalId === goalId)
      );
      if (nextDone) {
        nextLogs = [
          ...nextLogs,
          {
            date: dateStr,
            goalId,
            done: true,
            doneAt: new Date().toISOString(),
          },
        ];
      }

      const nextSummary = computeStreakSummary(
        activeProfile.goals,
        nextLogs,
        activeProfile.settings.streakThreshold
      );

      if (nextDone) {
        triggerHaptic(
          nextSummary.allTodayGoalsDone ? 'celebration' : 'success'
        );
        soundEngine.playGoalComplete(activeProfile.settings.sound);

        if (nextSummary.allTodayGoalsDone) {
          triggerPetReaction(
            'all-goals-dance',
            'ALL GOALS CRUSHED! 👑🎉',
            4500
          );
        } else if (nextSummary.currentStreak > prevSummary.currentStreak) {
          triggerPetReaction(
            'streak-flame',
            `${nextSummary.currentStreak}-day streak! 🔥`,
            3800
          );
        } else {
          triggerPetReaction('goal-cheer', 'Woohoo! +1 Treat ✨', 3200);
        }
      } else {
        triggerHaptic('tap');
      }

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      const subjectSuffix =
        actorProfileId !== viewingProfileId
          ? ` (on ${activeProfile.displayName}'s space)`
          : '';
      const activityText = nextDone
        ? `${actorName} completed '${targetGoal.title}'${subjectSuffix}`
        : `${actorName} unchecked '${targetGoal.title}'${subjectSuffix}`;

      mutateActiveProfile(
        (curr) => ({
          ...curr,
          goalLogs: nextLogs,
          pet: {
            ...curr.pet,
            treats: nextDone
              ? curr.pet.treats + 1
              : Math.max(0, curr.pet.treats - 1),
          },
        }),
        activityText
      );
    },
    [
      activeProfile,
      actorProfileId,
      viewingProfileId,
      mutateActiveProfile,
      triggerPetReaction,
    ]
  );

  const addGoal = useCallback(
    (title: string, emoji: string = '✨', target?: string) => {
      if (!activeProfile || !actorProfileId) return;
      const cleanTitle = title.trim();
      if (!cleanTitle) return;

      const newGoal: Goal = {
        id: `goal-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanTitle,
        emoji: emoji || '✨',
        target: target?.trim() || undefined,
        order: activeProfile.goals.length,
        createdAt: new Date().toISOString(),
      };

      triggerHaptic('tap');
      triggerPetReaction('curious-notepad', 'Ooh, a new goal! 📝', 3000);

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          goals: [...curr.goals, newGoal],
        }),
        `${actorName} added goal '${cleanTitle}'`
      );
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const updateGoal = useCallback(
    (goalId: string, updates: Partial<Goal>) => {
      if (!actorProfileId) return;
      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          goals: curr.goals.map((g) =>
            g.id === goalId ? { ...g, ...updates } : g
          ),
        }),
        `${actorName} updated goal '${updates.title || 'item'}'`
      );
    },
    [actorProfileId, mutateActiveProfile]
  );

  const deleteGoal = useCallback(
    (goalId: string) => {
      if (!activeProfile || !actorProfileId) return;
      const target = activeProfile.goals.find((g) => g.id === goalId);
      triggerHaptic('delete');
      triggerPetReaction('delete-gasp', 'Oh! Gone... 🤷', 2800);

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          goals: curr.goals.filter((g) => g.id !== goalId),
          goalLogs: curr.goalLogs.filter((l) => l.goalId !== goalId),
        }),
        `${actorName} deleted goal '${target?.title || 'goal'}'`
      );
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const reorderGoals = useCallback(
    (orderedGoals: Goal[]) => {
      const normalized = orderedGoals.map((g, idx) => ({
        ...g,
        order: idx,
      }));
      mutateActiveProfile((curr) => ({
        ...curr,
        goals: normalized,
      }));
    },
    [mutateActiveProfile]
  );

  // To-do operations
  const addTodo = useCallback(
    (
      date: string,
      title: string,
      time?: string,
      priority: Todo['priority'] = 'medium',
      repeat: Todo['repeat'] = null
    ) => {
      if (!activeProfile || !actorProfileId) return;
      const cleanTitle = title.trim();
      if (!cleanTitle) return;

      const newTodo: Todo = {
        id: `todo-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        date,
        title: cleanTitle,
        time: time?.trim() || undefined,
        priority,
        done: false,
        repeat,
        order: activeProfile.todos.filter((t) => t.date === date).length,
      };

      triggerHaptic('tap');
      triggerPetReaction('curious-notepad', 'Noted on the list! ✍️', 2800);

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          todos: [...curr.todos, newTodo],
        }),
        `${actorName} added task '${cleanTitle}'`
      );
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const updateTodo = useCallback(
    (todoId: string, updates: Partial<Todo>) => {
      mutateActiveProfile((curr) => ({
        ...curr,
        todos: curr.todos.map((t) =>
          t.id === todoId ? { ...t, ...updates } : t
        ),
      }));
    },
    [mutateActiveProfile]
  );

  const toggleTodo = useCallback(
    (todoId: string) => {
      if (!activeProfile || !actorProfileId) return;
      const target = activeProfile.todos.find((t) => t.id === todoId);
      if (!target) return;
      const nextDone = !target.done;

      if (nextDone) {
        triggerHaptic('success');
        soundEngine.playGoalComplete(activeProfile.settings.sound);
        triggerPetReaction('goal-cheer', 'Task checked off! ✨', 2600);
      } else {
        triggerHaptic('tap');
      }

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          todos: curr.todos.map((t) =>
            t.id === todoId ? { ...t, done: nextDone } : t
          ),
        }),
        nextDone
          ? `${actorName} completed task '${target.title}'`
          : undefined
      );
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const deleteTodo = useCallback(
    (todoId: string): Todo | null => {
      if (!activeProfile || !actorProfileId) return null;
      const target = activeProfile.todos.find((t) => t.id === todoId) || null;
      if (!target) return null;

      triggerHaptic('delete');
      triggerPetReaction('delete-gasp', 'Poof! Task removed 💨', 2600);

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          todos: curr.todos.filter((t) => t.id !== todoId),
        }),
        `${actorName} deleted task '${target.title}'`
      );
      return target;
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const restoreTodo = useCallback(
    (todo: Todo) => {
      mutateActiveProfile((curr) => ({
        ...curr,
        todos: [...curr.todos, todo],
      }));
    },
    [mutateActiveProfile]
  );

  const moveUnfinishedTodosToTomorrow = useCallback(
    (fromDateStr: string): number => {
      if (!activeProfile || !actorProfileId) return 0;
      const tomorrowStr = addDays(fromDateStr, 1);
      const unfinished = activeProfile.todos.filter(
        (t) => t.date === fromDateStr && !t.done
      );
      if (unfinished.length === 0) return 0;

      triggerHaptic('tap');
      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          todos: curr.todos.map((t) =>
            t.date === fromDateStr && !t.done ? { ...t, date: tomorrowStr } : t
          ),
        }),
        `${actorName} moved ${unfinished.length} unfinished task(s) to ${tomorrowStr}`
      );
      return unfinished.length;
    },
    [activeProfile, actorProfileId, mutateActiveProfile]
  );

  // Countdown operations
  const addCountdown = useCallback(
    (
      title: string,
      targetISO: string,
      emoji: string = '🎯',
      color: string = 'blue'
    ) => {
      if (!actorProfileId) return;
      const cleanTitle = title.trim();
      if (!cleanTitle) return;

      const newCd: Countdown = {
        id: `cd-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: cleanTitle,
        emoji: emoji || '🎯',
        color,
        targetISO,
      };

      triggerHaptic('tap');
      triggerPetReaction('curious-notepad', 'Countdown locked in! ⏳', 2800);

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          countdowns: [...curr.countdowns, newCd],
        }),
        `${actorName} created countdown '${cleanTitle}'`
      );
    },
    [actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const updateCountdown = useCallback(
    (countdownId: string, updates: Partial<Countdown>) => {
      mutateActiveProfile((curr) => ({
        ...curr,
        countdowns: curr.countdowns.map((c) =>
          c.id === countdownId ? { ...c, ...updates } : c
        ),
      }));
    },
    [mutateActiveProfile]
  );

  const deleteCountdown = useCallback(
    (countdownId: string) => {
      if (!activeProfile || !actorProfileId) return;
      const target = activeProfile.countdowns.find((c) => c.id === countdownId);
      triggerHaptic('delete');
      triggerPetReaction('delete-gasp', 'Countdown cleared! 😮', 2600);

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          countdowns: curr.countdowns.filter((c) => c.id !== countdownId),
        }),
        `${actorName} removed countdown '${target?.title || 'event'}'`
      );
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  // Pet & Settings operations
  const feedPet = useCallback((): boolean => {
    if (!activeProfile || activeProfile.pet.treats <= 0) return false;
    triggerHaptic('success');
    soundEngine.playPetChirp('happy', activeProfile.settings.sound);
    triggerPetReaction('eating-treat', 'Yummm! Thank you! 🍓💖', 3200);

    mutateActiveProfile((curr) => ({
      ...curr,
      pet: {
        ...curr.pet,
        treats: Math.max(0, curr.pet.treats - 1),
        lastSeen: new Date().toISOString(),
      },
    }));
    return true;
  }, [activeProfile, mutateActiveProfile, triggerPetReaction]);

  const gainPetXP = useCallback(
    (amount: number, reason?: string) => {
      if (!activeProfile || !actorProfileId) return;
      const currentPet = activeProfile.pet;
      const currentLevel = currentPet.level ?? 4;
      const currentXp = currentPet.xp ?? 65;

      let nextXp = currentXp + amount;
      let nextLevel = currentLevel;
      let leveledUp = false;

      while (nextXp >= 100) {
        nextXp -= 100;
        nextLevel += 1;
        leveledUp = true;
      }

      if (leveledUp) {
        triggerHaptic('celebration');
        soundEngine.playLevelUp(activeProfile.settings.sound ?? true);
        triggerPetReaction(
          'celebrate',
          `"🎉 LEVEL UP! ${currentPet.name || 'Nova'} reached Level ${nextLevel}! +3 Bonus Treats! 🍓✨"`,
          5500
        );
      }

      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          pet: {
            ...curr.pet,
            level: nextLevel,
            xp: nextXp,
            treats: leveledUp ? curr.pet.treats + 3 : curr.pet.treats,
            lastSeen: new Date().toISOString(),
          },
        }),
        leveledUp
          ? `${actorName}'s companion ${currentPet.name || 'Nova'} reached Lv. ${nextLevel}!`
          : undefined
      );

      return { leveledUp, nextLevel, nextXp };
    },
    [activeProfile, actorProfileId, mutateActiveProfile, triggerPetReaction]
  );

  const renamePet = useCallback(
    (newName: string) => {
      const clean = newName.trim();
      if (!clean || !actorProfileId) return;
      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          pet: {
            ...curr.pet,
            name: clean,
          },
        }),
        `${actorName} renamed pet to '${clean}'`
      );
    },
    [actorProfileId, mutateActiveProfile]
  );

  const updateSettings = useCallback(
    (updates: Partial<Settings>) => {
      if (!actorProfileId) return;
      const actorName = actorProfileId === 'visal' ? 'Visal' : 'Pooja';
      mutateActiveProfile(
        (curr) => ({
          ...curr,
          displayName: updates.displayName ?? curr.displayName,
          avatarEmoji: updates.avatarEmoji ?? curr.avatarEmoji,
          settings: {
            ...curr.settings,
            ...updates,
          },
        }),
        `${actorName} updated profile preferences`
      );
    },
    [actorProfileId, mutateActiveProfile]
  );

  // Master-only operations
  const resetProfileStreak = useCallback(() => {
    if (actorProfileId !== 'visal' || !viewingProfileId) return;
    triggerHaptic('warning');
    mutateActiveProfile(
      (curr) => ({
        ...curr,
        goalLogs: [],
      }),
      `Visal reset ${
        viewingProfileId === 'pooja' ? "Pooja's" : 'his'
      } streak history`
    );
  }, [actorProfileId, viewingProfileId, mutateActiveProfile]);

  const exportProfileJson = useCallback((): string => {
    if (!activeProfile) return '{}';
    return JSON.stringify(activeProfile, null, 2);
  }, [activeProfile]);

  const importProfileJson = useCallback(
    (rawJson: string): boolean => {
      try {
        const parsed = JSON.parse(rawJson) as ProfileDocument;
        if (!parsed || !Array.isArray(parsed.goals)) return false;
        mutateActiveProfile(
          () => ({
            ...parsed,
            profileId: viewingProfileId || 'visal',
          }),
          `Visal imported profile backup JSON`
        );
        return true;
      } catch {
        return false;
      }
    },
    [viewingProfileId, mutateActiveProfile]
  );

  const refreshNow = useCallback(async () => {
    if (!actorProfileId || !viewingProfileId) return;
    await fetchProfileFromServer(actorProfileId, viewingProfileId);
  }, [actorProfileId, viewingProfileId, fetchProfileFromServer]);

  const value = useMemo<StreaklyContextValue>(
    () => ({
      hasSeenIntro,
      markIntroSeen,
      actorProfileId,
      viewingProfileId,
      selectActorProfile,
      switchViewingProfile,
      logoutToPicker,
      isMasterModeViewingOther:
        actorProfileId === 'visal' && viewingProfileId === 'pooja',
      profile: activeProfile,
      visalPinRequired: Boolean(profilesMap.visal?.settings?.pin),
      checkVisalPin,
      streakSummary,
      activityLog,
      storageMode,
      isOnline,
      isSyncing,
      lastSyncedAt,
      petReaction,
      petSpeechBubble,
      triggerPetReaction,
      toggleGoalToday,
      addGoal,
      updateGoal,
      deleteGoal,
      reorderGoals,
      addTodo,
      updateTodo,
      toggleTodo,
      deleteTodo,
      restoreTodo,
      moveUnfinishedTodosToTomorrow,
      addCountdown,
      updateCountdown,
      deleteCountdown,
      feedPet,
      renamePet,
      gainPetXP,
      updateSettings,
      resetProfileStreak,
      exportProfileJson,
      importProfileJson,
      refreshNow,
      getProfileLastStreakPreview,
    }),
    [
      hasSeenIntro,
      markIntroSeen,
      actorProfileId,
      viewingProfileId,
      selectActorProfile,
      switchViewingProfile,
      logoutToPicker,
      activeProfile,
      profilesMap.visal?.settings?.pin,
      checkVisalPin,
      streakSummary,
      activityLog,
      storageMode,
      isOnline,
      isSyncing,
      lastSyncedAt,
      petReaction,
      petSpeechBubble,
      triggerPetReaction,
      toggleGoalToday,
      addGoal,
      updateGoal,
      deleteGoal,
      reorderGoals,
      addTodo,
      updateTodo,
      toggleTodo,
      deleteTodo,
      restoreTodo,
      moveUnfinishedTodosToTomorrow,
      addCountdown,
      updateCountdown,
      deleteCountdown,
      feedPet,
      renamePet,
      gainPetXP,
      updateSettings,
      resetProfileStreak,
      exportProfileJson,
      importProfileJson,
      refreshNow,
      getProfileLastStreakPreview,
    ]
  );

  return React.createElement(StreaklyContext.Provider, { value }, children);
}

export function useStreakly(): StreaklyContextValue {
  const ctx = useContext(StreaklyContext);
  if (!ctx) {
    throw new Error('useStreakly must be used within a StreaklyProvider');
  }
  return ctx;
}
