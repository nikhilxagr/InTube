import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { Instagram as InstagramIcon, Film, Image, Eye, ArrowRight, ShieldCheck } from 'lucide-react';

export function Instagram() {
  const tools = [
    {
      title: 'Instagram Reels Downloader',
      path: ROUTES.INSTAGRAM_REELS,
      desc: 'Save public vertical Instagram Reels directly in high-definition MP4 format.',
      icon: Film
    },
    {
      title: 'Instagram Stories Downloader',
      path: ROUTES.INSTAGRAM_STORIES,
      desc: 'Download active public story videos and images before 24-hour expiration.',
      icon: Eye
    },
    {
      title: 'Instagram Posts & Photos',
      path: ROUTES.INSTAGRAM_POSTS,
      desc: 'Extract multi-image carousels and high-res single photo posts from public profiles.',
      icon: Image
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <SEO
        title="Instagram Downloader — Reels, Stories & Posts"
        description="Fast, anonymous downloader for public Instagram Reels, Stories, and photo posts in original high quality."
      />

      <div className="text-center space-y-4">
        <div className="inline-flex p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 border border-pink-200 dark:border-pink-900 shadow-subtle">
          <InstagramIcon className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Instagram Media Utility
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Paste any public Instagram post, Reel, or Story link below to analyze and download verified video or image streams.
        </p>
      </div>

      <Downloader
        defaultPlatform="Instagram"
        placeholder="Paste Instagram Reel, Story, or Post URL (e.g. https://www.instagram.com/reel/...)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        {tools.map((t) => (
          <Link key={t.path} to={t.path} className="focus:outline-none">
            <Card className="p-5 hover:border-pink-500/50 hover:shadow-card transition-all h-full flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="w-9 h-9 rounded-xl bg-pink-50 dark:bg-pink-950/40 text-pink-600 flex items-center justify-center">
                  <t.icon className="w-5 h-5" />
                </div>
                <h2 className="font-bold text-sm text-slate-900 dark:text-white group-hover:text-pink-600 dark:group-hover:text-pink-400 transition-colors">
                  {t.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{t.desc}</p>
              </div>
              <div className="mt-4 text-xs font-semibold text-pink-600 dark:text-pink-400 flex items-center gap-1">
                Open tool <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>

      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
          <ShieldCheck className="w-5 h-5 text-emerald-500" />
          <span>Public Content Policy</span>
        </div>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          InTube only analyzes and processes content from publicly accessible Instagram profiles.
          We do not ask for login cookies, password credentials, or attempt to circumvent private account protections.
        </p>
      </Card>
    </div>
  );
}
