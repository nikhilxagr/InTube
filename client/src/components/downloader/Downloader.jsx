import { useState, useCallback } from 'react';
import { Search, Clipboard, X, ArrowRight, RefreshCw, AlertCircle } from 'lucide-react';
import { Button } from '../common/Button.jsx';
import { Card } from '../common/Card.jsx';
import { Alert } from '../common/Alert.jsx';
import { Skeleton } from '../common/Skeleton.jsx';
import { MediaPreview } from '../media/MediaPreview.jsx';
import { MediaService } from '../../services/media.service.js';
import { DOWNLOADER_STATES } from '../../constants/downloader.js';

export function Downloader({
  defaultPlatform = null,
  placeholder = 'Paste YouTube or Instagram public link here...'
}) {
  const [url, setUrl] = useState('');
  const [state, setState] = useState(DOWNLOADER_STATES.IDLE);
  const [mediaData, setMediaData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedFormat, setSelectedFormat] = useState(null);
  const [validationHint, setValidationHint] = useState('');

  // Quick client-side sanity check
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

      if (!isYT && !isIG) {
        setValidationHint('Note: InTube supports public YouTube and Instagram links.');
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

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        validateInputLocally(text);
      }
    } catch {
      // Browser clipboard permission denied or not supported
    }
  };

  const handleClear = () => {
    setUrl('');
    setState(DOWNLOADER_STATES.IDLE);
    setMediaData(null);
    setErrorMessage('');
    setSelectedFormat(null);
    setValidationHint('');
  };

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
    setMediaData(null);

    try {
      const res = await MediaService.analyze(trimmedUrl);
      if (res.success && res.data) {
        setMediaData(res.data);
        // Pre-select first available format if any
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

  return (
    <div className="w-full max-w-3xl mx-auto space-y-6">
      <Card className="p-4 sm:p-6 shadow-card">
        <form onSubmit={handleAnalyze} className="space-y-3" noValidate>
          <div className="relative flex flex-col sm:flex-row items-stretch gap-2.5">
            {/* Input field */}
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
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
                className="w-full pl-10 pr-20 py-3.5 bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-all"
                disabled={state === DOWNLOADER_STATES.ANALYZING || state === DOWNLOADER_STATES.PROCESSING}
              />
              {/* Paste / Clear Actions */}
              <div className="absolute inset-y-0 right-0 pr-2 flex items-center gap-1">
                {url ? (
                  <button
                    type="button"
                    onClick={handleClear}
                    title="Clear input"
                    aria-label="Clear input"
                    className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handlePaste}
                    title="Paste from clipboard"
                    aria-label="Paste from clipboard"
                    className="p-1.5 text-slate-500 hover:text-brand-600 dark:hover:text-brand-400 rounded-lg flex items-center gap-1 text-xs font-medium transition-colors"
                  >
                    <Clipboard className="w-4 h-4" />
                    <span className="hidden sm:inline">Paste</span>
                  </button>
                )}
              </div>
            </div>

            {/* Analyze Button */}
            <Button
              type="submit"
              size="lg"
              variant="primary"
              isLoading={state === DOWNLOADER_STATES.ANALYZING}
              disabled={!url.trim() || state === DOWNLOADER_STATES.ANALYZING}
              className="sm:w-36 font-semibold"
            >
              <span>Analyze</span>
              {state !== DOWNLOADER_STATES.ANALYZING && <ArrowRight className="w-4 h-4" />}
            </Button>
          </div>

          {/* Validation helper or platform targeting tag */}
          <div className="flex items-center justify-between text-xs min-h-[18px]">
            {validationHint ? (
              <span className="text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <AlertCircle className="w-3.5 h-3.5" />
                {validationHint}
              </span>
            ) : defaultPlatform ? (
              <span className="text-slate-500 dark:text-slate-400">
                Targeting: <strong className="font-semibold text-brand-600 dark:text-brand-400">{defaultPlatform}</strong>
              </span>
            ) : (
              <span className="text-slate-400 dark:text-slate-500">
                Supports public YouTube videos, Shorts, Instagram Reels, & Posts.
              </span>
            )}
          </div>
        </form>
      </Card>

      {/* Loading Skeleton */}
      {state === DOWNLOADER_STATES.ANALYZING && (
        <Card className="p-6 space-y-6">
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

      {/* Error state alert */}
      {state === DOWNLOADER_STATES.ERROR && (
        <Alert
          type="error"
          title="Unable to Analyze Media"
          message={errorMessage}
        >
          <div className="mt-3 flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleAnalyze}
              className="text-xs"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1" />
              Retry Analysis
            </Button>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleClear}
              className="text-xs text-slate-600 dark:text-slate-300"
            >
              Clear
            </Button>
          </div>
        </Alert>
      )}

      {/* Ready / Media Preview state */}
      {state === DOWNLOADER_STATES.READY && mediaData && (
        <MediaPreview
          media={mediaData}
          selectedFormat={selectedFormat}
          onSelectFormat={setSelectedFormat}
          onReset={handleClear}
        />
      )}
    </div>
  );
}
