import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Video, Clapperboard, Music } from 'lucide-react';

// Facebook brand icon (SVG inline — not in lucide)
function FacebookIcon({ className = 'w-8 h-8' }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Facebook() {
  const features = [
    {
      title: 'Facebook Videos',
      desc: 'Download public Facebook videos in original HD quality directly from any page or profile.',
      icon: Video
    },
    {
      title: 'Facebook Reels',
      desc: 'Save Facebook Reels short clips to your device — supports fb.watch short links too.',
      icon: Clapperboard
    },
    {
      title: 'Audio Extraction',
      desc: 'Extract audio from any Facebook video and save it as a high-quality MP3 file.',
      icon: Music
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <SEO
        title="Facebook Video Downloader — Download FB Videos & Reels Free"
        description="Download public Facebook videos, Reels, and fb.watch links in HD quality. No login required for public posts."
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/50 text-blue-600 border border-blue-200 dark:border-blue-900 shadow-subtle">
          <FacebookIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Facebook Video Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Paste any public Facebook video, Reel, or fb.watch link below to analyze and download in the best available quality.
        </p>
      </div>

      <Downloader
        defaultPlatform="Facebook"
        placeholder="Paste Facebook video or Reel link (e.g. https://www.facebook.com/watch?v=...)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {features.map((f) => (
          <Card
            key={f.title}
            className="p-5 hover:border-blue-500/50 hover:shadow-card transition-all h-full flex flex-col gap-3"
          >
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 flex items-center justify-center shrink-0">
              <f.icon className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-bold text-sm text-slate-900 dark:text-white mb-1">{f.title}</h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white">Supported Facebook Content</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">Public Videos</div>
            <p className="text-slate-500">facebook.com/watch?v=… and /videos/ URLs from any public page or profile.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">Facebook Reels</div>
            <p className="text-slate-500">facebook.com/reel/… and fb.watch/… short links are fully supported.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">HD Quality</div>
            <p className="text-slate-500">Downloads the highest available resolution — typically 720p or 1080p for public videos.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">Private Videos</div>
            <p className="text-slate-500">Private posts and friend-only content require login and cannot be downloaded.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
