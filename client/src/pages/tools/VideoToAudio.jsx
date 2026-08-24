import { useState } from 'react';
import { Music, Zap, CheckCircle2, Download } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { QrTransferCard } from '../../components/tools/QrTransferCard.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function VideoToAudio() {
  const {
    state,
    file,
    metadata,
    errorMessage,
    result,
    progress,
    selectFile,
    setReady,
    setProcessing,
    setCompleted,
    setError,
    setProgress,
    reset,
    isProcessing,
    isCompleted
  } = useFileProcessor();

  const [format, setFormat] = useState('mp3');
  const [bitrate, setBitrate] = useState('320k');
  const [showQr, setShowQr] = useState(false);

  const handleFilePicked = async (pickedFile) => {
    selectFile(pickedFile);
    try {
      const meta = await ToolsService.inspectFile(pickedFile);
      setReady(meta);
    } catch {
      // Inspection non-fatal, proceed with basic file info
      setReady({
        filename: pickedFile.name,
        sizeBytes: pickedFile.size
      });
    }
  };

  const handleConvert = async () => {
    if (!file) return;

    setProcessing({ percent: 0 });
    try {
      const res = await ToolsService.videoToAudio(
        file,
        { format, bitrate },
        (prog) => setProgress(prog)
      );

      setCompleted(res);
    } catch (err) {
      setError(err?.message || 'Audio conversion failed. Please try a different format.');
    }
  };

  const formats = [
    { id: 'mp3', label: 'MP3', desc: 'Universally compatible audio' },
    { id: 'm4a', label: 'M4A / AAC', desc: 'High quality Apple standard' },
    { id: 'wav', label: 'WAV', desc: 'Uncompressed lossless audio' },
    { id: 'ogg', label: 'OGG', desc: 'Open source Vorbis audio' }
  ];

  const bitrates = [
    { id: '128k', label: '128 kbps (Standard)' },
    { id: '192k', label: '192 kbps (Medium)' },
    { id: '256k', label: '256 kbps (High)' },
    { id: '320k', label: '320 kbps (Ultra HQ)' }
  ];

  return (
    <ToolLayout
      title="Video to Audio Converter"
      description="Extract studio-quality MP3, M4A, WAV, or OGG audio from your local video files with FFmpeg."
      category="Converters"
      badgeVariant="success"
      icon={Music}
      seoTitle="Video to Audio Converter (MP3, WAV, M4A) - Free & Private"
      seoDescription="Extract crisp audio from MP4, WebM, MOV videos into MP3, M4A, or WAV. Processed securely and auto-deleted."
    >
      <div className="space-y-6">
        <FileDropzone
          onFileSelected={handleFilePicked}
          selectedFile={file}
          onClear={reset}
          accept="video/*,audio/*"
          label="Drop your video file to extract audio"
          description="Supports MP4, WebM, MOV, MKV, AVI, and more (Up to 50MB)"
        />

        {file && !isProcessing && !isCompleted && (
          <Card className="p-6 sm:p-7 space-y-6 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target Audio Format
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      format === f.id
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 ring-2 ring-purple-500/20 text-purple-900 dark:text-purple-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-sm">{f.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Selection (hide for WAV) */}
            {format !== 'wav' && (
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                  Audio Bitrate Quality
                </label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                  {bitrates.map((b) => (
                    <button
                      key={b.id}
                      type="button"
                      onClick={() => setBitrate(b.id)}
                      className={`p-3 rounded-xl border text-center transition-all ${
                        bitrate === b.id
                          ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/60 ring-2 ring-pink-500/20 text-pink-900 dark:text-pink-100 font-bold'
                          : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-xs font-medium text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      <span className="text-xs">{b.label}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Convert Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <div className="text-xs text-slate-500">
                {metadata?.durationFormatted && <span>Source Duration: <strong>{metadata.durationFormatted}</strong></span>}
              </div>

              <Button
                size="lg"
                variant="primary"
                onClick={handleConvert}
                className="w-full sm:w-auto font-bold shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-4 h-4 mr-2" />
                Extract Audio ({format.toUpperCase()})
              </Button>
            </div>
          </Card>
        )}

        {isProcessing && (
          <ProcessingState
            statusText="Extracting and transcoding audio..."
            subText="FFmpeg is isolating the audio track and encoding to your selected bitrate."
            progress={progress}
            onCancel={reset}
          />
        )}

        {state === PROCESSOR_STATES.ERROR && (
          <ProcessingState
            isError
            errorMessage={errorMessage}
            onRetry={handleConvert}
            onCancel={reset}
          />
        )}

        {isCompleted && result && (
          <Card className="p-6 sm:p-8 space-y-6 bg-white/90 dark:bg-slate-900/90 border border-emerald-500/40 rounded-2xl shadow-2xl backdrop-blur-xl text-center">
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto shadow-sm">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h3 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
                Audio Extracted Successfully!
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 font-mono">
                {result.filename}
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                size="md"
                variant="primary"
                onClick={handleConvert}
                className="font-bold text-xs"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download Again
              </Button>

              <Button
                size="md"
                variant="outline"
                onClick={reset}
                className="text-xs"
              >
                Convert Another Video
              </Button>
            </div>
          </Card>
        )}

        {showQr && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
            <QrTransferCard
              token="temp"
              filename={result?.filename}
              onClose={() => setShowQr(false)}
            />
          </div>
        )}
      </div>
    </ToolLayout>
  );
}
