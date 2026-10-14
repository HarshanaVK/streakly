import { ProfileId, ProfileRole } from '@/lib/types';

export const PROFILE_ROLES: Record<ProfileId, ProfileRole> = {
  visal: 'master',
  pooja: 'member',
};

export function isValidProfileId(value: unknown): value is ProfileId {
  return value === 'visal' || value === 'pooja';
}

export function getRoleForProfile(profileId: ProfileId): ProfileRole {
  return PROFILE_ROLES[profileId];
}

export function isMasterProfile(profileId: ProfileId | null | undefined): boolean {
  return profileId === 'visal';
}

/**
 * Server & client rule:
 * - 'visal' (master) can read ANY profile ('visal' or 'pooja').
 * - 'pooja' (member) can ONLY read 'pooja'.
 */
export function canReadProfile(actor: ProfileId, target: ProfileId): boolean {
  if (actor === 'visal') return true;
  return actor === target;
}

/**
 * Server & client rule:
 * - 'visal' (master) can write/edit/reset ANY profile ('visal' or 'pooja').
 * - 'pooja' (member) can ONLY write 'pooja'.
 */
export function canWriteProfile(actor: ProfileId, target: ProfileId): boolean {
  if (actor === 'visal') return true;
  return actor === target;
}

/**
 * Verifies optional 4-digit PIN when Visal enables PIN lock in settings.
 */
export function verifyPinCode(
  configuredPin: string | null | undefined,
  suppliedPin: string | null | undefined
): boolean {
  if (!configuredPin || configuredPin.trim() === '') {
    return true;
  }
  return configuredPin.trim() === (suppliedPin ?? '').trim();
}
