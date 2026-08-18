import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Zap, Smartphone, Sparkles } from 'lucide-react';

export function YouTubeShorts() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="YouTube Shorts Downloader — Vertical MP4 Videos"
        description="Fast, watermark-free downloader for public YouTube Shorts clips in native mobile vertical format."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-900 shadow-subtle">
          <Zap className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          YouTube Shorts Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Fast, direct download of vertical YouTube Shorts directly to your device.
        </p>
      </div>

      <Downloader
        defaultPlatform="YouTube Shorts"
        placeholder="Paste YouTube Shorts URL (e.g. https://www.youtube.com/shorts/...)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Smartphone className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3>Native 9:16 Aspect Ratio</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Downloads vertical videos in their original resolution, tailored for viewing on mobile devices without letterboxing.
          </p>
        </Card>

        <Card className="p-6 space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold">
            <Sparkles className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h3>Zero Re-Compression</h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Preserves original audio bitrate and visual clarity directly from the platform&apos;s public CDN.
          </p>
        </Card>
      </div>
    </div>
  );
}
