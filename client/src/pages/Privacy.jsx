import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Lock, ShieldCheck, Database, EyeOff, Server } from 'lucide-react';

export function Privacy() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="Privacy Policy — InTube"
        description="Our privacy policy details our strict commitment to zero user accounts, zero download logging, and ephemeral media processing."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900 shadow-subtle">
          <Lock className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Privacy Policy
        </h1>
        <p className="text-xs text-slate-500">Last updated: August 2026</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
            <h2>1. Core Privacy Commitment</h2>
          </div>
          <p>
            InTube is built upon a privacy-by-design architecture. We do not require account registration, login credentials, emails, or personal payment details to access the service.
          </p>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Server className="w-4 h-4 text-emerald-500" />
            <h2>2. Ephemeral Data & Temporary File Storage</h2>
          </div>
          <p>
            When you request to analyze or process a media link, temporary processing artifacts are held only in volatile server filesystem directories during active transcoding. Once the download stream concludes or encounters an error, the temporary job folder is immediately and permanently deleted.
          </p>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <EyeOff className="w-4 h-4 text-emerald-500" />
            <h2>3. Logs & Analytics</h2>
          </div>
          <p>
            Server access logs are sanitized to exclude full sensitive URLs, tokens, and personally identifiable information. Logs are strictly utilized for short-term operational monitoring, rate-limiting enforcement, and crash diagnostics.
          </p>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <Database className="w-4 h-4 text-emerald-500" />
            <h2>4. Third-Party Platforms</h2>
          </div>
          <p>
            When downloading media from public providers such as YouTube or Instagram, network requests retrieve metadata directly from public endpoints. We do not transmit user identifiable data to third parties.
          </p>
        </section>
      </Card>
    </div>
  );
}
