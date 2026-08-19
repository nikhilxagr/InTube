import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Card({ children, className = '', ...props }) {
  return (
    <div
      className={twMerge(
        clsx(
          'bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-subtle',
          className
        )
      )}
      {...props}
    >
      {children}
    </div>
  );
}
