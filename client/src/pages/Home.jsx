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

// Facebook SVG — lucide-react doesn't include it
function FbIcon({ className }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}

export function Home() {
  const popularTools = [
    { title: 'YouTube Video', desc: 'Extract MP4 HD streams (1080p, 720p, 480p) from public YouTube videos.', link: ROUTES.YOUTUBE_VIDEO, badge: 'YouTube', variant: 'youtube' },
    { title: 'YouTube Shorts', desc: 'Fast, direct download of public vertical short-form video clips.', link: ROUTES.YOUTUBE_SHORTS, badge: 'YouTube', variant: 'youtube' },
    { title: 'YouTube to MP3', desc: 'Convert video soundtracks to high-bitrate MP3 & M4A audio tracks.', link: ROUTES.YOUTUBE_MP3, badge: 'Audio', variant: 'success' },
    { title: 'Instagram Reels', desc: 'Save public Instagram Reels with original audio and video clarity.', link: ROUTES.INSTAGRAM_REELS, badge: 'Instagram', variant: 'instagram' },
    { title: 'Instagram Posts', desc: 'Download high-res carousel photos and video posts from open profiles.', link: ROUTES.INSTAGRAM_POSTS, badge: 'Instagram', variant: 'instagram' },
    { title: 'Facebook Videos', desc: 'Download public Facebook videos, Reels, and fb.watch short links in HD.', link: ROUTES.FACEBOOK, badge: 'Facebook', variant: 'facebook' }
  ];

  const steps = [
    { step: '01', cls: 'step-number-01', title: 'Paste Media Link', desc: 'Copy a public URL from YouTube, Instagram, or Facebook and paste it into the downloader.' },
    { step: '02', cls: 'step-number-02', title: 'Stateless Analysis', desc: 'The engine validates your link and retrieves genuine, authentic format options from the source.' },
    { step: '03', cls: 'step-number-03', title: 'Select Quality', desc: 'Pick your resolution (1080p, 720p) or audio format from the verified stream list.' },
    { step: '04', cls: 'step-number-04', title: 'Direct Stream', desc: 'Receive your file instantly. Temporary server folders are purged immediately after delivery.' }
  ];

  const features = [
    { icon: Zap,              title: 'Fast & Direct',          desc: 'Streamlined pipelines with no artificial delays or intermediate queue bloat.' },
    { icon: Lock,             title: 'Zero Accounts',          desc: 'No logins, emails, or personal databases. Completely anonymous and stateless.' },
    { icon: Trash2,           title: 'Ephemeral Processing',   desc: 'Media is processed in isolated temp directories and purged immediately on download.' },
    { icon: ShieldCheck,      title: 'Privacy Focused',        desc: 'Zero download tracking, no analytics cookies, no retention of user identifiers.' },
    { icon: SlidersHorizontal,title: 'Authentic Formats',      desc: 'Only displays verified stream resolutions provided by the upstream public service.' },
    { icon: FileCheck2,       title: 'Clean & Compliant',      desc: 'Engineered strictly for authorized public content without bypassing DRM or paywalls.' }
  ];

  // Icon color cycling: YT red → IG pink → IG purple → FB blue → purple → red
  const featureColors = [
    'text-red-500 dark:text-red-400',
    'text-pink-500 dark:text-pink-400',
    'text-purple-500 dark:text-purple-400',
    'text-blue-500 dark:text-blue-400',
    'text-indigo-500 dark:text-indigo-400',
    'text-rose-500 dark:text-rose-400'
  ];

  const faqs = [
    { q: 'Do I need to create an account or provide payment information?', a: 'No. InTube is completely free and stateless. We do not require accounts, logins, or user credentials.' },
    { q: 'Does InTube store copies of downloaded files on its servers?', a: 'Never. Media is processed in an isolated ephemeral directory and deleted immediately upon download completion, client disconnect, or error.' },
    { q: 'Can I download private posts or private videos?', a: 'No. InTube strictly respects platform privacy controls. Only publicly accessible media can be analyzed and processed.' },
    { q: 'Which formats and quality options are supported?', a: 'Depending on the source, you can download MP4 videos (1080p, 720p, 480p) and MP3/M4A audio across YouTube, Instagram, and Facebook.' }
  ];

  return (
    <div className="space-y-16 sm:space-y-24">
      <SEO
        title="InTube — YouTube Video Downloader, Shorts & MP3 Converter | Nikhil Projects"
        description="InTube by Nikhil Projects is the ultimate fast, free, and privacy-first online media downloader. Download YouTube 4K/1080p videos, Shorts, MP3 audio, Instagram Reels, and Facebook videos."
        keywords="Nikhil Projects, Nikhil youtube video downloader, yt downloader, youtube downloader, youtube to mp3, youtube shorts downloader, 4k youtube downloader, instagram reels downloader, facebook video downloader, intube, intubedl"
      />

      {/* ── Hero ── */}
      <section className="text-center space-y-6 pt-4 sm:pt-10 max-w-4xl mx-auto">
        {/* Tri-platform badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 text-xs font-semibold rounded-full border backdrop-blur-md shadow-sm"
          style={{
            background: 'linear-gradient(135deg, rgba(239,68,68,0.10), rgba(168,85,247,0.12), rgba(59,130,246,0.10))',
            borderColor: 'rgba(168,85,247,0.25)',
            color: '#c084fc'
          }}>
          <Sparkles className="w-3.5 h-3.5" />
          <span>Nikhil Projects • YouTube · Instagram · Facebook All-in-One Downloader</span>
        </div>

        {/* Headline */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.08]">
          Download media,{' '}
          <span className="text-gradient-tri">your way.</span>
        </h1>

        <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Paste any public link from YouTube, Instagram, or Facebook — choose your quality and download in seconds. No accounts, no ads, no tracking.
        </p>

        {/* Downloader with animated tri-colour border */}
        <div className="pt-3 gradient-border-animated rounded-2xl">
          <Downloader />
        </div>
      </section>

      {/* ── Platform pills ── */}
      <section className="text-center space-y-5">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
          Supported Public Platforms
        </h2>
        <div className="flex flex-wrap items-center justify-center gap-4">
          {/* YouTube */}
          <Link to={ROUTES.YOUTUBE}
            className="platform-pill flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-red-200/60 dark:border-red-900/40 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm shadow-sm hover:shadow-red-500/20 hover:shadow-lg hover:border-red-500/60 transition-all">
            <div className="w-6 h-6 rounded-lg bg-red-50 dark:bg-red-950/60 flex items-center justify-center text-red-600">
              <Youtube className="w-4 h-4" />
            </div>
            <span>YouTube Videos &amp; Shorts</span>
          </Link>

          {/* Instagram */}
          <Link to={ROUTES.INSTAGRAM}
            className="platform-pill flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-pink-200/60 dark:border-pink-900/40 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm shadow-sm hover:shadow-pink-500/20 hover:shadow-lg hover:border-pink-500/60 transition-all">
            <div className="w-6 h-6 rounded-lg bg-pink-50 dark:bg-pink-950/60 flex items-center justify-center text-pink-600">
              <Instagram className="w-4 h-4" />
            </div>
            <span>Instagram Reels &amp; Posts</span>
          </Link>

          {/* Facebook */}
          <Link to={ROUTES.FACEBOOK}
            className="platform-pill flex items-center gap-2.5 px-5 py-2.5 rounded-2xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-blue-200/60 dark:border-blue-900/40 text-slate-700 dark:text-slate-300 font-semibold text-xs sm:text-sm shadow-sm hover:shadow-blue-500/20 hover:shadow-lg hover:border-blue-500/60 transition-all">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/60 flex items-center justify-center text-blue-600">
              <FbIcon className="w-4 h-4" />
            </div>
            <span>Facebook Videos &amp; Reels</span>
          </Link>
        </div>
      </section>

      {/* ── Popular Tools ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Popular Tools</h2>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Direct extractors for specific media types.</p>
          </div>
          <Link to={ROUTES.TOOLS} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline flex items-center gap-1">
            View all tools <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {popularTools.map((tool) => (
            <Link key={tool.link} to={tool.link} className="focus:outline-none">
              <Card className="card-glow-tri p-5 transition-all h-full flex flex-col justify-between group bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80">
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between">
                    <Badge size="sm" variant={tool.variant}>{tool.badge}</Badge>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-purple-500 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white group-hover:text-gradient-tri transition-colors">
                    {tool.title}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{tool.desc}</p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      </section>

      {/* ── How It Works ── */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">How It Works</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">A transparent 4-step workflow from public URL to clean download.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {steps.map((s) => (
            <Card key={s.step} className="p-6 relative bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 card-glow-tri transition-all">
              <span className={`text-3xl font-extrabold mb-3 block opacity-80 ${s.cls}`}>{s.step}</span>
              <h3 className="font-bold text-base text-slate-900 dark:text-white mb-1.5">{s.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">{s.desc}</p>
            </Card>
          ))}
        </div>
      </section>

      {/* ── Features ── */}
      <section className="space-y-8">
        <div className="text-center max-w-xl mx-auto space-y-2">
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">Engineered for Simplicity</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">No tracking, no databases, no permanent storage.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((f, i) => (
            <div key={i} className="flex gap-4 items-start p-4 rounded-2xl bg-white/40 dark:bg-slate-900/40 backdrop-blur-sm border border-slate-200/60 dark:border-slate-800/60 card-glow-tri transition-all">
              <div className={`icon-ring-tri w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${featureColors[i]}`}>
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

      {/* ── FAQ ── */}
      <section className="space-y-8 max-w-3xl mx-auto">
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white">Frequently Asked Questions</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400">Common questions about supported media types and security policies.</p>
        </div>

        <div className="space-y-3">
          {faqs.map((faq, idx) => (
            <Card key={idx} className="p-5 space-y-2 bg-white/70 dark:bg-slate-900/70 backdrop-blur-md border border-slate-200/80 dark:border-slate-800/80 card-glow-tri transition-all">
              <h3 className="font-semibold text-sm text-slate-900 dark:text-white flex items-center gap-2">
                <HelpCircle className="w-4 h-4 text-purple-500 dark:text-purple-400 shrink-0" />
                {faq.q}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 pl-6 leading-relaxed">{faq.a}</p>
            </Card>
          ))}
        </div>

        <div className="text-center pt-2">
          <Link to={ROUTES.FAQ} className="text-xs font-semibold text-purple-600 dark:text-purple-400 hover:underline inline-flex items-center gap-1">
            View all FAQ items <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </section>
    </div>
  );
}
