import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Badge } from '../components/common/Badge.jsx';
import {
  Lock,
  ShieldCheck,
  Server,
  EyeOff,
  Trash2,
  Cpu,
  ArrowRight,
  HardDrive,
  CheckCircle2,
  XCircle
} from 'lucide-react';

export function Privacy() {
  const steps = [
    {
      step: '1',
      title: 'User Input',
      desc: 'You paste a public link or drop a local file. No login or email is ever requested.',
      icon: Lock
    },
    {
      step: '2',
      title: 'Isolated Job Directory',
      desc: 'A random UUID directory (/temp/job-xxx) is allocated for your conversion.',
      icon: Server
    },
    {
      step: '3',
      title: 'In-Memory Stream Transcoding',
      desc: 'FFmpeg or Sharp processes the media with stream piping and zero database caching.',
      icon: Cpu
    },
    {
      step: '4',
      title: 'Direct Stream Delivery',
      desc: 'Output is streamed directly to your browser download socket.',
      icon: HardDrive
    },
    {
      step: '5',
      title: 'Guaranteed File Purge',
      desc: 'Temp files are purged immediately on stream completion, client disconnect, or 10-min expiry.',
      icon: Trash2
    }
  ];

  return (
    <div className="space-y-10 max-w-4xl mx-auto">
      <SEO
        title="Privacy by Design — InTube Universal Media Toolkit"
        description="Learn how InTube guarantees privacy through zero user accounts, ephemeral media processing, no permanent storage, and automatic file cleanup."
      />

      {/* Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 shadow-subtle">
          <ShieldCheck className="w-8 h-8" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 dark:text-white tracking-tight">
          Privacy by Design
        </h1>
        <p className="text-sm text-slate-500 max-w-xl mx-auto">
          InTube is built with strict stateless architecture. We do not store media permanently, require accounts, or track user activity.
        </p>
      </div>

      {/* Architecture Processing Lifecycle */}
      <Card className="p-6 sm:p-8 space-y-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div>
            <h2 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
              Data Processing Lifecycle
            </h2>
            <p className="text-xs text-slate-500">
              How files move through the stateless temporary pipeline
            </p>
          </div>
          <Badge variant="success" size="sm">
            <ShieldCheck className="w-3.5 h-3.5 mr-1" /> Verified Stateless
          </Badge>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {steps.map((s, idx) => {
            const Icon = s.icon;
            return (
              <div
                key={s.step}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-2 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="w-6 h-6 rounded-full bg-emerald-500/15 text-emerald-500 font-mono text-xs font-black flex items-center justify-center">
                      {s.step}
                    </span>
                    <Icon className="w-4 h-4 text-slate-400" />
                  </div>
                  <h4 className="font-bold text-xs text-slate-900 dark:text-white">
                    {s.title}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {idx < steps.length - 1 && (
                  <div className="hidden md:flex justify-end pt-2 text-slate-300 dark:text-slate-700">
                    <ArrowRight className="w-3.5 h-3.5" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>

      {/* Comparison: What We Do vs What We Don't Do */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* What We Don't Do */}
        <Card className="p-6 sm:p-7 space-y-4 border border-rose-500/20 bg-rose-50/20 dark:bg-rose-950/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-rose-600 dark:text-rose-400 font-extrabold text-base">
            <XCircle className="w-5 h-5" />
            <h3>What We Don&apos;t Do</h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No User Accounts:</strong> No signups, passwords, emails, or profile tracking.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No Permanent Storage:</strong> No databases (MongoDB, SQL) storing media libraries.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No Download History:</strong> We do not log what videos or music you download.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-rose-500 font-bold">✕</span>
              <span><strong>No DRM Circumvention:</strong> We only process public, authorized media.</span>
            </li>
          </ul>
        </Card>

        {/* What We Guarantee */}
        <Card className="p-6 sm:p-7 space-y-4 border border-emerald-500/20 bg-emerald-50/20 dark:bg-emerald-950/10 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-extrabold text-base">
            <CheckCircle2 className="w-5 h-5" />
            <h3>What We Guarantee</h3>
          </div>

          <ul className="space-y-2.5 text-xs sm:text-sm text-slate-700 dark:text-slate-300">
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Automatic File Cleanup:</strong> Background sweeps purge files older than 10 minutes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Cryptographic QR Tokens:</strong> 64-character unguessable tokens that expire in 10 minutes.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Local Browser Preferences:</strong> Only theme (dark/light) and download preset stored in localStorage.</span>
            </li>
            <li className="flex items-start gap-2">
              <span className="text-emerald-500 font-bold">✓</span>
              <span><strong>Isolated UUID Sandbox:</strong> Every conversion runs in its own ephemeral directory.</span>
            </li>
          </ul>
        </Card>
      </div>

      {/* Technical Disclosures Card */}
      <Card className="p-6 sm:p-8 space-y-4 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed border border-slate-200/80 dark:border-slate-800/80">
        <h3 className="font-bold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <EyeOff className="w-4 h-4 text-blue-500" />
          Technical Infrastructure Disclosures
        </h3>
        <p>
          InTube runs frontend assets on Vercel and backend microservices on Render Linux containers. Render instances use temporary, non-persistent RAM and disk storage. Server logs are sanitized to strip query parameters, auth headers, and IP addresses, and are used solely for rate-limit protection and real-time crash monitoring.
        </p>
      </Card>
    </div>
  );
}
