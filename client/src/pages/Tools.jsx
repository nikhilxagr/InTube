import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ROUTES } from '../constants/routes.js';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { SEO } from '../components/common/SEO.jsx';
import {
  Wrench,
  Music,
  Film,
  Image as ImageIcon,
  Info,
  Smartphone,
  Video,
  Zap,
  ArrowRight,
  Download
} from 'lucide-react';

export function Tools() {
  const [filter, setFilter] = useState('all');

  const tools = [
    // Converters
    {
      title: 'Video → Audio Converter',
      desc: 'Extract studio-quality MP3, M4A, WAV, or OGG audio directly from your local video files.',
      path: ROUTES.TOOLS_VIDEO_TO_AUDIO,
      category: 'converters',
      categoryLabel: 'Converters',
      icon: Music,
      badge: 'Local FFmpeg',
      variant: 'success',
      tag: 'New'
    },
    {
      title: 'Video Format Converter',
      desc: 'Convert local videos between MP4, WebM, and MOV with customizable encoding presets.',
      path: ROUTES.TOOLS_CONVERTER,
      category: 'converters',
      categoryLabel: 'Converters',
      icon: Film,
      badge: 'Fast Transcode',
      variant: 'brand',
      tag: 'New'
    },
    // Media Utilities
    {
      title: 'HD Thumbnail Downloader',
      desc: 'Retrieve and save the highest-resolution official cover images from YouTube, Instagram, and Facebook.',
      path: ROUTES.TOOLS_THUMBNAIL,
      category: 'utilities',
      categoryLabel: 'Utilities',
      icon: ImageIcon,
      badge: 'Official Covers',
      variant: 'youtube',
      tag: 'New'
    },
    {
      title: 'Media Metadata Inspector',
      desc: 'Inspect codecs, resolution, bitrate, fps, and stream specifications from local audio and video files.',
      path: ROUTES.TOOLS_METADATA,
      category: 'utilities',
      categoryLabel: 'Utilities',
      icon: Info,
      badge: 'Deep Inspection',
      variant: 'secondary',
      tag: 'New'
    },
    // Transfer
    {
      title: 'QR Mobile Transfer',
      desc: 'Wirelessly beam converted files and downloads directly to your smartphone with temporary QR codes.',
      path: ROUTES.TOOLS_QR_TRANSFER,
      category: 'transfer',
      categoryLabel: 'Transfer',
      icon: Smartphone,
      badge: 'Zero Cable',
      variant: 'secondary',
      tag: 'New'
    },
    // Downloaders
    {
      title: 'Universal URL Downloader',
      desc: 'Analyze and download video and audio from public YouTube, Instagram, and Facebook links.',
      path: ROUTES.HOME,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: Download,
      badge: 'Universal',
      variant: 'brand'
    },
    {
      title: 'YouTube Video Downloader',
      desc: 'Download 1080p, 720p, and 480p videos with audio from public YouTube links.',
      path: ROUTES.YOUTUBE_VIDEO,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: Video,
      badge: 'YouTube',
      variant: 'youtube'
    },
    {
      title: 'YouTube Shorts Downloader',
      desc: 'Save viral and vertical short-form videos directly in MP4 format.',
      path: ROUTES.YOUTUBE_SHORTS,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: Zap,
      badge: 'Shorts',
      variant: 'youtube'
    },
    {
      title: 'YouTube to MP3',
      desc: 'Extract clean audio tracks and convert public videos to 320kbps MP3 or M4A.',
      path: ROUTES.YOUTUBE_MP3,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: Music,
      badge: 'Audio',
      variant: 'success'
    },
    {
      title: 'Instagram Reels Downloader',
      desc: 'Download public Instagram Reels with original high-definition video and audio.',
      path: ROUTES.INSTAGRAM_REELS,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: Film,
      badge: 'Instagram',
      variant: 'instagram'
    },
    {
      title: 'Instagram Stories & Posts',
      desc: 'Extract photo carousels, single photos, and video posts from public profiles.',
      path: ROUTES.INSTAGRAM_POSTS,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: ImageIcon,
      badge: 'Instagram',
      variant: 'instagram'
    },
    {
      title: 'Facebook Video Downloader',
      desc: 'Save public Facebook reels and videos in HD and SD MP4 formats.',
      path: ROUTES.FACEBOOK,
      category: 'downloaders',
      categoryLabel: 'Downloaders',
      icon: Video,
      badge: 'Facebook',
      variant: 'facebook'
    }
  ];

  const categories = [
    { id: 'all', label: 'All Media Tools' },
    { id: 'converters', label: 'Converters' },
    { id: 'utilities', label: 'Media Utilities' },
    { id: 'transfer', label: 'QR Transfer' },
    { id: 'downloaders', label: 'URL Downloaders' }
  ];

  const filteredTools = filter === 'all'
    ? tools
    : tools.filter((t) => t.category === filter);

  return (
    <div className="space-y-10 max-w-6xl mx-auto">
      <SEO
        title="Universal Media Toolbox - All Converters, Extractors & Utilities"
        description="Comprehensive media toolbox: Video to Audio, Video Format Converter, HD Thumbnail Downloader, Metadata Inspector, and QR Transfer."
      />

      {/* Header */}
      <div className="text-center space-y-3.5">
        <div className="inline-flex p-3 rounded-2xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200 dark:border-purple-800 shadow-md">
          <Wrench className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Universal Media Toolbox
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          High-performance media utilities for downloading, converting, inspecting, and transferring video and audio streams seamlessly.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {categories.map((cat) => (
          <button
            key={cat.id}
            type="button"
            onClick={() => setFilter(cat.id)}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              filter === cat.id
                ? 'bg-purple-600 text-white shadow-md shadow-purple-500/20'
                : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((tool) => (
          <Link key={tool.path + tool.title} to={tool.path} className="focus:outline-none flex">
            <Card className="p-6 hover:border-purple-500/50 hover:shadow-2xl transition-all h-full flex flex-col justify-between group w-full bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border border-slate-200/80 dark:border-slate-800/80 rounded-2xl">
              <div className="space-y-3.5">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-200 group-hover:bg-purple-50 dark:group-hover:bg-purple-950/60 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors shadow-sm">
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    {tool.tag && (
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-pink-500/10 text-pink-600 dark:text-pink-400 border border-pink-500/20">
                        {tool.tag}
                      </span>
                    )}
                    <Badge size="sm" variant={tool.variant}>
                      {tool.badge}
                    </Badge>
                  </div>
                </div>

                <h2 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors">
                  {tool.title}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {tool.desc}
                </p>
              </div>

              <div className="mt-5 pt-3.5 border-t border-slate-100 dark:border-slate-800/80 text-xs font-bold text-purple-600 dark:text-purple-400 flex items-center justify-between">
                <span>Open Tool</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
