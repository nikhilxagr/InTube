import { HardDrive } from 'lucide-react';

export function FileSizeEstimate({ sizeBytes, approxBitrateKbps, durationSeconds, className = '' }) {
  let calculatedBytes = sizeBytes;

  // If exact sizeBytes is not provided, estimate from bitrate and duration
  if (!calculatedBytes && approxBitrateKbps && durationSeconds && durationSeconds > 0) {
    calculatedBytes = ((approxBitrateKbps * 1000) / 8) * durationSeconds;
  }

  if (!calculatedBytes || calculatedBytes <= 0) {
    return null; // Never invent fake file size numbers
  }

  const formatCleanSize = (bytes) => {
    const mb = bytes / (1024 * 1024);
    if (mb >= 1000) {
      const gb = mb / 1024;
      return `~${gb.toFixed(1)} GB`;
    }
    if (mb >= 10) {
      return `~${Math.round(mb)} MB`;
    }
    return `~${mb.toFixed(1)} MB`;
  };

  const formatted = formatCleanSize(calculatedBytes);

  return (
    <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 dark:bg-slate-800/80 text-slate-600 dark:text-slate-300 text-xs font-semibold border border-slate-200/60 dark:border-slate-700/60 ${className}`}>
      <HardDrive className="w-3.5 h-3.5 text-blue-500 shrink-0" />
      <span>Estimated size: <strong className="text-slate-900 dark:text-white">{formatted}</strong></span>
    </div>
  );
}
