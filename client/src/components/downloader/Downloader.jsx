import { useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Search,
  Clipboard,
  X,
  ArrowRight,
  RefreshCw,
  AlertCircle,
  Sparkles,
  FileVideo,
  Music,
  Film,
  Info
} from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';
import { Alert } from '../common/Alert.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { MediaPreview } from '../media/MediaPreview.jsx';
import { MediaService } from '../../services/media.service.js';
import { DOWNLOADER_STATES } from '../../constants/downloader.js';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import { ROUTES } from '../../constants/routes.js';

export function Downloader({
  defaultPlatform = null,
  placeholder = 'Paste YouTube, Instagram or Facebook link here (or drop a video file)...'
}) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState(DOWNLOADER_STATES.IDLE);
  const [mediaData, setMediaData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [validationHint, setValidationHint] = useState('');
  const [downloadProgress, setDownloadProgress] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [droppedLocalFile, setDroppedLocalFile] = useState(null);
  const [isDragOver, setIsDragOver] = useState(false);

  const validateInputLocally = useCallback((input) => {
    const trimmed = input.trim();
    if (!trimmed) {
      setValidationHint('');
      return;
    }

    try {
      const parsed = new URL(trimmed);
      if (!['http:', 'https:'].includes(parsed.protocol)) {
        setValidationHint('Please enter a valid URL starting with https://');
        return;
      }

      const host = parsed.hostname.toLowerCase();
      const isYT = host.includes('youtube.com') || host.includes('youtu.be');
      const isIG = host.includes('instagram.com') || host.includes('instagr.am');
      const isFB = host.includes('facebook.com') || host.includes('fb.watch') || host.includes('fb.com');

      if (!isYT && !isIG && !isFB) {
        setValidationHint('Note: InTube supports public YouTube, Instagram, and Facebook links.');
      } else {
        setValidationHint('');
      }
    } catch {
      if (trimmed.length > 5 && !trimmed.startsWith('http')) {
        setValidationHint('Make sure to include https://');
      } else {
        setValidationHint('');
      }
    }
  }, []);

  const handleInputChange = (e) => {
    const val = e.target.value;
    setUrl(val);
    validateInputLocally(val);

    if (state === DOWNLOADER_STATES.ERROR) {
      setState(DOWNLOADER_STATES.IDLE);
      setErrorMessage('');
    }
  };

  const handlePasteText = useCallback((text) => {
    if (text) {
      setUrl(text);
      validateInputLocally(text);
      setDroppedLocalFile(null);
      if (state === DOWNLOADER_STATES.ERROR) {
        setState(DOWNLOADER_STATES.IDLE);
        setErrorMessage('');
      }
    }
  }, [validateInputLocally, state]);

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      handlePasteText(text);
    } catch {
      // Clipboard access denied
    }
  };

  const handleClear = useCallback(() => {
    setUrl('');
    setState(DOWNLOADER_STATES.IDLE);
    setMediaData(null);
    setErrorMessage('');
    setSuccessMessage('');
    setSelectedFormat(null);
    setValidationHint('');
    setDownloadProgress(null);
    setCountdown(null);
    setDroppedLocalFile(null);
  }, []);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    const trimmedUrl = url.trim();

    if (!trimmedUrl) {
      setErrorMessage('Please enter a media URL.');
      setState(DOWNLOADER_STATES.ERROR);
      return;
    }

    setState(DOWNLOADER_STATES.ANALYZING);
    setErrorMessage('');
    setSuccessMessage('');
    setMediaData(null);
    setDownloadProgress(null);
    setCountdown(null);
    setDroppedLocalFile(null);

    try {
      const res = await MediaService.analyze(trimmedUrl);
      if (res.success && res.data) {
        setMediaData(res.data);
        if (res.data.formats && res.data.formats.length > 0) {
          setSelectedFormat(res.data.formats[0]);
        }
        setState(DOWNLOADER_STATES.READY);
      } else {
        throw new Error(res.error?.message || 'Failed to retrieve media information from provider.');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to analyze the media URL. Please ensure the link is public and accessible.'
      );
      setState(DOWNLOADER_STATES.ERROR);
    }
  };

  // Global Keyboard Shortcuts
  useKeyboardShortcuts({
    onPasteUrl: (pasted) => handlePasteText(pasted),
    onEscape: () => handleClear(),
    onPrimaryAction: () => {
      if (state === DOWNLOADER_STATES.IDLE && url.trim()) {
        handleAnalyze();
      } else if (state === DOWNLOADER_STATES.READY && selectedFormat) {
        handleDownload(selectedFormat);
      }
    }
  });

  // Local File Drop Handlers
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setDroppedLocalFile({
        name: file.name,
        sizeMB: (file.size / (1024 * 1024)).toFixed(1),
        type: file.type || 'video/media'
      });
      setUrl('');
      setMediaData(null);
      setState(DOWNLOADER_STATES.IDLE);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  };

  const handleDownload = async (format) => {
    if (!mediaData || !format) return;

    setState(DOWNLOADER_STATES.PROCESSING);
    setErrorMessage('');
    setSuccessMessage('');
    setDownloadProgress(null);
    setCountdown(10);

    let isCountingDown = true;
    let countdownVal = 10;

    const countdownInterval = setInterval(() => {
      if (!isCountingDown) {
        clearInterval(countdownInterval);
        return;
      }
      countdownVal -= 1;
      if (countdownVal <= 0) {
        isCountingDown = false;
        clearInterval(countdownInterval);
        setCountdown(null);
      } else {
        setCountdown(countdownVal);
      }
    }, 1000);

    try {
      const result = await MediaService.download(
        {
          url: mediaData.url || url.trim(),
          formatId: format.formatId,
          container: format.container || 'mp4',
          type: format.type || 'video'
        },
        (progress) => {
          if (isCountingDown && ((progress?.percent && progress.percent >= 1) || progress?.status === 'downloading')) {
            isCountingDown = false;
            clearInterval(countdownInterval);
            setCountdown(null);
          }
          setDownloadProgress(progress);
        }
      );

      setSuccessMessage(`Downloaded "${result.filename}" successfully!`);
    } catch (err) {
      setErrorMessage(
        err.message || 'Download processing failed. The media may be restricted or temporarily unavailable.'
      );
    } finally {
      isCountingDown = false;
      clearInterval(countdownInterval);
      setState(DOWNLOADER_STATES.READY);
      setDownloadProgress(null);
      setCountdown(null);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      {/* Search & Drop Container */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative p-2 sm:p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border transition-all ${
          isDragOver
            ? 'border-purple-500 ring-4 ring-purple-500/30 shadow-2xl scale-[1.01]'
            : 'border-slate-200/80 dark:border-slate-800/80 shadow-2xl shadow-blue-500/5 dark:shadow-blue-500/10 ring-1 ring-slate-900/5 dark:ring-white/10'
        }`}
      >
        <form onSubmit={handleAnalyze} className="space-y-2.5" noValidate>
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Search className="w-5 h-5" aria-hidden="true" />
              </div>
              <input
                type="url"
                id="media-url-input"
                name="mediaUrl"
                value={url}
                onChange={handleInputChange}
                placeholder={placeholder}
                aria-label="Media URL input"
                autoComplete="off"
                spellCheck="false"
                className="w-full pl-11 pr-24 py-3.5 sm:py-4 bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-purple-500/40 focus:border-purple-500 transition-all shadow-inner"
                disabled={state === DOWNLOADER_STATES.ANALYZING || state === DOWNLOADER_STATES.PROCESSING}
              />
              <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center gap-1.5">
                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear input (Esc)"
                    aria-label="Clear input"
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800/60 rounded-lg transition-all"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Paste from clipboard (Ctrl+V)"
                    aria-label="Paste from clipboard"
                    className="px-2.5 py-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 dark:hover:bg-blue-900/60 border border-blue-200/60 dark:border-blue-800/60 rounded-lg flex items-center gap-1.5 text-xs font-semibold transition-all shadow-sm"
                  >
                    <Clipboard className="w-3.5 h-3.5" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                )}
              </div>
            </div>

            <button
              type="submit"
              disabled={!url.trim() || state === DOWNLOADER_STATES.ANALYZING || state === DOWNLOADER_STATES.PROCESSING}
              className="px-6 py-3.5 sm:py-4 rounded-xl text-white font-bold text-sm sm:text-base shadow-lg active:scale-[0.98] transition-all flex items-center justify-center gap-2 shrink-0 disabled:opacity-50 disabled:pointer-events-none disabled:shadow-none"
              style={{ background: 'linear-gradient(135deg, #ef4444, #ec4899, #a855f7, #6366f1, #3b82f6)', backgroundSize: '200% 200%' }}
            >
              {state === DOWNLOADER_STATES.ANALYZING ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Analyzing...</span>
                </>
              ) : (
                <>
                  <span>Analyze</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-between text-xs px-1 min-h-[18px]">
            {validationHint ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1 font-medium">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationHint}
              </span>
            ) : defaultPlatform ? (
              <span className="text-slate-500 dark:text-slate-400">
                Targeting: <strong className="font-semibold text-blue-600 dark:text-blue-400">{defaultPlatform}</strong>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500 flex items-center gap-1.5">
                <Sparkles className="w-3 h-3 text-purple-500 opacity-80" />
                Supports YouTube, Instagram Reels &amp; Posts, and Facebook Videos (or drag local file).
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Smart Local File Dropped Detection */}
      {droppedLocalFile && (
        <Card className="p-5 sm:p-6 space-y-4 border border-purple-500/40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-xl rounded-2xl animate-fadeIn">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                <FileVideo className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
                  Local Media File Detected
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  <strong className="text-purple-600 dark:text-purple-400">{droppedLocalFile.name}</strong> ({droppedLocalFile.sizeMB} MB)
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => setDroppedLocalFile(null)}
              className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-600 dark:text-slate-300">
            This is a local media file on your computer. Choose an action from our Media Toolbox:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
            <Link to={ROUTES.TOOLS_VIDEO_TO_AUDIO}>
              <Button size="sm" variant="outline" className="w-full text-xs font-bold justify-center">
                <Music className="w-3.5 h-3.5 mr-1.5 text-pink-500" /> Extract Audio (MP3)
              </Button>
            </Link>

            <Link to={ROUTES.TOOLS_CONVERTER}>
              <Button size="sm" variant="outline" className="w-full text-xs font-bold justify-center">
                <Film className="w-3.5 h-3.5 mr-1.5 text-purple-500" /> Convert Format
              </Button>
            </Link>

            <Link to={ROUTES.TOOLS_METADATA}>
              <Button size="sm" variant="outline" className="w-full text-xs font-bold justify-center">
                <Info className="w-3.5 h-3.5 mr-1.5 text-blue-500" /> View Metadata
              </Button>
            </Link>
          </div>
        </Card>
      )}

      {successMessage && (
        <Alert
          type="success"
          title="Download Complete"
          message={successMessage}
        />
      )}

      {state === DOWNLOADER_STATES.ANALYZING && (
        <Card className="p-6 space-y-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shadow-xl">
          <div className="flex flex-col sm:flex-row gap-5 items-start">
            <Skeleton className="w-full sm:w-48 aspect-video rounded-xl shrink-0" />
            <div className="flex-1 space-y-3 w-full">
              <Skeleton className="h-5 w-24 rounded" />
              <Skeleton className="h-6 w-3/4 rounded" />
              <Skeleton className="h-4 w-1/2 rounded" />
            </div>
          </div>
          <div className="space-y-3 pt-2">
            <Skeleton className="h-4 w-32 rounded" />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              <Skeleton className="h-14 rounded-xl" />
              <Skeleton className="h-14 rounded-xl" />
            </div>
          </div>
        </Card>
      )}

      {errorMessage && (
        <Alert
          type="error"
          title="Operation Notice"
          message={errorMessage}
        >
          <div className="mt-3 flex flex-wrap items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              type="button"
              onClick={(e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                handleAnalyze();
              }}
              isLoading={state === DOWNLOADER_STATES.ANALYZING}
              disabled={state === DOWNLOADER_STATES.ANALYZING || !url.trim()}
              className="text-xs border-red-300/70 dark:border-red-700/60 text-red-700 dark:text-red-300 bg-white/60 dark:bg-slate-900/60 hover:bg-red-50 dark:hover:bg-red-950/60 shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Retry Analysis
            </Button>
            <Button
              size="sm"
              variant="ghost"
              type="button"
              onClick={(e) => {
                if (e) {
                  e.preventDefault();
                  e.stopPropagation();
                }
                handleClear();
              }}
              className="text-xs text-red-600/90 dark:text-red-400 hover:bg-red-100/40 dark:hover:bg-red-950/50 hover:text-red-800 dark:hover:text-red-200"
            >
              Clear
            </Button>
          </div>
        </Alert>
      )}

      {(state === DOWNLOADER_STATES.READY || state === DOWNLOADER_STATES.PROCESSING) && mediaData && (
        <MediaPreview
          media={mediaData}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          onReset={handleClear}
          onDownload={handleDownload}
          isDownloading={state === DOWNLOADER_STATES.PROCESSING}
          downloadProgress={downloadProgress}
          countdown={countdown}
        />
      )}
    </div>
  );
}
