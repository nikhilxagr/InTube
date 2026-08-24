import { useState, useEffect } from 'react';
import { Download, RefreshCw, Gauge, Hourglass, Smartphone, Layers } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { FormatSelector } from './FormatSelector.jsx';
import { QrTransferCard } from '../tools/QrTransferCard.jsx';
import { VideoPreview } from './VideoPreview.jsx';
import { AudioPreview } from './AudioPreview.jsx';
import { MediaDetails } from './MediaDetails.jsx';
import { PresetSelector } from './PresetSelector.jsx';
import { PresetResolver } from './PresetResolver.js';
import { FileSizeEstimate } from './FileSizeEstimate.jsx';

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
  const [showFullCaption, setShowFullCaption] = useState(false);
  const [showQr, setShowQr] = useState(false);
  const [currentPreset, setCurrentPreset] = useState(() => PresetResolver.getSavedPreset());

  // Apply preset whenever media changes or preset changes
  useEffect(() => {
    if (media?.formats && media.formats.length > 0) {
      const resolved = PresetResolver.resolvePreset(currentPreset, media.formats);
      if (resolved && onSelectFormat) {
        onSelectFormat(resolved);
      }
    }
  }, [media?.url, media?.id, media?.formats, currentPreset, onSelectFormat]);

  const handlePresetChange = (presetKey) => {
    setCurrentPreset(presetKey);
    if (media?.formats) {
      const resolved = PresetResolver.resolvePreset(presetKey, media.formats);
      if (resolved && onSelectFormat) {
        onSelectFormat(resolved);
      }
    }
  };

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durationStr = formatDuration(media?.duration);

  const handleDownloadClick = () => {
    if (selectedFormat && onDownload) {
      onDownload(selectedFormat);
    }
  };

  const isAudioOnly = selectedFormat?.type === 'audio';

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

  if (!media) return null;

  return (
    <Card className="p-6 sm:p-7 space-y-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl shadow-xl animate-fadeIn">
      {/* Top Media Display */}
      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Visual Preview */}
        <div className="w-full md:w-64 shrink-0">
          {isAudioOnly ? (
            <AudioPreview
              title={media.title}
              durationFormatted={durationStr}
              format={selectedFormat?.container?.toUpperCase() || 'MP3'}
            />
          ) : (
            <VideoPreview
              thumbnail={media.thumbnail}
              title={media.title}
              durationFormatted={durationStr}
            />
          )}
        </div>

        {/* Media Details */}
        <div className="flex-1 min-w-0 space-y-4 w-full">
          <MediaDetails
            title={media.title}
            author={media.author}
            durationFormatted={durationStr}
            platform={media.platform}
            type={media.type}
          />

          {/* Full Caption toggle for social media posts */}
          {media.title && media.title.length > 120 && (
            <button
              type="button"
              onClick={() => setShowFullCaption(!showFullCaption)}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              {showFullCaption ? 'Show less' : 'Read full caption'}
            </button>
          )}

          {showFullCaption && (
            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-700 dark:text-slate-300 whitespace-pre-wrap border border-slate-200/50 dark:border-slate-700/50 font-sans">
              {media.title}
            </div>
          )}

          {/* Quick preset selector */}
          <PresetSelector
            selectedPreset={currentPreset}
            onSelectPreset={handlePresetChange}
          />
        </div>
      </div>

      {/* Format Selector */}
      <div className="pt-2 border-t border-slate-100 dark:border-slate-800/80 space-y-3">
        <FormatSelector
          formats={media.formats || []}
          selectedFormat={selectedFormat}
          onSelectFormat={onSelectFormat}
        />

        {/* Honest File Size Estimator */}
        {selectedFormat && (
          <div className="pt-1 flex items-center justify-between">
            <FileSizeEstimate
              sizeBytes={selectedFormat.approxSize}
              durationSeconds={media.duration}
            />
          </div>
        )}
      </div>

      {/* Progress & Countdown Area when downloading */}
      {isDownloading && (
        <div className="p-5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/80 dark:border-blue-800/60 space-y-4 animate-fadeIn">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              {countdown !== null ? (
                <div className="relative w-12 h-12 flex items-center justify-center shrink-0">
                  <svg className="w-12 h-12 -rotate-90" viewBox="0 0 70 70">
                    <circle
                      cx="35"
                      cy="35"
                      r={circleRadius}
                      className="stroke-blue-200 dark:stroke-blue-900"
                      strokeWidth="6"
                      fill="none"
                    />
                    <circle
                      cx="35"
                      cy="35"
                      r={circleRadius}
                      className="stroke-blue-600 dark:stroke-blue-400 transition-all duration-1000 ease-linear"
                      strokeWidth="6"
                      strokeDasharray={circleCircumference}
                      strokeDashoffset={strokeDashoffset}
                      strokeLinecap="round"
                      fill="none"
                    />
                  </svg>
                  <span className="absolute font-mono font-black text-sm text-blue-600 dark:text-blue-400">
                    {countdown}
                  </span>
                </div>
              ) : (
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center animate-spin">
                  <RefreshCw className="w-5 h-5" />
                </div>
              )}

              <div>
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                  {statusText}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Processing high-quality stream with FFmpeg
                </p>
              </div>
            </div>

            {percent !== null && (
              <span className="text-lg font-black font-mono text-blue-600 dark:text-blue-400">
                {Math.round(percent)}%
              </span>
            )}
          </div>

          {percent !== null && (
            <div className="w-full bg-slate-200 dark:bg-slate-800 h-2.5 rounded-full overflow-hidden">
              <div
                className="bg-gradient-to-r from-blue-600 to-indigo-500 h-full rounded-full transition-all duration-300"
                style={{ width: `${percent}%` }}
              />
            </div>
          )}

          {(speed || eta || total) && (
            <div className="flex flex-wrap items-center gap-4 text-xs font-mono text-slate-600 dark:text-slate-300">
              {speed && (
                <span className="flex items-center gap-1">
                  <Gauge className="w-3.5 h-3.5 text-blue-500" /> {speed}
                </span>
              )}
              {eta && (
                <span className="flex items-center gap-1">
                  <Hourglass className="w-3.5 h-3.5 text-amber-500" /> ETA {eta}
                </span>
              )}
              {total && (
                <span className="flex items-center gap-1">
                  <Layers className="w-3.5 h-3.5 text-purple-500" /> Total {total}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      {/* Action Buttons */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
        <Button
          variant="outline"
          size="md"
          onClick={onReset}
          disabled={isDownloading}
          className="w-full sm:w-auto font-semibold"
        >
          <RefreshCw className="w-4 h-4 mr-2" />
          Clear / Reset
        </Button>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <Button
            variant="outline"
            size="md"
            onClick={() => setShowQr(true)}
            disabled={isDownloading}
            className="w-full sm:w-auto font-semibold"
          >
            <Smartphone className="w-4 h-4 mr-2 text-purple-500" />
            Transfer (QR)
          </Button>

          <Button
            variant="primary"
            size="md"
            onClick={handleDownloadClick}
            disabled={!selectedFormat || isDownloading}
            className="w-full sm:w-auto font-bold shadow-lg shadow-blue-500/25 px-6"
          >
            <Download className="w-4 h-4 mr-2" />
            {isDownloading ? 'Downloading...' : `Download ${selectedFormat?.container?.toUpperCase() || ''}`}
          </Button>
        </div>
      </div>

      {/* QR Transfer Modal */}
      {showQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR Transfer Modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="fixed inset-0" onClick={() => setShowQr(false)} />
          <div className="relative z-10 w-full max-w-md">
            <QrTransferCard
              token="phone_qr_transfer"
              filename={media.title ? `${media.title}.${selectedFormat?.container || 'mp4'}` : 'media.mp4'}
              onClose={() => setShowQr(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
