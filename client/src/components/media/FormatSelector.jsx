import { useState, useMemo } from 'react';
import { Video, Music, Check } from 'lucide-react';
import { Badge } from '../common/Badge.jsx';

export function FormatSelector({ formats = [], selectedFormat, onSelectFormat }) {
  const [activeTab, setActiveTab] = useState('all');

  const hasVideo = useMemo(() => formats.some((f) => f.type === 'video'), [formats]);
  const hasAudio = useMemo(() => formats.some((f) => f.type === 'audio'), [formats]);

  const filteredFormats = useMemo(() => {
    if (activeTab === 'video') return formats.filter((f) => f.type === 'video');
    if (activeTab === 'audio') return formats.filter((f) => f.type === 'audio');
    return formats;
  }, [formats, activeTab]);

  if (!formats || formats.length === 0) {
    return (
      <div className="p-5 text-center text-xs text-slate-500 dark:text-slate-400 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-200 dark:border-slate-800">
        No additional stream resolutions available for this item.
      </div>
    );
  }

  const formatFileSize = (bytes) => {
    if (!bytes || bytes <= 0) return null;
    const mb = bytes / (1024 * 1024);
    return `${mb.toFixed(1)} MB`;
  };

  return (
    <div className="space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Select Output Format
        </label>

        {hasVideo && hasAudio && (
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800/80 rounded-xl self-start border border-slate-200/60 dark:border-slate-700/60">
            <button
              type="button"
              onClick={() => setActiveTab('all')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'all'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              All ({formats.length})
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('video')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'video'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Video
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('audio')}
              className={`px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
                activeTab === 'audio'
                  ? 'bg-white dark:bg-slate-700 text-blue-600 dark:text-blue-400 shadow-sm'
                  : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Audio
            </button>
          </div>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-72 overflow-y-auto pr-1">
        {filteredFormats.map((fmt) => {
          const isSelected = selectedFormat?.formatId === fmt.formatId;
          const isVideo = fmt.type === 'video';
          const sizeStr = formatFileSize(fmt.approxSize);

          return (
            <button
              key={fmt.formatId}
              type="button"
              role="radio"
              aria-checked={isSelected}
              onClick={() => onSelectFormat(fmt)}
              className={`flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all group backdrop-blur-md ${
                isSelected
                  ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 ring-2 ring-blue-500/30 text-blue-950 dark:text-blue-100 shadow-md shadow-blue-500/10'
                  : 'border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 hover:border-blue-400/50 dark:hover:border-blue-500/50 text-slate-800 dark:text-slate-200'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                    isVideo
                      ? 'bg-blue-100 text-blue-700 dark:bg-blue-950/80 dark:text-blue-300'
                      : 'bg-emerald-100 text-emerald-700 dark:bg-emerald-950/80 dark:text-emerald-300'
                  }`}
                >
                  {isVideo ? <Video className="w-4 h-4" /> : <Music className="w-4 h-4" />}
                </div>

                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs font-bold uppercase tracking-tight truncate">
                      {fmt.quality || 'Standard'}
                    </span>
                    <Badge size="sm" variant={isVideo ? 'brand' : 'success'}>
                      {fmt.container?.toUpperCase() || 'FILE'}
                    </Badge>
                  </div>
                  <div className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                    {fmt.hasAudio && fmt.hasVideo ? 'Video + Audio' : fmt.hasVideo ? 'Video track' : 'Audio track'}
                    {sizeStr ? ` • ~${sizeStr}` : ''}
                  </div>
                </div>
              </div>

              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ml-2 transition-all ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'border border-slate-300 dark:border-slate-700'
                }`}
              >
                {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
