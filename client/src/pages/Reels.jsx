import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Film, CheckCircle2 } from 'lucide-react';

export function Reels() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="Instagram Reels Downloader — Save Public Reels in MP4"
        description="Download public Instagram Reels videos in high definition MP4 with crystal-clear audio and zero watermarks."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 border border-pink-200 dark:border-pink-900 shadow-subtle">
          <Film className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Instagram Reels Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Download high-quality MP4 video from any public Instagram Reel with original audio fidelity.
        </p>
      </div>

      <Downloader
        defaultPlatform="Instagram Reels"
        placeholder="Paste Instagram Reel link (e.g. https://www.instagram.com/reel/C3abc123/)"
      />

      <Card className="p-6 sm:p-8 space-y-6">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">How to Download Instagram Reels</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">1. Copy Reel URL</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                In the Instagram app or browser, tap the Share icon and click &quot;Copy Link&quot;.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">2. Paste & Analyze</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Paste the URL into the search box above and click &quot;Analyze&quot;.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">3. Review Details</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Verify the Reel thumbnail, creator username, and available video resolution.
              </p>
            </div>
          </div>

          <div className="flex gap-3 items-start">
            <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
            <div className="space-y-1">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white">4. Save File</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Click Download to save the MP4 video directly to your device storage.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
