import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Scale, ShieldAlert, FileText, CheckSquare } from 'lucide-react';

export function Terms() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="Terms of Service — InTube"
        description="Review the terms of service, acceptable use policies, and legal boundaries for using the InTube media utility."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-900 shadow-subtle">
          <Scale className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Terms of Service
        </h1>
        <p className="text-xs text-slate-500">Last updated: August 2026</p>
      </div>

      <Card className="p-6 sm:p-8 space-y-6 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <CheckSquare className="w-4 h-4 text-brand-600 dark:text-brand-400" />
            <h2>1. Authorized Use & Intent</h2>
          </div>
          <p>
            InTube is intended exclusively for extracting and processing public media content that the user owns, creates, or is legally authorized by the content owner or platform license to download and store for personal use.
          </p>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <ShieldAlert className="w-4 h-4 text-amber-500" />
            <h2>2. Prohibited Activities</h2>
          </div>
          <p>
            Users are strictly prohibited from utilizing this utility to:
          </p>
          <ul className="list-disc list-inside space-y-1.5 pl-2">
            <li>Bypass Digital Rights Management (DRM) mechanisms or technological protection measures.</li>
            <li>Access private, restricted, or password-protected content without proper credentials.</li>
            <li>Conduct automated scraping, denial-of-service, or abusive bulk downloading.</li>
            <li>Infringe on intellectual property rights or copyright protections.</li>
          </ul>
        </section>

        <section className="space-y-2">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base">
            <FileText className="w-4 h-4 text-slate-500" />
            <h2>3. Disclaimer of Warranty</h2>
          </div>
          <p>
            The service is provided on an &quot;AS IS&quot; and &quot;AS AVAILABLE&quot; basis without warranties of any kind, whether express or implied, including fitness for a particular purpose or non-infringement.
          </p>
        </section>
      </Card>
    </div>
  );
}
