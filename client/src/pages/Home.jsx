import { Link } from 'react-router-dom';
import { Downloader } from '../components/downloader/Downloader.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Card } from '../components/common/Card.jsx';
import { Badge } from '../components/common/Badge.jsx';
import { ROUTES } from '../constants/routes.js';
import {
  Youtube,
  Instagram,
  ShieldCheck,
  Zap,
  Lock,
  Trash2,
  SlidersHorizontal,
  ArrowRight,
  HelpCircle,
  FileCheck2,
  Sparkles
} from 'lucide-react';

export function Home() {
  const popularTools = [
    {
      title: 'YouTube Video',
      desc: 'Extract MP4 high definition streams (1080p, 720p, 480p) from public YouTube videos.',
      link: ROUTES.YOUTUBE_VIDEO,
      badge: 'YouTube',
      variant: 'youtube'
    },
    {
      title: 'YouTube Shorts',
      desc: 'Fast, direct download of public vertical short-form video clips.',
      link: ROUTES.YOUTUBE_SHORTS,
      badge: 'YouTube',
      variant: 'youtube'
    },
    {
      title: 'YouTube to MP3',
      desc: 'Convert authorized video soundtracks to high-bitrate MP3 & M4A audio.',
      link: ROUTES.YOUTUBE_MP3,
      badge: 'Audio',
      variant: 'success'
    },
    {
      title: 'Instagram Reels',
      desc: 'Save public Instagram Reels with original audio and video clarity.',
      link: ROUTES.INSTAGRAM_REELS,
      badge: 'Instagram',
      variant: 'instagram'
    },
    {
      title: 'Instagram Stories',
      desc: 'Download public story clips and images before the 24-hour expiration.',
      link: ROUTES.INSTAGRAM_STORIES,
      badge: 'Instagram',
      variant: 'instagram'
    },
    {
      title: 'Instagram Posts',
      desc: 'Download high-res carousel photos and video posts from open profiles.',
      link: ROUTES.INSTAGRAM_POSTS,
      badge: 'Instagram',
      variant: 'instagram'
    }
  ];

  const steps = [
    {
      step: '01',
      title: 'Paste Media Link',
      desc: 'Copy a public media URL from YouTube or Instagram and paste it into the downloader field.'
    },
    {
      step: '02',
      title: 'Stateless Analysis',
      desc: 'Our engine performs zero-trust validation and retrieves genuine, authentic format options.'
    },
    {
      step: '03',
      title: 'Select Quality',
      desc: 'Choose your desired video resolution (1080p, 720p) or audio format from verified source streams.'
    },
    {
      step: '04',
      title: 'Direct Stream',
      desc: 'Receive your file stream directly. Server temporary processing folders are wiped immediately.'
    }
  ];

  const features = [
    {
      icon: Zap,
      title: 'Fast & Direct',
      desc: 'Streamlined transcode pipelines without intermediate queue bloat or artificial delays.'
    },
    {
      icon: Lock,
      title: 'Zero Accounts Required',
      desc: 'No logins, passwords, emails, or personal databases. Completely anonymous and stateless.'
    },
    {
      icon: Trash2,
      title: 'Ephemeral Processing',
      desc: 'Media is processed in temporary isolated directories and purged immediately upon download.'
    },
    {
      icon: ShieldCheck,
      title: 'Privacy Focused',
      desc: 'Zero download tracking, no analytics cookies, and no retention of user identifiers.'
    },
    {
      icon: SlidersHorizontal,
      title: 'Authentic Formats',
      desc: 'Only displays verified stream resolutions actually provided by the upstream public service.'
    },
    {
      icon: FileCheck2,
      title: 'Clean & Compliant',
      desc: 'Engineered strictly for authorized public content without bypassing DRM or paywalls.'
    }
  ];

  const faqs = [
    {
      q: 'Do I need to create an account or provide payment information?',
      a: 'No. InTube is completely free and stateless. We do not require accounts, logins, or user credentials.'
    },
    {
      q: 'Does InTube store copies of downloaded files on its servers?',
      a: 'Never. Media is processed in an isolated ephemeral directory and deleted immediately upon download completion, client disconnect, or error.'
    },
    {
      q: 'Can I download private Instagram posts or private YouTube videos?',
      a: 'No. InTube strictly respects platform privacy and access controls. Only publicly accessible media can be analyzed and processed.'
    },
    {
      q: 'Which formats and quality options are supported?',
      a: 'Depending on the source media, you can download MP4 videos (1080p, 720p, 480p) and MP3/M4A audio.'
    }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      <SEO
        title="Download Media Simply — YouTube & Instagram Utility"
        description="Fast, stateless, and privacy-focused media utility. Paste a public YouTube or Instagram link, choose the format, and download your authorized media."
      />

      {/* Hero Section */}
      <section className="text-center space-y-6 pt-4 sm:pt-6 max-w-4xl mx-auto">
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-semibold rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-700 dark:text-brand-300 border border-brand-200 dark:border-brand-900">
          <Sparkles className="w-3.5 h-3.5 text-brand-500" />
          <span>Stateless • Privacy-Focused • Open Standards</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.1]">
          Download media, <span className="text-brand-600 dark:text-brand-400">simply.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Paste a supported public media URL, choose the format, and download your authorized media in a few clicks.
        </p>

        {/* Downloader Form */}
        <div className="pt-2">
          <Downloader />
        </div>
      </section>

      {/* Supported Platforms */}
      <section className="text-center space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Supported Public Platforms
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-12">
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm shadow-subtle">
            <Youtube className="w-5 h-5 text-red-500" />
            <span>YouTube Videos & Shorts</span>
          </div>
          <div className="flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 font-semibold text-sm shadow-subtle">
            <Instagram className="w-5 h-5 text-pink-500" />
            <span>Instagram Reels & Posts</span>
          </div>
        </div>
      </section>

      {/* Popular Tools Grid */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Tools</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Direct extractors tailored for specific media types and containers.
            </p>
          </div>
          <Link
            to={ROUTES.TOOLS}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline flex items-center gap-1"
          >
            View all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTools.map((tool) => (
            <Link key={tool.link} to={tool.link} className="focus:outline-none">
              <Card className="p-5 hover:border-brand-500/50 hover:shadow-card transition-all h-full flex flex-col justify-between group">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge size="sm" variant={tool.variant}>
                      {tool.badge}
                    </Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-brand-600 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-brand-600 dark:group-hover:text-brand-400 transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tool.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            A transparent, 4-step workflow from public URL to clean download.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <Card key={s.step} className="p-6 relative">
              <span className="text-3xl font-extrabold text-brand-600/20 dark:text-brand-400/20 mb-3 block">
                {s.step}
              </span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Engineered for Simplicity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Built without bloated tracking scripts, user databases, or permanent file storage.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 items-start">
              <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/60 border border-brand-100 dark:border-brand-900 flex items-center justify-center text-brand-600 dark:text-brand-400 shrink-0 shadow-subtle">
                <f.icon className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-sm text-slate-900 dark:text-white">{f.title}</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{f.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* FAQ Mini */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            Common questions regarding supported media types and security policies.
          </p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-5 space-y-2">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-brand-600 dark:text-brand-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link
            to={ROUTES.FAQ}
            className="text-xs font-semibold text-brand-600 dark:text-brand-400 hover:underline inline-flex items-center gap-1"
          >
            View all FAQ items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
