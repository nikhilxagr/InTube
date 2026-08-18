import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Image as ImageIcon } from 'lucide-react';

export function Posts() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="Instagram Posts Downloader — Photos & Carousels"
        description="Download public Instagram single photos, carousel albums, and video posts in original resolution."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 border border-pink-200 dark:border-pink-900 shadow-subtle">
          <ImageIcon className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Instagram Posts & Photos
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Download high-resolution image and video posts from public Instagram profiles.
        </p>
      </div>

      <Downloader
        defaultPlatform="Instagram Posts"
        placeholder="Paste Instagram Post link (e.g. https://www.instagram.com/p/C3abc123/)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Card className="p-6 space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Carousel Albums</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Multi-photo posts are analyzed and displayed with direct download streams for each slide in the carousel.
          </p>
        </Card>

        <Card className="p-6 space-y-2">
          <h2 className="font-bold text-base text-slate-900 dark:text-white">Original Quality</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Preserves full dimensions without aggressive re-compression or added metadata watermarks.
          </p>
        </Card>
      </div>
    </div>
  );
}
