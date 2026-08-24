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
  Layers,
  TrendingDown,
  Shield,
  ArrowRight,
  Download,
  Sliders
} from 'lucide-react';

export function Tools() {
  const [filter, setFilter] = useState('all');

  const tools = [
    // Downloaders
    {
      title: 'Universal Downloader',
      desc: 'Download videos, Reels, Shorts, and MP3 audio from YouTube, Instagram, and Facebook.',
      path: ROUTES.HOME,
      category: 'download',
      categoryLabel: 'Download',
      icon: Download,
      badge: 'Multi-Engine',
      variant: 'brand',
      tag: 'Core'
    },
    {
      title: 'Batch URL Downloader',
      desc: 'Paste multiple links into a single queue. Process and download up to 5 items automatically.',
      path: ROUTES.TOOLS_BATCH,
      category: 'download',
      categoryLabel: 'Download',
      icon: Layers,
      badge: 'Batch Queue',
      variant: 'brand',
      tag: 'New'
    },

    // Video Tools
    {
      title: 'Video Format Converter',
      desc: 'Transcode local videos between MP4, WebM, and MOV with customizable quality presets.',
      path: ROUTES.TOOLS_CONVERTER,
      category: 'video',
      categoryLabel: 'Video',
      icon: Film,
      badge: 'Fast Transcode',
      variant: 'brand',
      tag: 'Popular'
    },
    {
      title: 'Video → Audio Extractor',
      desc: 'Extract studio-quality MP3, M4A, WAV, or OGG audio directly from your local video files.',
      path: ROUTES.TOOLS_VIDEO_TO_AUDIO,
      category: 'video',
      categoryLabel: 'Video',
      icon: Music,
      badge: 'High Bitrate',
      variant: 'success',
      tag: 'Popular'
    },
    {
      title: 'Video → Image Frames',
      desc: 'Extract first frame covers, specific timestamps, or frame interval sequences packaged into a ZIP.',
      path: ROUTES.TOOLS_VIDEO_TO_IMAGE,
      category: 'video',
      categoryLabel: 'Video',
      icon: ImageIcon,
      badge: 'ZIP Support',
      variant: 'brand',
      tag: 'New'
    },

    // Audio Tools
    {
      title: 'Audio Converter',
      desc: 'Convert audio files between MP3, M4A, WAV (lossless PCM), AAC, and OGG formats.',
      path: ROUTES.TOOLS_AUDIO_CONVERTER,
      category: 'audio',
      categoryLabel: 'Audio',
      icon: Music,
      badge: 'Studio Bitrates',
      variant: 'success',
      tag: 'New'
    },

    // Image Tools
    {
      title: 'Image Converter',
      desc: 'Convert photos and graphics between JPG, PNG, modern WebP, and ultra-compact AVIF.',
      path: ROUTES.TOOLS_IMAGE_CONVERT,
      category: 'image',
      categoryLabel: 'Image',
      icon: ImageIcon,
      badge: 'Next-Gen AVIF',
      variant: 'brand',
      tag: 'New'
    },
    {
      title: 'Image Compressor',
      desc: 'Reduce photo file sizes by up to 75% with instant before/after reduction metrics.',
      path: ROUTES.TOOLS_IMAGE_COMPRESS,
      category: 'image',
      categoryLabel: 'Image',
      icon: TrendingDown,
      badge: 'Sharp Engine',
      variant: 'success',
      tag: 'New'
    },
    {
      title: 'Image Resizer',
      desc: 'Resize pixel dimensions while strictly maintaining original aspect ratio with zero default upscaling.',
      path: ROUTES.TOOLS_IMAGE_RESIZE,
      category: 'image',
      categoryLabel: 'Image',
      icon: Sliders,
      badge: 'HD Presets',
      variant: 'brand',
      tag: 'New'
    },
    {
      title: 'HD Thumbnail Extractor',
      desc: 'Download maximum resolution official cover art from YouTube, Instagram, and Facebook.',
      path: ROUTES.TOOLS_THUMBNAIL,
      category: 'image',
      categoryLabel: 'Image',
      icon: ImageIcon,
      badge: 'Original HD',
      variant: 'youtube',
      tag: 'Utility'
    },

    // Utilities & Privacy
    {
      title: 'QR Mobile Transfer',
      desc: 'Beam converted media or downloads directly to your phone via single-use 10-minute QR code.',
      path: ROUTES.TOOLS_QR_TRANSFER,
      category: 'utility',
      categoryLabel: 'Utility',
      icon: Smartphone,
      badge: 'Stateless Token',
      variant: 'success',
      tag: 'Popular'
    },
    {
      title: 'Media Metadata Inspector',
      desc: 'Analyze video and audio streams for duration, codecs, frame rates, sample rates, and bitrates.',
      path: ROUTES.TOOLS_METADATA,
      category: 'utility',
      categoryLabel: 'Utility',
      icon: Info,
      badge: 'FFprobe Info',
      variant: 'brand',
      tag: 'Developer'
    },
    {
      title: 'Privacy Dashboard',
      desc: 'Explore our zero-database, zero-account, ephemeral processing architecture and cleanup guarantees.',
      path: ROUTES.PRIVACY,
      category: 'privacy',
      categoryLabel: 'Privacy',
      icon: Shield,
      badge: 'Stateless',
      variant: 'success',
      tag: 'Transparent'
    }
  ];

  const categories = [
    { key: 'all', label: 'All Tools' },
    { key: 'download', label: 'Downloaders' },
    { key: 'video', label: 'Video' },
    { key: 'audio', label: 'Audio' },
    { key: 'image', label: 'Image' },
    { key: 'utility', label: 'Utilities' },
    { key: 'privacy', label: 'Privacy' }
  ];

  const filteredTools = filter === 'all' ? tools : tools.filter((t) => t.category === filter);

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      <SEO
        title="Media Toolbox — InTube Universal Media Utilities"
        description="Comprehensive collection of video, audio, image converters, batch downloaders, frame extractors, and privacy tools."
      />

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center justify-center p-3 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-purple-600 text-white shadow-xl shadow-blue-500/20">
          <Wrench className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Universal Media Toolbox
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 max-w-xl mx-auto">
          Fast, stateless video transcoding, audio conversion, image optimization, batch queuing, and mobile transfer tools.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-center flex-wrap gap-2">
        {categories.map((c) => (
          <button
            key={c.key}
            type="button"
            onClick={() => setFilter(c.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              filter === c.key
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-105'
                : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800'
            }`}
          >
            {c.label}
          </button>
        ))}
      </div>

      {/* Tools Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredTools.map((t) => {
          const Icon = t.icon;
          return (
            <Card
              key={t.title}
              className="p-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl flex flex-col justify-between group hover:border-blue-500/50 dark:hover:border-blue-500/50 transition-all duration-200"
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="w-11 h-11 rounded-2xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Icon className="w-5 h-5" />
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Badge variant={t.variant} size="sm">
                      {t.badge}
                    </Badge>
                  </div>
                </div>

                <div>
                  <h3 className="font-extrabold text-base text-slate-900 dark:text-white group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {t.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-3">
                    {t.desc}
                  </p>
                </div>
              </div>

              <div className="pt-6">
                <Link to={t.path}>
                  <button
                    type="button"
                    className="w-full flex items-center justify-between px-4 py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800/80 hover:bg-blue-600 hover:text-white dark:hover:bg-blue-600 text-slate-700 dark:text-slate-200 text-xs font-bold transition-all group/btn"
                  >
                    <span>Launch Tool</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover/btn:translate-x-1 transition-transform" />
                  </button>
                </Link>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
