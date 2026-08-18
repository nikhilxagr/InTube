import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Info, ShieldCheck, Sparkles } from 'lucide-react';

export function About() {
  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <SEO
        title="About InTube — Clean, Stateless Media Utility"
        description="Learn about InTube's mission to provide a respectful, advertising-free, and stateless media downloader for personal authorized use."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 shadow-subtle">
          <Info className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          About InTube
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          A modern, stateless media utility designed with privacy, simplicity, and compliance at its core.
        </p>
      </div>

      <div className="space-y-6 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <Card className="p-6 sm:p-8 space-y-4">
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Our Philosophy</h2>
          <p>
            Most online media downloaders are cluttered with invasive advertisements, deceptive download buttons, and heavy tracking scripts.
            <strong> InTube</strong> was created from the ground up to offer a clean, respectful alternative that focuses strictly on what matters: fast, reliable, and truthful media extraction for content that users are authorized to download.
          </p>
          <p>
            We intentionally adhere to a <strong>stateless architecture</strong>: no user accounts, no tracking cookies, no MongoDB or relational database instances, and no persistent file archives.
          </p>
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-brand-50 dark:bg-brand-950/50 text-brand-600 dark:text-brand-400 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Zero Tracking</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We do not track your downloads, IP histories, or store analytics identifying your personal activity.
            </p>
          </Card>

          <Card className="p-6 space-y-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Authentic Formats</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              We never fabricate fake resolutions or bitrates. Only genuine streams provided by the upstream platform are displayed.
            </p>
          </Card>
        </div>

        <Card className="p-6 sm:p-8 space-y-3">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white">Modern Engineering Stack</h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
            Built using React, Vite, Tailwind CSS on the frontend, combined with Node.js, Express, and standard FFmpeg on the backend. Designed for seamless deployment on Vercel and Render.
          </p>
        </Card>
      </div>
    </div>
  );
}
