import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function Skeleton({ className = '', ...props }) {
  return (
    <div
      className={twMerge(
        clsx('animate-pulse rounded-lg bg-slate-200 dark:bg-slate-800', className)
      )}
      {...props}
    />
  );
}
