import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Video, CheckCircle2 } from 'lucide-react';

export function YouTubeVideo() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="YouTube Video Downloader — 1080p, 720p & 480p MP4"
        description="Download public YouTube videos in original 1080p Full HD, 720p HD, and 480p standard definition MP4 formats."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-900 shadow-subtle">
          <Video className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          YouTube Video Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Download public YouTube videos in original 1080p, 720p, or 480p MP4 formats with synchronized audio.
        </p>
      </div>

      <Downloader
        defaultPlatform="YouTube Video"
        placeholder="Paste YouTube video link (e.g. https://www.youtube.com/watch?v=dQw4w9WgXcQ)"
      />

      <Card className="p-6 sm:p-8 space-y-6">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Step-by-Step Instructions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">1. Copy Link</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Copy the URL of any public YouTube video from your address bar or the Share menu.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">2. Paste & Analyze</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste the URL into InTube and click &quot;Analyze&quot; to inspect available stream resolutions.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">3. Pick Resolution</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Select 1080p Full HD, 720p HD, or 480p standard MP4 from the authentic format list.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">4. Download</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Receive the clean video file directly. Ephemeral processing files are deleted immediately.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
