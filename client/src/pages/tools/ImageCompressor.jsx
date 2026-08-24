import { useState } from 'react';
import { Sliders, CheckCircle2, TrendingDown } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function ImageCompressor() {
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

  const [quality, setQuality] = useState(75);
  const [compressionStats, setCompressionStats] = useState(null);

  const handleCompress = async () => {
    if (!file) return;

    startProcessing();
    setCompressionStats(null);

    try {
      const res = await ToolsService.imageCompress(
        file,
        { quality },
        (p) => updateProgress(p.percent)
      );

      setCompressionStats({
        origSize: res.origSize,
        outSize: res.outSize,
        reductionPercent: res.reductionPercent
      });

      finishProcessing(res);
      ToolsService.triggerDownload(res.blob, res.filename);
    } catch (err) {
      failProcessing(err.message || 'Image compression failed');
    }
  };

  const formatSizeMB = (bytes) => {
    if (!bytes) return '0 KB';
    if (bytes >= 1024 * 1024) {
      return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
    }
    return `${Math.round(bytes / 1024)} KB`;
  };

  return (
    <ToolLayout
      title="Image Compressor"
      description="Reduce photo and graphic file sizes significantly while maintaining sharp visual quality."
      icon={TrendingDown}
      category="Image Tools"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif'] }}
            title="Drag & drop an image file here"
            subtitle="Supports JPG, PNG, WebP, and AVIF (Up to 50MB)"
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
                <Sliders className="w-4 h-4 text-purple-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Compression Settings
                </h3>
              </div>

              {/* Quality Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Compression Preset
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                  {[
                    { q: 85, label: 'Light / High Quality', desc: 'Minimal visual change (~20-40% reduction)' },
                    { q: 70, label: 'Balanced (Recommended)', desc: 'Optimal web balance (~40-65% reduction)' },
                    { q: 50, label: 'Maximum Compression', desc: 'Smallest file size (~60-80% reduction)' }
                  ].map((p) => (
                    <button
                      key={p.q}
                      type="button"
                      onClick={() => setQuality(p.q)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        quality === p.q
                          ? 'border-purple-500 bg-purple-50/80 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 ring-2 ring-purple-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-bold text-xs">{p.label}</div>
                      <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Custom Quality Level
                  </label>
                  <span className="text-xs font-mono font-bold text-purple-600 dark:text-purple-400">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="15"
                  max="95"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleCompress}
                  className="font-bold shadow-lg shadow-purple-500/25 px-6 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500"
                >
                  <TrendingDown className="w-4 h-4 mr-2" />
                  Compress & Download
                </Button>
              </div>
            </Card>
          </div>
        )}

        {/* Compression Results Statistics Card */}
        {compressionStats && state === PROCESSOR_STATES.COMPLETED && (
          <Card className="p-6 sm:p-7 border-2 border-emerald-500/50 bg-emerald-950/20 rounded-3xl space-y-4 animate-fadeIn">
            <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
              <CheckCircle2 className="w-5 h-5" />
              <span>Compression Complete</span>
            </div>

            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Original</span>
                <div className="font-mono font-black text-sm text-slate-200 mt-1">
                  {formatSizeMB(compressionStats.origSize)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-[10px] uppercase font-bold text-slate-400">Compressed</span>
                <div className="font-mono font-black text-sm text-emerald-400 mt-1">
                  {formatSizeMB(compressionStats.outSize)}
                </div>
              </div>

              <div className="p-3.5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-center">
                <span className="text-[10px] uppercase font-bold text-emerald-400">Reduced By</span>
                <div className="font-mono font-black text-sm text-emerald-300 mt-1 flex items-center justify-center gap-1">
                  <TrendingDown className="w-4 h-4" />
                  <span>-{compressionStats.reductionPercent}%</span>
                </div>
              </div>
            </div>
          </Card>
        )}

        {/* Processing & Completed State */}
        {(state === PROCESSOR_STATES.PROCESSING || state === PROCESSOR_STATES.COMPLETED || state === PROCESSOR_STATES.ERROR) && (
          <ProcessingState
            state={state}
            progress={progress}
            error={error}
            result={result}
            onReset={() => {
              reset();
              setCompressionStats(null);
            }}
            onRetry={handleCompress}
            title="Compressing Image"
          />
        )}
      </div>
    </ToolLayout>
  );
}
