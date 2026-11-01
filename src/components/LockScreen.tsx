'use client';

import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';

export default function LockScreen() {
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { unlockScreen, user } = useAuth();

  const handleUnlock = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    if (!password.trim()) {
      setError('Enter your password');
      setIsSubmitting(false);
      return;
    }

    try {
      const success = await unlockScreen(password);
      if (success) {
        setPassword('');
      } else {
        setError('Password is incorrect.');
        setPassword('');
      }
    } catch {
      setError('Could not verify your login. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[9999] flex items-center justify-center">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl p-8 w-full max-w-md mx-4 border border-gray-200 dark:border-gray-800">
        {/* Lock Icon */}
        <div className="flex justify-center mb-6">
          <div className="w-20 h-20 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center">
            <svg
              className="w-10 h-10 text-brand-600 dark:text-brand-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm6-10V7a3 3 0 00-3-3H9a3 3 0 00-3 3v2h12z"
              />
            </svg>
          </div>
        </div>

        {/* Title */}
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-2">
          Session Locked
        </h2>
        <p className="text-center text-gray-600 dark:text-gray-400 mb-6">
          Your session was locked due to inactivity. Please enter your password to unlock.
        </p>

        {/* User Info */}
        <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 mb-6 border border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-600 dark:text-gray-400">Logged in as</p>
          <p className="text-lg font-semibold text-gray-900 dark:text-white">{user?.username}</p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Unlock Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent dark:border-gray-700 dark:bg-gray-800 dark:text-white dark:placeholder-gray-400"
              disabled={isSubmitting}
              autoFocus
            />
          </div>
          <button
            type="submit"
            disabled={isSubmitting || !password.trim()}
            className="w-full bg-brand-500 hover:bg-brand-600 disabled:bg-brand-300 text-white font-medium py-2.5 px-4 rounded-lg transition-colors"
          >
            {isSubmitting ? 'Unlocking...' : 'Unlock Session'}
          </button>
        </form>

        {/* Info */}
        <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-6">
          🔒 Your session is secured and will automatically lock after 5 minutes of inactivity
        </p>
      </div>
    </div>
  );
}
