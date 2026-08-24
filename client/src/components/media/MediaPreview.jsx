import { useState } from 'react';
import { Clock, User, Download, RefreshCw, Layers, Sparkles, Gauge, Hourglass, Film, Zap, Play, Image as ImageIcon } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';
import { FormatSelector } from './FormatSelector.jsx';

export function MediaPreview({
  media,
  selectedFormat,
  onSelectFormat,
  onReset,
  onDownload,
  isDownloading = false,
  downloadProgress = null,
  countdown = null
}) {
  const [imgError, setImgError] = useState(false);

  if (!media) return null;

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durationStr = formatDuration(media.duration);

  const handleDownloadClick = () => {
    if (selectedFormat && onDownload) {
      onDownload(selectedFormat);
    }
  };

  const percent = downloadProgress?.percent ?? null;
  const speed = downloadProgress?.speed ?? null;
  const eta = downloadProgress?.eta ?? null;
  const total = downloadProgress?.total ?? null;

  const circleRadius = 30;
  const circleCircumference = 2 * Math.PI * circleRadius;
  const strokeDashoffset = countdown !== null
    ? circleCircumference * (1 - countdown / 10)
    : 0;

  let statusText = 'Connecting to media server...';
  if (countdown !== null) {
    statusText = `Starting in ${countdown}s (connecting stream)...`;
  } else if (downloadProgress?.statusText) {
    statusText = downloadProgress.statusText;
  }

  const renderFallbackCard = () => {
    if (media.platform === 'instagram') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #833ab4 0%, #fd1d1d 50%, #fcb045 100%)' }}>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner">
            <Film className="w-5 h-5 text-white" />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase drop-shadow">Instagram {media.type === 'photo' ? 'Photo' : 'Reel'}</span>
        </div>
      );
    }

    if (media.platform === 'facebook') {
      return (
        <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white"
          style={{ background: 'linear-gradient(135deg, #1877f2 0%, #0d5cb6 100%)' }}>
          <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner">
            <Play className="w-5 h-5 text-white fill-white ml-0.5" />
          </div>
          <span className="text-xs font-bold tracking-wide uppercase drop-shadow">Facebook Video</span>
        </div>
      );
    }

    return (
      <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center text-white"
        style={{ background: 'linear-gradient(135deg, #ef4444 0%, #991b1b 100%)' }}>
        <div className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center mb-2 shadow-inner">
          <Play className="w-5 h-5 text-white fill-white ml-0.5" />
        </div>
        <span className="text-xs font-bold tracking-wide uppercase drop-shadow">Media Preview</span>
      </div>
    );
  };

  return (
    <Card className="p-5 sm:p-7 space-y-6 shadow-2xl bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        <div className="relative w-full sm:w-52 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-md group">
          {media.thumbnail && !imgError ? (
            <img
              src={media.thumbnail}
              alt={media.title || 'Media thumbnail'}
              referrerPolicy="no-referrer"
              crossOrigin="anonymous"
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            renderFallbackCard()
          )}
          {durationStr && (
            <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-bold bg-black/85 text-white rounded-md tracking-wider shadow-sm backdrop-blur-sm">
              {durationStr}
            </span>
          )}
        </div>

        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={
                media.platform === 'youtube' ? 'youtube'
                : media.platform === 'instagram' ? 'instagram'
                : media.platform === 'facebook' ? 'facebook'
                : 'brand'
              }
            >
              {media.platform || 'Public Media'}
            </Badge>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              {media.type || 'Video'}
            </span>
          </div>

          <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-snug break-words">
            {media.title || 'Untitled Media'}
          </h3>

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 pt-1">
            {media.author && (
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-slate-400" />
                <span className="font-medium text-slate-700 dark:text-slate-300 truncate max-w-[180px]">
                  {media.author}
                </span>
              </div>
            )}
            {durationStr && (
              <div className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-400" />
                <span>Duration: {durationStr}</span>
              </div>
            )}
            {media.formats && (
              <div className="flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-slate-400" />
                <span>{media.formats.length} format{media.formats.length === 1 ? '' : 's'} available</span>
              </div>
            )}
          </div>
        </div>
      </div>

      <FormatSelector
        formats={media.formats || []}
        selectedFormat={selectedFormat}
        onSelectFormat={onSelectFormat}
      />

      {isDownloading && (
        <div className="p-4 sm:p-6 rounded-2xl bg-gradient-to-b from-slate-900/95 to-[#090d16]/95 border border-purple-500/40 shadow-2xl shadow-purple-500/10 space-y-4 transition-all animate-fadeIn relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          {countdown !== null ? (
            <div className="flex flex-col sm:flex-row items-center justify-between gap-5 py-2 relative z-10">
              <div className="flex items-center gap-4">
                <div className="relative w-20 h-20 flex items-center justify-center shrink-0">
                  <svg className="w-20 h-20 -rotate-90" viewBox="0 0 72 72">
                    <circle
                      cx="36"
                      cy="36"
                      r={circleRadius}
                      className="stroke-slate-800"
                      strokeWidth="5"
                      fill="transparent"
                    />
                    <circle
                      cx="36"
                      cy="36"
                      r={circleRadius}
                      stroke="url(#countdownGradient)"
                      strokeWidth="5"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="transparent"
                      className="transition-all duration-1000 ease-linear"
                    />
                    <defs>
                      <linearGradient id="countdownGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor="#f59e0b" />
                        <stop offset="50%" stopColor="#ec4899" />
                        <stop offset="100%" stopColor="#a855f7" />
                      </linearGradient>
                    </defs>
                  </svg>

                  <div className="absolute flex flex-col items-center justify-center text-center">
                    <span className="text-2xl font-black text-white font-mono leading-none tracking-tight animate-pulse">
                      {countdown}
                    </span>
                    <span className="text-[9px] font-bold text-amber-400 uppercase tracking-widest mt-0.5">SEC</span>
                  </div>
                </div>

                <div className="space-y-1 text-left">
                  <div className="flex items-center gap-2">
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                      <Zap className="w-3 h-3 animate-bounce" />
                      Triggering Stream...
                    </span>
                  </div>
                  <h4 className="text-sm font-bold text-white">Starting in {countdown}s</h4>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Connecting to high-speed stream for <strong className="text-purple-300">{selectedFormat?.quality || 'Full HD'}</strong>...
                  </p>
                </div>
              </div>

              <div className="text-right hidden sm:block">
                <span className="text-[11px] text-slate-400 bg-slate-800/80 px-3 py-1.5 rounded-xl border border-slate-700/60 font-medium">
                  Will start immediately as stream connects
                </span>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5 relative z-10">
              <div className="flex items-center justify-between text-xs font-semibold">
                <div className="flex items-center gap-2.5 text-purple-200 truncate pr-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-pink-500 animate-ping shrink-0" />
                  <span className="truncate font-medium text-sm text-white">{statusText}</span>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="font-mono text-base sm:text-lg px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/50 text-white font-extrabold shadow-lg shadow-purple-500/20">
                    {percent !== null ? `${Math.round(percent)}%` : '0%'}
                  </span>
                </div>
              </div>

              <div className="w-full h-4 bg-slate-950/80 rounded-full overflow-hidden p-0.5 relative border border-slate-700/70 shadow-inner">
                <div
                  className="h-full rounded-full transition-all duration-300 relative overflow-hidden flex items-center justify-end"
                  style={{
                    width: percent !== null ? `${Math.max(percent, 4)}%` : '20%',
                    background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 30%, #a855f7 65%, #3b82f6 100%)',
                    boxShadow: '0 0 16px rgba(168, 85, 247, 0.6)'
                  }}
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-white shadow-md shadow-white shrink-0 mr-0.5" />
                  <div
                    className="absolute inset-0"
                    style={{
                      background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                      animation: 'gradientShift 2.5s ease infinite'
                    }}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1 text-xs">
                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-cyan-500/20 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Gauge className="w-3.5 h-3.5 text-cyan-400" />
                    Speed
                  </span>
                  <span className="font-mono font-bold text-cyan-300">{speed || 'Calculating...'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-amber-500/20 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Hourglass className="w-3.5 h-3.5 text-amber-400" />
                    Remaining
                  </span>
                  <span className="font-mono font-bold text-amber-300">{eta ? `${eta}` : 'Calculating...'}</span>
                </div>

                <div className="p-2.5 rounded-xl bg-slate-800/60 border border-pink-500/20 flex items-center justify-between">
                  <span className="flex items-center gap-1.5 text-slate-400">
                    <Film className="w-3.5 h-3.5 text-pink-400" />
                    Target Size
                  </span>
                  <span className="font-mono font-bold text-pink-300">{total || selectedFormat?.quality || 'Dynamic'}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          disabled={isDownloading}
          className="text-xs text-slate-600 dark:text-slate-400"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Clear & Analyze Another URL
        </Button>

        <Button
          size="md"
          variant="primary"
          disabled={!selectedFormat || isDownloading}
          isLoading={isDownloading}
          onClick={handleDownloadClick}
          className="font-bold shadow-lg shadow-purple-600/30"
        >
          <Download className="w-4 h-4 mr-2" />
          {isDownloading
            ? (countdown !== null
                ? `Starting in ${countdown}s...`
                : (percent !== null ? `Downloading (${Math.round(percent)}%)...` : 'Processing...'))
            : `Download ${selectedFormat ? `(${selectedFormat.quality || selectedFormat.container?.toUpperCase()})` : ''}`}
        </Button>
      </div>
    </Card>
  );
}
