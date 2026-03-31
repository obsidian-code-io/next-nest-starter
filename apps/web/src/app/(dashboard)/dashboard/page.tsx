'use client';

import { useAuthStore } from '@/stores/auth-store';
import { FileText, Users, Activity, Clock } from 'lucide-react';

const stats = [
  { label: 'Total Posts', value: '—', icon: FileText, color: 'bg-indigo-500' },
  { label: 'Users', value: '—', icon: Users, color: 'bg-emerald-500' },
  { label: 'API Status', value: 'Online', icon: Activity, color: 'bg-green-500' },
  { label: 'Uptime', value: '—', icon: Clock, color: 'bg-purple-500' },
];

export default function DashboardPage() {
  const user = useAuthStore((s) => s.user);

  return (
    <>
      <div className="mb-8">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
          Welcome back, {user?.email || 'User'}
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="rounded-xl border border-zinc-200 bg-white p-5 dark:border-zinc-800 dark:bg-zinc-900"
          >
            <div className="flex items-center gap-3">
              <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${stat.color}`}>
                <stat.icon className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="text-xs text-zinc-500 dark:text-zinc-400">{stat.label}</p>
                <p className="text-lg font-bold">{stat.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick start guide */}
      <div className="mt-8 rounded-xl border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <h2 className="text-lg font-semibold">Quick Start</h2>
        <div className="mt-4 space-y-3 text-sm text-zinc-600 dark:text-zinc-400">
          <p>
            <span className="font-mono rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              apps/api/src/modules/
            </span>{' '}
            — Add new NestJS modules here (service, controller, module, DTOs)
          </p>
          <p>
            <span className="font-mono rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              apps/web/src/app/
            </span>{' '}
            — Add new Next.js pages using the App Router
          </p>
          <p>
            <span className="font-mono rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              packages/prisma/schema/
            </span>{' '}
            — Add new Prisma models as separate .prisma files
          </p>
          <p>
            <span className="font-mono rounded bg-zinc-100 px-1.5 py-0.5 text-xs dark:bg-zinc-800">
              packages/shared/src/
            </span>{' '}
            — Shared types, enums, and utilities used by both apps
          </p>
        </div>
      </div>
    </>
  );
}
