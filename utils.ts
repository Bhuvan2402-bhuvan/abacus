import { RodState } from './types';

/**
 * Triggers a short haptic feedback vibration on supported devices.
 */
export const triggerHapticFeedback = () => {
  // Check if the Vibration API is supported by the browser
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    // A short, 10ms vibration provides subtle feedback
    navigator.vibrate(10);
  }
};

/**
 * Calculates the numerical value from an array of abacus rod states.
 * @param rods The array of RodState objects.
 * @returns The numerical value as a bigint.
 */
export const calculateAbacusValue = (rods: RodState[]): bigint => {
  if (!rods) return 0n;
  let total = 0n;
  let placeValue = 1n;
  for (let i = rods.length - 1; i >= 0; i--) {
    const rod = rods[i];
    const rodValue = BigInt((rod.heavenlyBeadActive ? 5 : 0) + rod.earthlyBeadsActive);
    total += rodValue * placeValue;
    placeValue *= 10n;
  }
  return total;
};
