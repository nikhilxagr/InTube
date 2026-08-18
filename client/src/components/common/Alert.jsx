import { AlertCircle, CheckCircle2, Info, AlertTriangle } from 'lucide-react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Alert({ type = 'info', title, message, children, className = '' }) {
  const icons = {
    info: <Info className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />,
    success: <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />,
    error: <AlertCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />
  };

  const containerStyles = {
    info: 'bg-blue-50/70 border-blue-200 text-blue-900 dark:bg-blue-950/40 dark:border-blue-900/50 dark:text-blue-200',
    success: 'bg-emerald-50/70 border-emerald-200 text-emerald-900 dark:bg-emerald-950/40 dark:border-emerald-900/50 dark:text-emerald-200',
    warning: 'bg-amber-50/70 border-amber-200 text-amber-900 dark:bg-amber-950/40 dark:border-amber-900/50 dark:text-amber-200',
    error: 'bg-red-50/70 border-red-200 text-red-900 dark:bg-red-950/40 dark:border-red-900/50 dark:text-red-200'
  };

  return (
    <div
      role="alert"
      className={twMerge(
        clsx('flex gap-3 p-4 rounded-xl border text-sm transition-all', containerStyles[type], className)
      )}
    >
      {icons[type]}
      <div className="flex-1 space-y-1">
        {title && <h4 className="font-semibold">{title}</h4>}
        {message && <p className="opacity-90">{message}</p>}
        {children}
      </div>
    </div>
  );
}
