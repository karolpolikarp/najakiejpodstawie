/**
 * useHaptic Hook
 * Provides haptic feedback for mobile devices
 */

export type HapticPattern = 'light' | 'medium' | 'heavy' | 'success' | 'warning' | 'error';

const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = {
  light: 10,
  medium: 20,
  heavy: 30,
  success: [10, 50, 10],
  warning: [10, 50, 10, 50, 10],
  error: [20, 100, 20],
};

export const useHaptic = () => {
  const vibrate = (pattern: HapticPattern = 'light') => {
    // Check if vibration API is supported
    if (!('vibrate' in navigator)) {
      return;
    }

    // Check if user has reduced motion preference
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      return;
    }

    try {
      const vibrationPattern = HAPTIC_PATTERNS[pattern];
      navigator.vibrate(vibrationPattern);
    } catch (error) {
      // Silently fail if vibration is not supported or blocked
      console.debug('Haptic feedback not available:', error);
    }
  };

  const stop = () => {
    if ('vibrate' in navigator) {
      navigator.vibrate(0);
    }
  };

  return { vibrate, stop };
};
