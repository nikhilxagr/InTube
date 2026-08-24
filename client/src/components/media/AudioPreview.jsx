import { Music, Volume2 } from 'lucide-react';

export function AudioPreview({ previewUrl, title, durationFormatted, format = 'MP3', className = '' }) {
  return (
    <div className={`p-5 rounded-2xl bg-gradient-to-br from-indigo-950/60 via-slate-900/90 to-purple-950/50 border border-indigo-500/20 text-white space-y-4 ${className}`}>
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-500 to-purple-600 text-white flex items-center justify-center shadow-lg shadow-indigo-500/25 shrink-0">
            <Music className="w-6 h-6" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 text-[10px] font-black uppercase tracking-wider font-mono">
                {format} AUDIO
              </span>
              {durationFormatted && (
                <span className="text-xs font-mono text-slate-400">
                  {durationFormatted}
                </span>
              )}
            </div>
            <h4 className="font-bold text-sm text-white truncate mt-1">
              {title || 'Audio Stream'}
            </h4>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 text-xs text-indigo-300 font-semibold shrink-0">
          <Volume2 className="w-4 h-4" />
          <span>High Fidelity</span>
        </div>
      </div>

      {/* Stylized waveform visualizer bars */}
      <div className="flex items-center justify-between gap-1 h-8 px-2 bg-slate-950/60 rounded-xl border border-slate-800">
        {[40, 65, 20, 85, 95, 45, 70, 30, 60, 90, 100, 75, 50, 85, 35, 60, 80, 45, 90, 65, 30, 75, 95, 50].map((h, i) => (
          <div
            key={i}
            className="flex-1 bg-gradient-to-t from-indigo-500 to-pink-500 rounded-full transition-all duration-300"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>

      {/* HTML5 audio element for local files */}
      {previewUrl && (
        <audio
          src={previewUrl}
          controls
          className="w-full h-9 rounded-xl focus:outline-none"
        />
      )}
    </div>
  );
}
