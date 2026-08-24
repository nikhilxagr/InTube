import { useState, useEffect } from 'react';
import { Sliders, Lock, Unlock } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function ImageResizer() {
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

  const [width, setWidth] = useState('');
  const [height, setHeight] = useState('');
  const [lockAspectRatio, setLockAspectRatio] = useState(true);
  const [allowUpscale, setAllowUpscale] = useState(false);

  // Original aspect ratio
  const originalWidth = metadata?.video?.resolution ? parseInt(metadata.video.resolution.split('x')[0], 10) : null;
  const originalHeight = metadata?.video?.resolution ? parseInt(metadata.video.resolution.split('x')[1], 10) : null;
  const aspectRatio = (originalWidth && originalHeight) ? originalWidth / originalHeight : 1;

  // Set default width when metadata loads
  useEffect(() => {
    if (originalWidth && originalHeight) {
      setWidth(String(originalWidth));
      setHeight(String(originalHeight));
    }
  }, [originalWidth, originalHeight]);

  const handleWidthChange = (val) => {
    setWidth(val);
    if (lockAspectRatio && val && aspectRatio) {
      const numW = parseInt(val, 10);
      if (!isNaN(numW)) {
        setHeight(String(Math.round(numW / aspectRatio)));
      }
    }
  };

  const handleHeightChange = (val) => {
    setHeight(val);
    if (lockAspectRatio && val && aspectRatio) {
      const numH = parseInt(val, 10);
      if (!isNaN(numH)) {
        setWidth(String(Math.round(numH * aspectRatio)));
      }
    }
  };

  const applyPresetWidth = (targetW) => {
    handleWidthChange(String(targetW));
  };

  const handleResize = async () => {
    if (!file) return;
    if (!width && !height) return;

    startProcessing();
    try {
      const res = await ToolsService.imageResize(
        file,
        { width, height, allowUpscale },
        (p) => updateProgress(p.percent)
      );

      finishProcessing(res);
      ToolsService.triggerDownload(res.blob, res.filename);
    } catch (err) {
      failProcessing(err.message || 'Image resizing failed');
    }
  };

  return (
    <ToolLayout
      title="Image Resizer"
      description="Change image dimensions and pixel resolution while strictly preserving original aspect ratio."
      icon={Sliders}
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
                <Sliders className="w-4 h-4 text-emerald-500" />
                <h3 className="font-bold text-sm text-slate-900 dark:text-white">
                  Dimension Presets & Sizing
                </h3>
              </div>

              {/* Quick Width Presets */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Resolution Presets
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                  {[
                    { w: 1920, label: '1920px', desc: 'Full HD' },
                    { w: 1280, label: '1280px', desc: 'Standard HD' },
                    { w: 1080, label: '1080px', desc: 'Square / Social' },
                    { w: 720, label: '720px', desc: 'Mobile Web' },
                    { w: 480, label: '480px', desc: 'Thumbnail' }
                  ].map((p) => (
                    <button
                      key={p.w}
                      type="button"
                      onClick={() => applyPresetWidth(p.w)}
                      className={`p-2.5 rounded-xl border text-center transition-all ${
                        String(width) === String(p.w)
                          ? 'border-emerald-500 bg-emerald-50/80 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 ring-2 ring-emerald-500/20 font-bold'
                          : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <div className="font-mono text-xs">{p.label}</div>
                      <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Dimensions */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Width (Pixels)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="8000"
                    value={width}
                    onChange={(e) => handleWidthChange(e.target.value)}
                    placeholder="e.g. 1920"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Height (Pixels)
                  </label>
                  <input
                    type="number"
                    min="10"
                    max="8000"
                    value={height}
                    onChange={(e) => handleHeightChange(e.target.value)}
                    placeholder="e.g. 1080"
                    className="w-full p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono text-xs text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pt-1 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setLockAspectRatio(!lockAspectRatio)}
                  className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:text-emerald-500 transition-colors"
                >
                  {lockAspectRatio ? (
                    <Lock className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <Unlock className="w-4 h-4 text-slate-400" />
                  )}
                  <span>Lock Aspect Ratio ({lockAspectRatio ? 'Active' : 'Free'})</span>
                </button>

                <label className="flex items-center gap-2 text-xs font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={allowUpscale}
                    onChange={(e) => setAllowUpscale(e.target.checked)}
                    className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500"
                  />
                  <span>Allow Upscaling beyond original resolution</span>
                </label>
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleResize}
                  disabled={!width && !height}
                  className="font-bold shadow-lg shadow-emerald-500/25 px-6 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500"
                >
                  <Sliders className="w-4 h-4 mr-2" />
                  Resize & Download
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
            onRetry={handleResize}
            title="Resizing Image"
          />
        )}
      </div>
    </ToolLayout>
  );
}
