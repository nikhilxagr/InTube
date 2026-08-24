import { useState } from 'react';
import { Music, Sliders } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function AudioConverter() {
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

  const [targetFormat, setTargetFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('320k');

  const handleConvert = async () => {
    if (!file) return;

    startProcessing();
    try {
      const res = await ToolsService.audioConverter(
        file,
        { format: targetFormat, bitrate },
        (p) => updateProgress(p.percent)
      );

      finishProcessing(res);
      ToolsService.triggerDownload(res.blob, res.filename);
    } catch (err) {
      failProcessing(err.message || 'Audio conversion failed');
    }
  };

  const isLossless = targetFormat === 'wav';

  return (
    <ToolLayout
      title="Audio Converter"
      description="Convert audio tracks between MP3, M4A, WAV, AAC, and OGG formats with customizable bitrates."
      icon={Music}
      category="Audio Tools"
    >
      <div className="space-y-6">
        {/* Upload Zone */}
        {!file && (
          <FileDropzone
            onFileSelect={handleFileSelect}
            accept={{ 'audio/*': ['.mp3', '.m4a', '.aac', '.wav', '.ogg', '.flac', '.opus'] }}
            title="Drag & drop an audio file here"
            subtitle="Supports MP3, M4A, WAV, AAC, OGG, and FLAC (Up to 50MB)"
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
                  Target Audio Format
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
                  {[
                    { key: 'mp3', label: 'MP3', desc: 'Universal' },
                    { key: 'm4a', label: 'M4A', desc: 'Apple AAC' },
                    { key: 'wav', label: 'WAV', desc: 'Lossless PCM' },
                    { key: 'aac', label: 'AAC', desc: 'High Efficiency' },
                    { key: 'ogg', label: 'OGG', desc: 'Vorbis Open' }
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

              {/* Bitrate Selection (Hidden for WAV Lossless) */}
              {!isLossless ? (
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Audio Bitrate Quality
                  </label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    {[
                      { key: '128k', label: '128 kbps', desc: 'Standard / Compact' },
                      { key: '192k', label: '192 kbps', desc: 'Balanced Sound' },
                      { key: '256k', label: '256 kbps', desc: 'High Quality' },
                      { key: '320k', label: '320 kbps', desc: 'Maximum Studio' }
                    ].map((br) => (
                      <button
                        key={br.key}
                        type="button"
                        onClick={() => setBitrate(br.key)}
                        className={`p-3 rounded-xl border text-left transition-all ${
                          bitrate === br.key
                            ? 'border-blue-500 bg-blue-50/80 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 ring-2 ring-blue-500/20'
                            : 'border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-800/40 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="font-mono font-bold text-xs">{br.label}</div>
                        <div className="text-[10px] text-slate-500 dark:text-slate-400 mt-0.5">{br.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-xs text-blue-900 dark:text-blue-200">
                  ℹ️ WAV format uses uncompressed 16-bit PCM lossless encoding.
                </div>
              )}

              {/* Submit Button */}
              <div className="pt-2 flex justify-end">
                <Button
                  size="md"
                  variant="primary"
                  onClick={handleConvert}
                  className="font-bold shadow-lg shadow-blue-500/25 px-6"
                >
                  <Music className="w-4 h-4 mr-2" />
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
            title="Converting Audio Track"
          />
        )}
      </div>
    </ToolLayout>
  );
}
