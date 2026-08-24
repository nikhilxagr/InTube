import { useState } from 'react';
import { Image as ImageIcon, Sliders } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function ImageConverter() {
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

  const [targetFormat, setTargetFormat] = useState('webp');
  const [quality, setQuality] = useState(85);

  const handleConvert = async () => {
    if (!file) return;

    startProcessing();
    try {
      const res = await ToolsService.imageConvert(
        file,
        { format: targetFormat, quality },
        (p) => updateProgress(p.percent)
      );

      finishProcessing(res);
      ToolsService.triggerDownload(res.blob, res.filename);
    } catch (err) {
      failProcessing(err.message || 'Image conversion failed');
    }
  };

  return (
    <ToolLayout
      title="Image Format Converter"
      description="Convert images between JPG, PNG, WebP, and ultra-efficient AVIF formats."
      icon={ImageIcon}
      category="Image Tools"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept={{ 'image/*': ['.jpg', '.jpeg', '.png', '.webp', '.avif', '.gif'] }}
            title="Drag & drop an image file here"
            subtitle="Supports JPG, PNG, WebP, AVIF, and GIF (Up to 50MB)"
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
                  Conversion Settings
                </h3>
              </div>

              {/* Format Selection */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Target Image Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {[
                    { key: 'webp', label: 'WebP', desc: 'Modern & Compact' },
                    { key: 'jpg', label: 'JPG', desc: 'Universal Photo' },
                    { key: 'png', label: 'PNG', desc: 'Lossless & Alpha' },
                    { key: 'avif', label: 'AVIF', desc: 'Next-Gen Ultra Small' }
                  ].map((fmt) => (
                    <button
                      key={fmt.key}
                      type="button"
                      onClick={() => setTargetFormat(fmt.key)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        targetFormat === fmt.key
                          ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-mono font-bold text-xs uppercase">{fmt.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{fmt.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Quality Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Quality Level
                  </label>
                  <span className="text-xs font-mono font-bold text-blue-600 dark:text-blue-400">
                    {quality}%
                  </span>
                </div>
                <input
                  type="range"
                  min="20"
                  max="100"
                  value={quality}
                  onChange={(e) => setQuality(Number(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-600"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleConvert}
                  className="font-bold shadow-lg shadow-blue-500/25 px-6"
                >
                  <ImageIcon className="w-4 h-4 mr-2" />
                  Convert to {targetFormat.toUpperCase()}
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
            onRetry={handleConvert}
            title="Converting Image Format"
          />
        )}
      </div>
    </ToolLayout>
  );
}
