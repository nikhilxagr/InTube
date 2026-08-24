import { useState } from 'react';
import { Film, Zap, CheckCircle2, Download, Layers } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { FileDropzone } from '../../components/tools/FileDropzone.jsx';
import { ProcessingState } from '../../components/tools/ProcessingState.jsx';
import { MediaInfo } from '../../components/tools/MediaInfo.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Card } from '../../components/common/Card.jsx';
import { useFileProcessor, PROCESSOR_STATES } from '../../hooks/useFileProcessor.js';
import { ToolsService } from '../../services/tools.service.js';

export function VideoConverter() {
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

  const [format, setFormat] = useState('mp4');
  const [quality, setQuality] = useState('balanced');

  const handleFilePicked = async (pickedFile) => {
    selectFile(pickedFile);
    try {
      const meta = await ToolsService.inspectFile(pickedFile);
      setReady(meta);
    } catch {
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
      const res = await ToolsService.convertVideo(
        file,
        { format, quality },
        (prog) => setProgress(prog)
      );

      setCompleted(res);
    } catch (err) {
      setError(err?.message || 'Video conversion failed. Please verify the source file format.');
    }
  };

  const formats = [
    { id: 'mp4', label: 'MP4', desc: 'Universal H.264 + AAC compatibility' },
    { id: 'webm', label: 'WebM', desc: 'Modern web & browser optimized video' },
    { id: 'mov', label: 'MOV', desc: 'Apple QuickTime container' }
  ];

  const presets = [
    { id: 'balanced', label: 'Balanced', desc: 'Optimal balance of quality & fast encode' },
    { id: 'high', label: 'High Quality', desc: 'Crisp visual fidelity (CRF 18)' },
    { id: 'small', label: 'Small File', desc: 'Maximum compression for quick sharing' }
  ];

  return (
    <ToolLayout
      title="Video Format Converter"
      description="Transcode and normalize local videos to MP4, WebM, or MOV formats securely without watermarks."
      category="Converters"
      badgeVariant="brand"
      icon={Film}
      seoTitle="Video Format Converter (MP4, WebM, MOV) - Fast & Private"
      seoDescription="Convert video files online to MP4, WebM, or MOV. Fast FFmpeg transcoding with privacy-first ephemeral storage."
    >
      <div className="space-y-6">
        <FileDropzone
          onFileSelected={handleFilePicked}
          selectedFile={file}
          onClear={reset}
          accept="video/*"
          label="Drop your video file to convert format"
          description="Supports MP4, WebM, MOV, MKV, AVI, FLV, 3GP (Up to 50MB)"
        />

        {metadata && !isProcessing && !isCompleted && (
          <MediaInfo metadata={metadata} />
        )}

        {file && !isProcessing && !isCompleted && (
          <Card className="p-6 sm:p-7 space-y-6 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
            {/* Format Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Target Output Format
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {formats.map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setFormat(f.id)}
                    className={`p-4 rounded-xl border text-left transition-all ${
                      format === f.id
                        ? 'border-purple-500 bg-purple-50/70 dark:bg-purple-950/60 ring-2 ring-purple-500/20 text-purple-900 dark:text-purple-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-extrabold text-sm flex items-center justify-between">
                      <span>{f.label}</span>
                      <Layers className="w-4 h-4 opacity-50" />
                    </div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{f.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Quality Preset */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Encoding Preset &amp; Quality
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {presets.map((p) => (
                  <button
                    key={p.id}
                    type="button"
                    onClick={() => setQuality(p.id)}
                    className={`p-3.5 rounded-xl border text-left transition-all ${
                      quality === p.id
                        ? 'border-pink-500 bg-pink-50/70 dark:bg-pink-950/60 ring-2 ring-pink-500/20 text-pink-900 dark:text-pink-100 shadow-sm'
                        : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="font-bold text-xs">{p.label}</div>
                    <div className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">{p.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Action */}
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 border-t border-slate-100 dark:border-slate-800">
              <span className="text-xs text-slate-400">
                Output: <strong className="text-purple-600 dark:text-purple-400 font-mono">.{format}</strong>
              </span>

              <Button
                size="lg"
                variant="primary"
                onClick={handleConvert}
                className="w-full sm:w-auto font-bold shadow-lg shadow-purple-500/20"
              >
                <Zap className="w-4 h-4 mr-2" />
                Convert to {format.toUpperCase()}
              </Button>
            </div>
          </Card>
        )}

        {isProcessing && (
          <ProcessingState
            statusText={`Converting video to ${format.toUpperCase()}...`}
            subText="FFmpeg is transcoding video and audio tracks with faststart streaming enabled."
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
                Conversion Completed!
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
      </div>
    </ToolLayout>
  );
}
