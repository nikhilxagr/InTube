import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Video, Film, Eye, Image, Music, Zap, ArrowRight, Wrench } from 'lucide-react';

export function Tools() {
  const [filter, setFilter] = useState('all'); // 'all' | 'youtube' | 'instagram' | 'audio'

  const allTools = [
    {
      title: 'YouTube Video Downloader',
      desc: 'Download original MP4 1080p, 720p, and 480p videos from public YouTube links.',
      path: ROUTES.YOUTUBE_VIDEO,
      platform: 'YouTube',
      category: 'youtube',
      icon: Video,
      variant: 'youtube'
    },
    {
      title: 'YouTube Shorts Downloader',
      desc: 'Save viral and public YouTube vertical short-form videos directly in MP4.',
      path: ROUTES.YOUTUBE_SHORTS,
      platform: 'YouTube',
      category: 'youtube',
      icon: Zap,
      variant: 'youtube'
    },
    {
      title: 'YouTube to MP3 Converter',
      desc: 'Extract clean audio tracks and convert public videos to MP3 or M4A.',
      path: ROUTES.YOUTUBE_MP3,
      platform: 'Audio',
      category: 'audio',
      icon: Music,
      variant: 'success'
    },
    {
      title: 'Instagram Reels Downloader',
      desc: 'Download public Instagram Reels with original audio and video quality.',
      path: ROUTES.INSTAGRAM_REELS,
      platform: 'Instagram',
      category: 'instagram',
      icon: Film,
      variant: 'instagram'
    },
    {
      title: 'Instagram Stories Downloader',
      desc: 'Save public Instagram Stories before the 24-hour expiration window.',
      path: ROUTES.INSTAGRAM_STORIES,
      platform: 'Instagram',
      category: 'instagram',
      icon: Eye,
      variant: 'instagram'
    },
    {
      title: 'Instagram Posts & Photos',
      desc: 'Extract photo albums, carousels, and video posts from public profiles.',
      path: ROUTES.INSTAGRAM_POSTS,
      platform: 'Instagram',
      category: 'instagram',
      icon: Image,
      variant: 'instagram'
    }
  ];

  const filteredTools = filter === 'all'
    ? allTools
    : allTools.filter((t) => t.category === filter);

  return (
    <div className="space-y-10 max-w-5xl mx-auto">
      <SEO
        title="All Media Downloader Tools & Converters"
        description="Browse all supported public media extractors and utilities for YouTube and Instagram video, reels, and MP3 audio."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 shadow-subtle">
          <Wrench className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          All Media Utilities & Tools
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Explore our suite of specialized extractors and converters for supported public video and audio platforms.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {[
          { id: 'all', label: 'All Tools' },
          { id: 'youtube', label: 'YouTube' },
          { id: 'instagram', label: 'Instagram' },
          { id: 'audio', label: 'Audio / MP3' }
        ].map((tab) => (
          <button
            key={tab.id}
            type="button"
            onClick={() => setFilter(tab.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === tab.id
                ? 'bg-brand-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <Link key={tool.path} to={tool.path} className="focus:outline-none">
            <Card className="p-6 hover:border-brand-500/50 hover:shadow-card transition-all h-full flex flex-col justify-between group">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-brand-50 dark:group-hover:bg-brand-950/60 group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <Badge size="sm" variant={tool.variant}>
                    {tool.platform}
                  </Badge>
                </div>
                <h2 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 text-xs font-semibold text-brand-600 dark:text-brand-400 flex items-center gap-1">
                Open Utility <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
