import { Redis } from '@upstash/redis';
import { createInitialProfileDocument } from '@/config/theme';
import { addDays, getTodayDateString } from '@/lib/time';
import { ActivityEntry, ProfileDocument, ProfileId } from '@/lib/types';

const PROFILE_KEY_PREFIX = 'streakly:';
const ACTIVITY_KEY = 'streakly:activity';
const MAX_ACTIVITY_ITEMS = 60;

// Global in-memory fallback when Redis env vars are not configured
const globalStore = globalThis as unknown as {
  __streaklyMemoryProfiles?: Record<ProfileId, ProfileDocument>;
  __streaklyMemoryActivity?: ActivityEntry[];
};

function getRedisClient(): Redis | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ||
    process.env.KV_REST_API_URL ||
    process.env.STORAGE_REST_API_URL ||
    process.env.STORAGE_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ||
    process.env.KV_REST_API_TOKEN ||
    process.env.STORAGE_REST_API_TOKEN ||
    process.env.STORAGE_TOKEN;

  if (!url || !token) {
    return null;
  }

  try {
    return new Redis({ url, token });
  } catch {
    return null;
  }
}

function getDefaultSeedProfile(profileId: ProfileId): ProfileDocument {
  const today = getTodayDateString();
  const yesterday = addDays(today, -1);
  const twoDaysAgo = addDays(today, -2);
  return createInitialProfileDocument(profileId, today, yesterday, twoDaysAgo);
}

function ensureMemoryStore(): {
  profiles: Record<ProfileId, ProfileDocument>;
  activity: ActivityEntry[];
} {
  if (!globalStore.__streaklyMemoryProfiles) {
    globalStore.__streaklyMemoryProfiles = {
      visal: getDefaultSeedProfile('visal'),
      pooja: getDefaultSeedProfile('pooja'),
    };
  }
  if (!globalStore.__streaklyMemoryActivity) {
    globalStore.__streaklyMemoryActivity = [
      {
        id: 'act-init-1',
        actor: 'pooja',
        subject: 'pooja',
        text: "Pooja completed 'Focused Study Session'",
        at: new Date(Date.now() - 35 * 60 * 1000).toISOString(),
      },
      {
        id: 'act-init-2',
        actor: 'visal',
        subject: 'visal',
        text: "Visal completed 'Cloud & Architecture Deep Work'",
        at: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
      },
    ];
  }
  return {
    profiles: globalStore.__streaklyMemoryProfiles,
    activity: globalStore.__streaklyMemoryActivity,
  };
}

export async function readProfileFromStore(profileId: ProfileId): Promise<{
  profile: ProfileDocument;
  activity: ActivityEntry[];
  storageMode: 'redis' | 'local-fallback';
}> {
  const redis = getRedisClient();

  if (!redis) {
    const mem = ensureMemoryStore();
    return {
      profile: mem.profiles[profileId],
      activity: mem.activity,
      storageMode: 'local-fallback',
    };
  }

  try {
    const profileKey = `${PROFILE_KEY_PREFIX}${profileId}`;
    const [rawProfile, rawActivity] = await Promise.all([
      redis.get<ProfileDocument>(profileKey),
      redis.get<ActivityEntry[]>(ACTIVITY_KEY),
    ]);

    let profile = rawProfile;
    if (!profile) {
      profile = getDefaultSeedProfile(profileId);
      await redis.set(profileKey, profile);
    }

    const activity = Array.isArray(rawActivity) ? rawActivity : [];
    return {
      profile,
      activity,
      storageMode: 'redis',
    };
  } catch {
    const mem = ensureMemoryStore();
    return {
      profile: mem.profiles[profileId],
      activity: mem.activity,
      storageMode: 'local-fallback',
    };
  }
}

export async function writeProfileToStore(
  profileId: ProfileId,
  updatedProfile: ProfileDocument,
  newActivityEntry?: ActivityEntry
): Promise<{
  profile: ProfileDocument;
  activity: ActivityEntry[];
  storageMode: 'redis' | 'local-fallback';
}> {
  const stampedProfile: ProfileDocument = {
    ...updatedProfile,
    profileId,
    role: profileId === 'visal' ? 'master' : 'member',
    updatedAt: new Date().toISOString(),
  };

  const redis = getRedisClient();

  if (!redis) {
    const mem = ensureMemoryStore();
    mem.profiles[profileId] = stampedProfile;
    if (newActivityEntry) {
      mem.activity = [newActivityEntry, ...mem.activity].slice(
        0,
        MAX_ACTIVITY_ITEMS
      );
    }
    return {
      profile: stampedProfile,
      activity: mem.activity,
      storageMode: 'local-fallback',
    };
  }

  try {
    const profileKey = `${PROFILE_KEY_PREFIX}${profileId}`;
    const existingActivity =
      (await redis.get<ActivityEntry[]>(ACTIVITY_KEY)) || [];

    const nextActivity = newActivityEntry
      ? [newActivityEntry, ...existingActivity].slice(0, MAX_ACTIVITY_ITEMS)
      : existingActivity;

    await Promise.all([
      redis.set(profileKey, stampedProfile),
      newActivityEntry
        ? redis.set(ACTIVITY_KEY, nextActivity)
        : Promise.resolve(),
    ]);

    return {
      profile: stampedProfile,
      activity: nextActivity,
      storageMode: 'redis',
    };
  } catch {
    const mem = ensureMemoryStore();
    mem.profiles[profileId] = stampedProfile;
    if (newActivityEntry) {
      mem.activity = [newActivityEntry, ...mem.activity].slice(
        0,
        MAX_ACTIVITY_ITEMS
      );
    }
    return {
      profile: stampedProfile,
      activity: mem.activity,
      storageMode: 'local-fallback',
    };
  }
}
