'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function InactivityWarning() {
  const [remainingSeconds, setRemainingSeconds] = useState(30);
  const { dismissWarning } = useAuth();

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="fixed bottom-6 right-6 z-[9998] max-w-sm mx-auto px-4">
      <div className="bg-amber-50 dark:bg-amber-900/20 border-2 border-amber-200 dark:border-amber-800 rounded-lg p-4 shadow-lg">
        {/* Icon and Title */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 mt-0.5">
            <svg
              className="w-5 h-5 text-amber-600 dark:text-amber-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4v2m0-6a4 4 0 110 8 4 4 0 010-8z"
              />
            </svg>
          </div>

          <div className="flex-1">
            <h3 className="font-semibold text-amber-900 dark:text-amber-300 mb-1">
              Session Timeout Warning
            </h3>
            <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
              Your session will be locked in <span className="font-bold">{remainingSeconds}</span> seconds due to inactivity.
              Move your mouse or click to stay active.
            </p>

            {/* Progress Bar */}
            <div className="w-full bg-amber-200 dark:bg-amber-900/50 rounded-full h-1.5 mb-3 overflow-hidden">
              <div
                className="bg-amber-500 dark:bg-amber-400 h-full transition-all duration-1000"
                style={{
                  width: `${(remainingSeconds / 30) * 100}%`,
                }}
              />
            </div>

            {/* Close Button */}
            <button
              onClick={dismissWarning}
              className="text-xs font-medium text-amber-700 dark:text-amber-300 hover:text-amber-900 dark:hover:text-amber-100 transition-colors"
            >
              ✕ Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
