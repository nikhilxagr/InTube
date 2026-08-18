import { useHealth } from '../../hooks/useHealth.js';

export function HealthBadge() {
  const { data, isLoading, isError } = useHealth();

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 px-2.5 py-1 text-xs rounded-full bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
        <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
        <span className="hidden sm:inline">Checking Backend...</span>
      </div>
    );
  }

  if (isError || !data?.success) {
    return (
      <div
        title="Backend API is currently unreachable. If using Render free tier, the instance might be waking up (cold start)."
        className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border border-rose-200 dark:border-rose-900"
      >
        <span className="w-2 h-2 rounded-full bg-rose-500" />
        <span className="font-medium">Backend Offline</span>
      </div>
    );
  }

  return (
    <div
      title={`Backend Operational • Uptime: ${Math.round(data?.data?.uptime || 0)}s • Providers: ${data?.data?.providers?.join(', ')}`}
      className="flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-full bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900"
    >
      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
      <span className="font-medium hidden sm:inline">Backend Active</span>
    </div>
  );
}
