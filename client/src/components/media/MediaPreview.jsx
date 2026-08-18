import { useState } from 'react';
import { Clock, User, Download, RefreshCw, Layers } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';
import { Badge } from '../common/Badge.jsx';
import { Alert } from '../common/Alert.jsx';
import { FormatSelector } from './FormatSelector.jsx';

export function MediaPreview({ media, selectedFormat, onSelectFormat, onReset }) {
  const [downloadNotice, setDownloadNotice] = useState(false);

  if (!media) return null;

  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return null;
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const durationStr = formatDuration(media.duration);

  const handleDownloadClick = () => {
    setDownloadNotice(true);
  };

  return (
    <Card className="p-5 sm:p-7 space-y-6 shadow-card">
      <div className="flex flex-col sm:flex-row gap-5 items-start">
        {/* Media Thumbnail */}
        {media.thumbnail ? (
          <div className="relative w-full sm:w-52 aspect-video rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-800 shrink-0 border border-slate-200 dark:border-slate-700 shadow-sm">
            <img
              src={media.thumbnail}
              alt={media.title || 'Media thumbnail'}
              className="w-full h-full object-cover"
              loading="lazy"
            />
            {durationStr && (
              <span className="absolute bottom-2 right-2 px-1.5 py-0.5 text-[11px] font-bold bg-black/85 text-white rounded-md tracking-wider">
                {durationStr}
              </span>
            )}
          </div>
        ) : (
          <div className="w-full sm:w-52 aspect-video rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 text-xs shrink-0 border border-slate-200 dark:border-slate-700">
            No Preview Available
          </div>
        )}

        {/* Metadata Details */}
        <div className="flex-1 min-w-0 space-y-2.5">
          <div className="flex flex-wrap items-center gap-2">
            <Badge
              variant={media.platform === 'youtube' ? 'youtube' : media.platform === 'instagram' ? 'instagram' : 'brand'}
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

      {/* Formats Selection */}
      <FormatSelector
        formats={media.formats || []}
        selectedFormat={selectedFormat}
        onSelectFormat={(fmt) => {
          onSelectFormat(fmt);
          setDownloadNotice(false);
        }}
      />

      {/* Notice regarding backend integration */}
      {downloadNotice && (
        <Alert
          type="info"
          title="UI Ready for Media Pipeline"
          message="Selected format is validated. In Phase 2 UI mode, the complete visual interface is ready; server-side media extraction and transcode streaming will be active once provider pipelines are linked in subsequent phases."
        />
      )}

      {/* Action Footer */}
      <div className="pt-3 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
        <Button
          size="sm"
          variant="ghost"
          onClick={onReset}
          className="text-xs text-slate-600 dark:text-slate-400"
        >
          <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
          Clear & Analyze Another URL
        </Button>

        <Button
          size="md"
          variant="primary"
          disabled={!selectedFormat}
          onClick={handleDownloadClick}
          className="font-bold shadow-md"
        >
          <Download className="w-4 h-4 mr-2" />
          Download {selectedFormat ? `(${selectedFormat.quality || selectedFormat.container?.toUpperCase()})` : ''}
        </Button>
      </div>
    </Card>
  );
}
