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