import { useEffect, useRef, useCallback } from 'react';

const INACTIVITY_TIMEOUT = 5 * 60 * 1000; // 5 minutes in milliseconds
const WARNING_TIME = 4.5 * 60 * 1000; // Show warning at 4.5 minutes

interface UseInactivityTimeoutOptions {
  onWarning?: () => void;
  onLock?: () => void;
  onUnlock?: () => void;
}

export const useInactivityTimeout = ({
  onWarning,
  onLock,
  onUnlock,
}: UseInactivityTimeoutOptions = {}) => {
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const warningTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isLockedRef = useRef(false);

  const resetTimer = useCallback(() => {
    // Clear existing timers
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }
    if (warningTimeoutRef.current) {
      clearTimeout(warningTimeoutRef.current);
    }

    // Don't reset if already locked
    if (isLockedRef.current) {
      return;
    }

    // Set warning timer
    warningTimeoutRef.current = setTimeout(() => {
      onWarning?.();
    }, WARNING_TIME);

    // Set lock timer
    timeoutRef.current = setTimeout(() => {
      isLockedRef.current = true;
      onLock?.();
    }, INACTIVITY_TIMEOUT);
  }, [onWarning, onLock]);

  const unlock = useCallback(() => {
    isLockedRef.current = false;
    onUnlock?.();
    resetTimer();
  }, [onUnlock, resetTimer]);

  const isLocked = () => isLockedRef.current;

  useEffect(() => {
    // List of activity events to track
    const events = [
      'mousedown',
      'mousemove',
      'keypress',
      'scroll',
      'touchstart',
      'click',
      'input',
    ];

    // Add event listeners
    const handleActivity = () => {
      resetTimer();
    };

    events.forEach((event) => {
      document.addEventListener(event, handleActivity);
    });

    // Initialize timer
    resetTimer();

    // Cleanup
    return () => {
      events.forEach((event) => {
        document.removeEventListener(event, handleActivity);
      });
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
      if (warningTimeoutRef.current) {
        clearTimeout(warningTimeoutRef.current);
      }
    };
  }, [resetTimer]);

  return { unlock, isLocked };
};
