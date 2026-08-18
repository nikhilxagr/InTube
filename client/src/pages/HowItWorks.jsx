import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { PlaySquare, CheckCircle, Cpu, Trash2 } from 'lucide-react';

export function HowItWorks() {
  const steps = [
    {
      num: '01',
      title: 'Submit Public Media URL',
      desc: 'The user supplies a URL from a supported public service (e.g. YouTube or Instagram). The frontend checks input validity and dispatches it to our secure API.'
    },
    {
      num: '02',
      title: 'Zero-Trust SSRF & URL Validation',
      desc: 'The backend verifies that the URL strictly targets legitimate public platform domains, rejecting any loopback, intranet, cloud metadata, or malformed addresses.'
    },
    {
      num: '03',
      title: 'Provider Resolution & Metadata Retrieval',
      desc: 'The appropriate provider retrieves verified public stream options (resolutions, bitrates, containers) and returns normalized metadata to the client.'
    },
    {
      num: '04',
      title: 'Format Selection & Ephemeral Transcoding',
      desc: 'Upon format selection, the server downloads the streams into an isolated job folder (temp/<uuid>/) and utilizes FFmpeg for conversion if needed.'
    },
    {
      num: '05',
      title: 'Direct Stream & Immediate Cleanup',
      desc: 'The file is piped to the client with correct HTTP headers. Once the stream ends, error triggers, or client aborts, the temporary directory is permanently deleted.'
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <SEO
        title="How InTube Works — Stateless Processing Architecture"
        description="Learn how InTube analyzes public media, transforms video with FFmpeg, and streams files with zero persistent storage."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 shadow-subtle">
          <PlaySquare className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          How InTube Operates
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          An architectural overview of how public media is analyzed, processed, and streamed with zero persistent storage.
        </p>
      </div>

      <div className="space-y-4">
        {steps.map((step) => (
          <Card key={step.num} className="p-6 flex flex-col sm:flex-row gap-5 items-start">
            <div className="w-12 h-12 rounded-xl bg-brand-50 dark:bg-brand-950/50 border border-brand-100 dark:border-brand-900 flex items-center justify-center font-extrabold text-brand-600 dark:text-brand-400 text-lg shrink-0">
              {step.num}
            </div>
            <div className="space-y-1.5 flex-1">
              <h2 className="font-bold text-base text-slate-900 dark:text-white">{step.title}</h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                {step.desc}
              </p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
        <Card className="p-5 space-y-2">
          <CheckCircle className="w-5 h-5 text-emerald-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Stateless Pipeline</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">No database connections, persistent tables, or user cookies.</p>
        </Card>
        <Card className="p-5 space-y-2">
          <Cpu className="w-5 h-5 text-brand-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Safe FFmpeg</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Spawned safely with explicit argument arrays and processing timeouts.</p>
        </Card>
        <Card className="p-5 space-y-2">
          <Trash2 className="w-5 h-5 text-rose-500" />
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Instant Purge</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">Temporary folders are deleted immediately via lifecycle cleanup hooks.</p>
        </Card>
      </div>
    </div>
  );
}
