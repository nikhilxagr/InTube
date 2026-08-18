import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { Youtube as YoutubeIcon, Video, Zap, Music, ArrowRight } from 'lucide-react';

export function YouTube() {
  const tools = [
    {
      title: 'YouTube Video Downloader',
      path: ROUTES.YOUTUBE_VIDEO,
      desc: 'Download standard MP4 HD video streams in 1080p, 720p, or 480p quality.',
      icon: Video
    },
    {
      title: 'YouTube Shorts Downloader',
      path: ROUTES.YOUTUBE_SHORTS,
      desc: 'Extract vertical short-form video clips directly to your phone or desktop.',
      icon: Zap
    },
    {
      title: 'YouTube to MP3 Converter',
      path: ROUTES.YOUTUBE_MP3,
      desc: 'Extract high-fidelity MP3 and M4A audio tracks from authorized music and speeches.',
      icon: Music
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <SEO
        title="YouTube Downloader & MP3 Converter — Free & Fast"
        description="Stateless YouTube downloader for public videos, shorts, and high-quality MP3 audio tracks."
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-red-50 dark:bg-red-950/50 text-red-600 border border-red-200 dark:border-red-900 shadow-subtle">
          <YoutubeIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          YouTube Media Utility
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Analyze public YouTube videos, Shorts, and audio streams. Select your preferred resolution or transcode to high-quality audio.
        </p>
      </div>

      <Downloader
        defaultPlatform="YouTube"
        placeholder="Paste YouTube video or Shorts link (e.g. https://www.youtube.com/watch?v=...)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {tools.map((t) => (
          <Link key={t.path} to={t.path} className="focus:outline-none">
            <Card className="p-5 hover:border-red-500/50 hover:shadow-card transition-all h-full flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 flex items-center justify-center">
                  <t.icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-red-600 dark:group-hover:text-red-400 transition-colors">
                  {t.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
              <div className="mt-4 text-xs font-semibold text-red-600 dark:text-red-400 flex items-center gap-1">
                Open tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="font-bold text-base text-slate-900 dark:text-white">Supported YouTube Formats</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">Full HD & HD MP4</div>
            <p className="text-slate-500">1080p, 720p with synchronized audio streams.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">Shorts Vertical MP4</div>
            <p className="text-slate-500">9:16 aspect ratio vertical video clips.</p>
          </div>
          <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-1">
            <div className="font-bold text-slate-900 dark:text-white">High Quality MP3</div>
            <p className="text-slate-500">Extracted audio transcoded up to 320kbps.</p>
          </div>
        </div>
      </Card>
    </div>
  );
}
