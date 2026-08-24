import { Film } from 'lucide-react';

export function VideoPreview({ previewUrl, thumbnail, title, durationFormatted, className = '' }) {
  // If we have a direct preview URL (e.g. from local object URL)
  if (previewUrl) {
    return (
      <div className={`relative rounded-2xl overflow-hidden bg-slate-950 aspect-video group ${className}`}>
        <video
          src={previewUrl}
          muted
          playsInline
          controls
          className="w-full h-full object-contain"
        />
        {durationFormatted && (
          <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded-lg bg-black/80 text-white text-[11px] font-bold font-mono">
            {durationFormatted}
          </span>
        )}
      </div>
    );
  }

  // URL-based preview with thumbnail
  return (
    <div className={`relative rounded-2xl overflow-hidden bg-slate-950 aspect-video flex items-center justify-center group ${className}`}>
      {thumbnail ? (
        <img
          src={thumbnail}
          alt={title || 'Media preview'}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />
      ) : (
        <div className="flex flex-col items-center justify-center text-slate-500 gap-2">
          <Film className="w-10 h-10 stroke-[1.5]" />
          <span className="text-xs font-semibold">Video Stream</span>
        </div>
      )}

      {/* Dark overlay with duration */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent pointer-events-none" />

      {durationFormatted && (
        <span className="absolute bottom-2.5 right-2.5 px-2.5 py-1 rounded-lg bg-black/80 text-white text-xs font-bold font-mono z-10 border border-white/10">
          {durationFormatted}
        </span>
      )}
    </div>
  );
}
