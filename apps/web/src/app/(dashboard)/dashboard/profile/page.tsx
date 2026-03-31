'use client';

import { useAuthStore } from '@/stores/auth-store';

export default function ProfilePage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Your account information
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-100 text-2xl font-bold text-indigo-700 dark:bg-indigo-900 dark:text-indigo-300">
            {user?.email?.charAt(0).toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-lg font-semibold">{user?.email || 'Unknown'}</p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              Role: {user?.role || 'USER'}
            </p>
            <p className="text-sm text-zinc-500 dark:text-zinc-400">
              ID: {user?.sub || '—'}
            </p>
          </div>
        </div>
      </div>
    </>
  );
}
