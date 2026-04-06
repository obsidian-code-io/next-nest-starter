'use client';

export function SettingsPageContent() {
  return (
    <>
      <h1 className="text-2xl font-bold">Settings</h1>
      <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
        Application settings and preferences
      </p>

      <div className="mt-6 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          This is a placeholder settings page. Add your application settings here —
          theme toggles, notification preferences, API key management, etc.
        </p>
      </div>
    </>
  );
}
