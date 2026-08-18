import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { HelpCircle, ShieldAlert, Cpu, Lock } from 'lucide-react';

export function FAQ() {
  const sections = [
    {
      category: 'General & Access',
      icon: Lock,
      items: [
        {
          q: 'Is InTube free to use?',
          a: 'Yes. InTube is a lightweight, non-commercial media utility built for personal productivity and authorized media downloads.'
        },
        {
          q: 'Do I have to register or create an account?',
          a: 'No. There are no accounts, logins, passwords, or registration forms. The service is 100% stateless.'
        },
        {
          q: 'Are there download history logs tied to my IP?',
          a: 'No. We do not store download histories, IP associations, or user database records.'
        }
      ]
    },
    {
      category: 'Platforms & Privacy Policies',
      icon: ShieldAlert,
      items: [
        {
          q: 'Can I download private Instagram accounts or unlisted content?',
          a: 'No. InTube strictly forbids authentication bypass, session scraping, or DRM circumvention. Only publicly accessible media can be processed.'
        },
        {
          q: 'Why did my download fail with an "Unsupported Media" error?',
          a: 'This typically occurs if the media is private, geo-restricted, a livestream, or if the source platform has altered its stream availability.'
        },
        {
          q: 'Are any files stored permanently on InTube’s servers?',
          a: 'No. All processing files are created inside ephemeral, isolated temporary folders and deleted immediately once download is finished or if an error occurs.'
        }
      ]
    },
    {
      category: 'Formats & Processing',
      icon: Cpu,
      items: [
        {
          q: 'What is the maximum supported file size?',
          a: 'By default, the server limits single media extractions to 100MB to preserve memory and CPU on free hosting environments.'
        },
        {
          q: 'Where are downloaded files saved on my device?',
          a: 'Files are saved to your browser’s default Downloads directory (e.g. `Downloads/` on Windows, macOS, Android, or iOS).'
        },
        {
          q: 'Can I extract high-quality MP3 audio from videos?',
          a: 'Yes. You can select the MP3 audio format to convert video audio tracks up to 320kbps.'
        }
      ]
    }
  ];

  return (
    <div className="space-y-12 max-w-4xl mx-auto">
      <SEO
        title="Frequently Asked Questions (FAQ) — InTube"
        description="Get answers regarding InTube policies, supported platforms, temporary file purging, and format qualities."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 border border-brand-200 dark:border-brand-900 shadow-subtle">
          <HelpCircle className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Frequently Asked Questions
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto">
          Find answers to common questions regarding supported platforms, privacy, and media handling.
        </p>
      </div>

      <div className="space-y-8">
        {sections.map((section) => (
          <div key={section.category} className="space-y-3">
            <div className="flex items-center gap-2 text-slate-900 dark:text-white font-bold text-base px-1">
              <section.icon className="w-4 h-4 text-brand-600 dark:text-brand-400" />
              <h2>{section.category}</h2>
            </div>
            <div className="space-y-3">
              {section.items.map((item, idx) => (
                <Card key={idx} className="p-6 space-y-2">
                  <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white flex items-start gap-2.5">
                    <span className="w-6 h-6 rounded-full bg-brand-50 dark:bg-brand-950/60 text-brand-600 dark:text-brand-400 text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                      Q
                    </span>
                    <span>{item.q}</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 pl-8 leading-relaxed">
                    {item.a}
                  </p>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
