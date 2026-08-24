import { Badge } from '../common/Badge.jsx';
import { User, Clock, CheckCircle2 } from 'lucide-react';

export function MediaDetails({ title, author, durationFormatted, platform, type = 'video', className = '' }) {
  return (
    <div className={`space-y-2 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">
        <Badge
          variant={
            platform === 'youtube' ? 'youtube'
            : platform === 'instagram' ? 'instagram'
            : platform === 'facebook' ? 'facebook'
            : 'brand'
          }
          size="sm"
        >
          {platform?.toUpperCase() || 'PUBLIC MEDIA'}
        </Badge>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 uppercase tracking-wider font-mono">
          {type}
        </span>

        <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600 dark:text-emerald-400">
          <CheckCircle2 className="w-3.5 h-3.5" /> Direct Stream Available
        </span>
      </div>

      <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-white leading-snug line-clamp-2">
        {title || 'Media Details'}
      </h3>

      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
        {author && (
          <span className="flex items-center gap-1.5 font-medium truncate max-w-xs">
            <User className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <strong className="text-slate-700 dark:text-slate-300 font-semibold">{author}</strong>
          </span>
        )}

        {durationFormatted && (
          <span className="flex items-center gap-1.5 font-mono">
            <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
            <span>{durationFormatted}</span>
          </span>
        )}
      </div>
    </div>
  );
}
