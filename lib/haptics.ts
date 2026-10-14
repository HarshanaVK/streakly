export type HapticPattern =
  | 'tap'
  | 'success'
  | 'celebration'
  | 'purr'
  | 'warning'
  | 'delete';

export function triggerHaptic(pattern: HapticPattern = 'tap'): void {
  if (typeof window === 'undefined' || !('vibrate' in navigator)) {
    return;
  }

  try {
    switch (pattern) {
      case 'tap':
        navigator.vibrate(12);
        break;
      case 'success':
        navigator.vibrate([18, 40, 30]);
        break;
      case 'celebration':
        navigator.vibrate([25, 45, 35, 45, 60]);
        break;
      case 'purr':
        navigator.vibrate([15, 60, 15, 60, 15]);
        break;
      case 'warning':
        navigator.vibrate([30, 50, 30]);
        break;
      case 'delete':
        navigator.vibrate(25);
        break;
    }
  } catch {
    // Ignore vibration errors on restricted browsers
  }
}
