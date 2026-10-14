import {
  addDays,
  get12WeekHeatmapDates,
  getCurrentWeekDates,
  getTodayDateString,
} from '@/lib/time';
import {
  DayStreakStat,
  Goal,
  GoalLog,
  StreakSummary,
} from '@/lib/types';

export function getActiveGoals(goals: Goal[]): Goal[] {
  return goals
    .filter((g) => !g.archived)
    .sort((a, b) => a.order - b.order);
}

/**
 * Computes stats for a single 'YYYY-MM-DD' date.
 * Streak rule: a day counts if >= 1 active goal exists and completion % >= threshold (default 70%).
 */
export function evaluateDayStat(
  dateStr: string,
  dayLabel: string,
  activeGoals: Goal[],
  goalLogs: GoalLog[],
  streakThreshold: number,
  todayStr: string
): DayStreakStat {
  const totalGoals = activeGoals.length;
  const activeGoalIds = new Set(activeGoals.map((g) => g.id));

  const completedGoals = goalLogs.filter(
    (log) =>
      log.date === dateStr &&
      log.done &&
      activeGoalIds.has(log.goalId)
  ).length;

  const completionRate =
    totalGoals > 0 ? Math.round((completedGoals / totalGoals) * 100) : 0;

  const isFuture = dateStr > todayStr;
  const isToday = dateStr === todayStr;

  const isStreakDay =
    !isFuture && totalGoals >= 1 && completionRate >= streakThreshold;

  return {
    date: dateStr,
    dayLabel,
    totalGoals,
    completedGoals,
    completionRate,
    isStreakDay,
    isToday,
    isFuture,
  };
}

/**
 * Calculates full streak metrics across arbitrary week, month, and year boundaries.
 */
export function computeStreakSummary(
  goals: Goal[],
  goalLogs: GoalLog[],
  streakThreshold: number = 70,
  todayStr: string = getTodayDateString()
): StreakSummary {
  const activeGoals = getActiveGoals(goals);
  const totalGoals = activeGoals.length;

  // Evaluate today
  const todayStat = evaluateDayStat(
    todayStr,
    'Today',
    activeGoals,
    goalLogs,
    streakThreshold,
    todayStr
  );

  // Evaluate yesterday
  const yesterdayStr = addDays(todayStr, -1);
  const yesterdayStat = evaluateDayStat(
    yesterdayStr,
    'Yesterday',
    activeGoals,
    goalLogs,
    streakThreshold,
    todayStr
  );

  // Compute current streak walking backwards day-by-day from today (or yesterday if today isn't completed yet)
  let currentStreak = 0;
  let cursorDate = todayStat.isStreakDay ? todayStr : yesterdayStr;

  // Guard up to 3650 days (10 years)
  for (let i = 0; i < 3650; i++) {
    const stat = evaluateDayStat(
      cursorDate,
      '',
      activeGoals,
      goalLogs,
      streakThreshold,
      todayStr
    );
    if (stat.isStreakDay) {
      currentStreak += 1;
      cursorDate = addDays(cursorDate, -1);
    } else {
      break;
    }
  }

  // Compute best streak across all logged history + last 12 weeks
  const allLoggedDates = goalLogs.map((l) => l.date).filter((d) => d <= todayStr);
  const earliestDate =
    allLoggedDates.length > 0
      ? allLoggedDates.reduce((min, d) => (d < min ? d : min), todayStr)
      : addDays(todayStr, -84);

  let bestStreak = currentStreak;
  let runningStreak = 0;
  let scanCursor = earliestDate;

  for (let i = 0; i < 3650 && scanCursor <= todayStr; i++) {
    const stat = evaluateDayStat(
      scanCursor,
      '',
      activeGoals,
      goalLogs,
      streakThreshold,
      todayStr
    );
    if (stat.isStreakDay) {
      runningStreak += 1;
      if (runningStreak > bestStreak) {
        bestStreak = runningStreak;
      }
    } else {
      runningStreak = 0;
    }
    scanCursor = addDays(scanCursor, 1);
  }

  // Weekly Mon-Sun stats
  const weekDates = getCurrentWeekDates(todayStr);
  const weeklyDays = weekDates.map(({ date, dayLabel }) =>
    evaluateDayStat(date, dayLabel, activeGoals, goalLogs, streakThreshold, todayStr)
  );

  const elapsedWeekDays = weeklyDays.filter((d) => !d.isFuture);
  const weeklyCompletionRate =
    elapsedWeekDays.length > 0
      ? Math.round(
          elapsedWeekDays.reduce((acc, d) => acc + d.completionRate, 0) /
            elapsedWeekDays.length
        )
      : 0;

  // 12-week (84-day) heatmap
  const heatmapDates = get12WeekHeatmapDates(todayStr);
  const heatmapDays = heatmapDates.map(({ date, dayLabel }) =>
    evaluateDayStat(date, dayLabel, activeGoals, goalLogs, streakThreshold, todayStr)
  );

  // Check if yesterday had logs/goals but missed the streak threshold
  const missedYesterday =
    totalGoals > 0 && !yesterdayStat.isStreakDay && currentStreak === 0;

  return {
    currentStreak,
    bestStreak,
    weeklyCompletionRate,
    todayCompletionRate: todayStat.completionRate,
    todayCompletedCount: todayStat.completedGoals,
    todayTotalCount: totalGoals,
    allTodayGoalsDone: totalGoals > 0 && todayStat.completedGoals === totalGoals,
    missedYesterday,
    weeklyDays,
    heatmapDays,
  };
}
