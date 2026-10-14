const DEFAULT_TIMEZONE = 'Asia/Colombo';

export function getLocalTimeZone(): string {
  try {
    const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
    return tz || DEFAULT_TIMEZONE;
  } catch {
    return DEFAULT_TIMEZONE;
  }
}

/**
 * Formats a Date object as 'YYYY-MM-DD' in the user's local timezone (or Asia/Colombo).
 */
export function formatDateYYYYMMDD(date: Date = new Date()): string {
  const tz = getLocalTimeZone();
  try {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: tz,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(date);

    const year = parts.find((p) => p.type === 'year')?.value ?? '2026';
    const month = parts.find((p) => p.type === 'month')?.value ?? '01';
    const day = parts.find((p) => p.type === 'day')?.value ?? '01';
    return `${year}-${month}-${day}`;
  } catch {
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  }
}

export function getTodayDateString(): string {
  return formatDateYYYYMMDD(new Date());
}

/**
 * Parses a 'YYYY-MM-DD' string into a local noon Date object to avoid DST/midnight drift.
 */
export function parseYYYYMMDD(dateStr: string): Date {
  const [y, m, d] = dateStr.split('-').map(Number);
  return new Date(y, (m || 1) - 1, d || 1, 12, 0, 0, 0);
}

/**
 * Adds `days` (positive or negative) to a 'YYYY-MM-DD' string and returns 'YYYY-MM-DD'.
 */
export function addDays(dateStr: string, days: number): string {
  const dt = parseYYYYMMDD(dateStr);
  dt.setDate(dt.getDate() + days);
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, '0');
  const d = String(dt.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

/**
 * Returns the 7 days (Mon -> Sun) of the week containing `referenceDateStr`.
 */
export function getCurrentWeekDates(referenceDateStr: string = getTodayDateString()): {
  date: string;
  dayLabel: string;
}[] {
  const dt = parseYYYYMMDD(referenceDateStr);
  const jsDay = dt.getDay(); // 0 = Sun, 1 = Mon, ... 6 = Sat
  const diffToMonday = jsDay === 0 ? -6 : 1 - jsDay;
  const mondayStr = addDays(referenceDateStr, diffToMonday);
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  return labels.map((dayLabel, idx) => ({
    date: addDays(mondayStr, idx),
    dayLabel,
  }));
}

/**
 * Returns 84 days (12 full Mon-Sun weeks) ending at the Sunday of the current week.
 */
export function get12WeekHeatmapDates(
  referenceDateStr: string = getTodayDateString()
): { date: string; dayLabel: string }[] {
  const currentWeek = getCurrentWeekDates(referenceDateStr);
  const currentMonday = currentWeek[0].date;
  const startMonday = addDays(currentMonday, -11 * 7); // 11 weeks before current Monday = 12 weeks total
  const labels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  const result: { date: string; dayLabel: string }[] = [];
  for (let i = 0; i < 84; i++) {
    result.push({
      date: addDays(startMonday, i),
      dayLabel: labels[i % 7],
    });
  }
  return result;
}

/**
 * Returns a strip of dates centered around `selectedDateStr` for the To-Do date picker.
 */
export function getDateStrip(
  centerDateStr: string,
  radius: number = 7
): {
  date: string;
  dayName: string;
  dayNumber: string;
  monthShort: string;
  isToday: boolean;
}[] {
  const today = getTodayDateString();
  const items = [];

  for (let offset = -radius; offset <= radius; offset++) {
    const dStr = addDays(centerDateStr, offset);
    const dt = parseYYYYMMDD(dStr);
    const dayName = dt.toLocaleDateString('en-US', { weekday: 'short' });
    const dayNumber = String(dt.getDate());
    const monthShort = dt.toLocaleDateString('en-US', { month: 'short' });
    items.push({
      date: dStr,
      dayName,
      dayNumber,
      monthShort,
      isToday: dStr === today,
    });
  }

  return items;
}

export function getGreetingForHour(hour: number = new Date().getHours()): string {
  if (hour >= 5 && hour < 12) return 'Good morning';
  if (hour >= 12 && hour < 17) return 'Good afternoon';
  if (hour >= 17 && hour < 22) return 'Good evening';
  return 'Late night';
}

export function isNightTime(date: Date = new Date()): boolean {
  const hour = date.getHours();
  return hour >= 22 || hour < 5;
}

export function formatHeroDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
}

export function formatActivityTime(isoString: string): string {
  try {
    const d = new Date(isoString);
    return d.toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true,
    });
  } catch {
    return '';
  }
}

export interface CountdownBreakdown {
  totalMs: number;
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
  isUnder24h: boolean;
  isUnder1h: boolean;
}

export function getCountdownBreakdown(
  targetISO: string,
  nowMs: number = Date.now()
): CountdownBreakdown {
  const targetMs = new Date(targetISO).getTime();
  const diff = targetMs - nowMs;

  if (Number.isNaN(targetMs) || diff <= 0) {
    return {
      totalMs: 0,
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
      isUnder24h: false,
      isUnder1h: false,
    };
  }

  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  return {
    totalMs: diff,
    days,
    hours,
    minutes,
    seconds,
    isPast: false,
    isUnder24h: diff <= 24 * 60 * 60 * 1000,
    isUnder1h: diff <= 60 * 60 * 1000,
  };
}
