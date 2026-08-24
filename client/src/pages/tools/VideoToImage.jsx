import { useState } from 'react';
import { Image as ImageIcon, Sliders, Archive } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function VideoToImage() {
  const {
    file,
    state,
    metadata,
    progress,
    error,
    result,
    handleFileSelect,
    startProcessing,
    finishProcessing,
    failProcessing,
    reset,
    updateProgress
  } = useFileProcessor();

  const [mode, setMode] = useState('first_frame'); // 'first_frame' | 'timestamp' | 'interval'
  const [timestamp, setTimestamp] = useState('00:00:05.000');
  const [interval, setInterval] = useState(5);
  const [format, setFormat] = useState('jpg');

  const handleExtract = async () => {
    if (!file) return;

    startProcessing();
    try {
      const res = await ToolsService.videoToImage(
        file,
        { mode, timestamp, interval, format },
        (p) => updateProgress(p.percent)
      );

      finishProcessing(res);
      ToolsService.triggerDownload(res.blob, res.filename);
    } catch (err) {
      failProcessing(err.message || 'Frame extraction failed');
    }
  };

  const isInterval = mode === 'interval';

  return (
    <ToolLayout
      title="Video → Image Frames"
      description="Extract high-definition still frames, cover photos, or regular frame intervals (ZIP) directly from your video."
      icon={ImageIcon}
      category="Video Tools"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept={{ 'video/*': ['.mp4', '.m4v', '.webm', '.mov', '.mkv', '.avi'] }}
            title="Drag & drop a video file here"
            subtitle="Supports MP4, WebM, MOV, MKV, and AVI (Up to 50MB)"
          />
        )}

        {/* Selected File & Settings */}
        {file && state !== PROCESSOR_STATES.PROCESSING && state !== PROCESSOR_STATES.COMPLETED && (
          <div className="space-y-6 animate-fadeIn">
            {metadata && (
              <MediaInfo
                metadata={metadata}
                onRemove={reset}
              />
            )}

            <Card className="p-6 sm:p-7 space-y-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
              <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
                <Sliders className="w-4 h-4 text-blue-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Extraction Configuration
                </h3>
              </div>

              {/* Mode Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Extraction Mode
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { key: 'first_frame', label: 'First Frame', desc: 'Cover image at 00:00.1' },
                    { key: 'timestamp', label: 'Specific Time', desc: 'Custom video timestamp' },
                    { key: 'interval', label: 'Frame Interval (ZIP)', desc: 'Every N seconds sequence' }
                  ].map((m) => (
                    <button
                      key={m.key}
                      type="button"
                      onClick={() => setMode(m.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        mode === m.key
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{m.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{m.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Timestamp Input if mode is timestamp */}
              {mode === 'timestamp' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Timestamp (HH:MM:SS or Seconds)
                  </label>
                  <input
                    type="text"
                    value={timestamp}
                    onChange={(e) => setTimestamp(e.target.value)}
                    placeholder="00:00:05.000"
                    className="w-full max-w-xs p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              )}

              {/* Interval Input if mode is interval */}
              {mode === 'interval' && (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Interval Frequency
                  </label>
                  <div className="flex items-center gap-3">
                    <select
                      value={interval}
                      onChange={(e) => setInterval(Number(e.target.value))}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-900 dark:text-white"
                    >
                      <option value={1}>Every 1 second</option>
                      <option value={2}>Every 2 seconds</option>
                      <option value={5}>Every 5 seconds</option>
                      <option value={10}>Every 10 seconds</option>
                      <option value={30}>Every 30 seconds</option>
                    </select>
                    <span className="text-xs text-slate-500 flex items-center gap-1">
                      <Archive className="w-3.5 h-3.5 text-purple-500" /> Exported as compressed ZIP
                    </span>
                  </div>
                </div>
              )}

              {/* Output Image Format */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Image Format
                </label>
                <div className="flex flex-wrap gap-2">
                  {['jpg', 'png', 'webp'].map((fmt) => (
                    <button
                      key={fmt}
                      type="button"
                      onClick={() => setFormat(fmt)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase font-mono transition-all ${
                        format === fmt
                          ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                      }`}
                    >
                      {fmt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleExtract}
                  className="font-bold shadow-lg shadow-blue-500/25 px-6"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  {isInterval ? 'Extract & Download ZIP' : 'Extract Frame'}
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Processing & Completed State */}
        {(state === PROCESSOR_STATES.PROCESSING || state === PROCESSOR_STATES.COMPLETED || state === PROCESSOR_STATES.ERROR) && (
          <ProcessingState
            state={state}
            progress={progress}
            error={error}
            result={result}
            onReset={reset}
            onRetry={handleExtract}
            title={isInterval ? 'Extracting Frames & Packaging ZIP' : 'Extracting Video Frame'}
          />
        )}
      </div>
    </ToolLayout>
  );
}
