import { useState } from 'react';
import { Image as ImageIcon, Search, Download, Clipboard, AlertCircle, Sparkles } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Badge } from '../../components/common/Badge.jsx';
import { Alert } from '../../components/common/Alert.jsx';
import { ToolsService } from '../../services/tools.service.js';

export function ThumbnailDownloader() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [thumbnailData, setThumbnailData] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [imgError, setImgError] = useState(false);

  const handleAnalyze = async (e) => {
    if (e) e.preventDefault();
    const trimmed = url.trim();

    if (!trimmed) {
      setErrorMessage('Please enter a media URL.');
      return;
    }

    setLoading(true);
    setErrorMessage('');
    setThumbnailData(null);
    setImgError(false);

    try {
      const res = await ToolsService.getThumbnail(trimmed);
      if (res.success && res.data?.thumbnail) {
        setThumbnailData(res.data);
      } else {
        throw new Error('Thumbnail unavailable for this media.');
      }
    } catch (err) {
      setErrorMessage(
        err.message || 'Unable to retrieve thumbnail. The media may be private or unavailable.'
      );
    } finally {
      setLoading(false);
    }
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setUrl(text);
        setErrorMessage('');
      }
    } catch {
      // Permission denied
    }
  };

  const handleDownloadImage = async (format = 'jpg') => {
    if (!thumbnailData?.thumbnail) return;

    try {
      const imgRes = await fetch(thumbnailData.thumbnail, { mode: 'cors' });
      const blob = await imgRes.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const safeTitle = (thumbnailData.title || 'thumbnail').replace(/[^a-zA-Z0-9_-]/g, '_').substring(0, 50);

      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `${safeTitle}_thumbnail.${format}`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch {
      // Fallback: direct window open if CORS restricts canvas/blob fetch
      window.open(thumbnailData.thumbnail, '_blank');
    }
  };

  return (
    <ToolLayout
      title="HD Thumbnail Downloader"
      description="Extract and download the highest-resolution official cover thumbnails from YouTube, Instagram, and Facebook."
      category="Media Utilities"
      badgeVariant="youtube"
      icon={ImageIcon}
      seoTitle="HD Video Thumbnail Downloader - YouTube, Instagram & Facebook"
      seoDescription="Download official full HD cover thumbnails from YouTube videos, Instagram Reels, and Facebook in JPG or PNG format."
    >
      <div className="space-y-6">
        {/* Input Form */}
        <div className="relative p-2.5 rounded-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 shadow-xl">
          <form onSubmit={handleAnalyze} className="space-y-2.5">
            <div className="relative flex flex-col sm:flex-row items-stretch gap-2">
              <div className="relative flex-1">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400">
                  <Search className="w-5 h-5" />
                </div>
                <input
                  type="url"
                  value={url}
                  onChange={(e) => {
                    setUrl(e.target.value);
                    if (errorMessage) setErrorMessage('');
                  }}
                  placeholder="Paste YouTube, Instagram, or Facebook URL here..."
                  className="w-full pl-11 pr-20 py-3.5 sm:py-4 bg-slate-100/80 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800/80 rounded-xl text-sm sm:text-base text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-purple-500/40"
                  disabled={loading}
                />
                {!url && (
                  <div className="absolute inset-y-0 right-0 pr-2.5 flex items-center">
                    <button
                      type="button"
                      onClick={handlePaste}
                      className="px-2.5 py-1.5 text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 hover:bg-blue-100 rounded-lg flex items-center gap-1 text-xs font-semibold"
                    >
                      <Clipboard className="w-3.5 h-3.5" />
                      <span>Paste</span>
                    </button>
                  </div>
                )}
              </div>

              <Button
                type="submit"
                variant="primary"
                disabled={!url.trim() || loading}
                isLoading={loading}
                className="px-6 py-3.5 sm:py-4 font-bold text-sm"
              >
                {loading ? 'Fetching...' : 'Analyze'}
              </Button>
            </div>

            <div className="text-xs text-slate-400 px-1 flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-purple-500" />
              <span>Retrieves the original maximum resolution image exposed by the platform.</span>
            </div>
          </form>
        </div>

        {errorMessage && (
          <Alert type="error" title="Notice" message={errorMessage}>
            <div className="mt-2">
              <Button size="sm" variant="outline" onClick={() => setErrorMessage('')} className="text-xs">
                Clear
              </Button>
            </div>
          </Alert>
        )}

        {thumbnailData && (
          <Card className="p-6 sm:p-8 space-y-6 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-xl">
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="space-y-1 min-w-0">
                <div className="flex items-center gap-2">
                  <Badge variant={thumbnailData.platform === 'youtube' ? 'youtube' : 'brand'}>
                    {thumbnailData.platform?.toUpperCase() || 'PUBLIC MEDIA'}
                  </Badge>
                  <span className="text-xs text-slate-400">High Definition</span>
                </div>
                <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white truncate max-w-xl">
                  {thumbnailData.title || 'Official Cover Image'}
                </h3>
              </div>
            </div>

            <div className="relative rounded-2xl overflow-hidden bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-xl max-w-2xl mx-auto group">
              {!imgError ? (
                <img
                  src={thumbnailData.thumbnail}
                  alt={thumbnailData.title || 'Media thumbnail preview'}
                  referrerPolicy="no-referrer"
                  crossOrigin="anonymous"
                  onError={() => setImgError(true)}
                  className="w-full h-auto object-contain max-h-[440px] mx-auto transition-transform duration-300 group-hover:scale-[1.01]"
                />
              ) : (
                <div className="p-12 text-center text-slate-400 space-y-2">
                  <AlertCircle className="w-8 h-8 text-amber-400 mx-auto" />
                  <p className="text-sm">Direct preview blocked by provider CDN.</p>
                </div>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
              <Button
                size="md"
                variant="primary"
                onClick={() => handleDownloadImage('jpg')}
                className="font-bold text-xs shadow-md shadow-purple-500/20"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download JPG
              </Button>

              <Button
                size="md"
                variant="outline"
                onClick={() => handleDownloadImage('png')}
                className="font-bold text-xs"
              >
                <Download className="w-4 h-4 mr-1.5" /> Download PNG
              </Button>
            </div>
          </Card>
        )}
      </div>
    </ToolLayout>
  );
}
