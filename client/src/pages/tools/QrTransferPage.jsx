import { Smartphone, QrCode, ShieldCheck, ArrowRight } from 'lucide-react';
import { ToolLayout } from '../../components/tools/ToolLayout.jsx';
import { Card } from '../../components/common/Card.jsx';
import { Button } from '../../components/common/Button.jsx';
import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';

export function QrTransferPage() {
  const steps = [
    {
      num: '01',
      title: 'Process or Download Media',
      desc: 'Use any of our extractors or converters (e.g. Video → Audio or YouTube Downloader) on your desktop browser.'
    },
    {
      num: '02',
      title: 'Click "Transfer to Phone"',
      desc: 'An ephemeral QR code is generated with a single-use, cryptographically random token.'
    },
    {
      num: '03',
      title: 'Scan with Phone Camera',
      desc: 'Point your mobile camera at the screen to open the clean download landing page directly on your phone.'
    },
    {
      num: '04',
      title: 'Automated Ephemeral Cleanup',
      desc: 'The temporary file is streamed directly to your mobile device and instantly deleted after download.'
    }
  ];

  return (
    <ToolLayout
      title="QR Mobile Transfer"
      description="Transfer downloaded media and converted audio directly from your desktop browser to your mobile phone via QR code."
      category="Transfer"
      badgeVariant="secondary"
      icon={Smartphone}
      seoTitle="QR Mobile Transfer - Send Media from PC to Phone"
      seoDescription="Transfer converted media files seamlessly from computer to smartphone via secure temporary QR codes."
    >
      <div className="space-y-8">
        <Card className="p-6 sm:p-8 space-y-6 bg-white/90 dark:bg-slate-900/90 border border-slate-200/80 dark:border-slate-800/80 rounded-2xl shadow-xl backdrop-blur-xl">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="w-20 h-20 rounded-3xl bg-purple-50 dark:bg-purple-950/60 border border-purple-200 dark:border-purple-800 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0 shadow-lg">
              <QrCode className="w-10 h-10" />
            </div>

            <div className="space-y-2 text-center md:text-left">
              <h2 className="text-xl font-extrabold text-slate-900 dark:text-white">
                How QR Direct Transfer Works
              </h2>
              <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-xl leading-relaxed">
                No cables, cloud accounts, or messaging apps needed. Whenever you extract or convert media on InTube, simply click <strong className="text-purple-600 dark:text-purple-400">Transfer to Phone</strong> to instantly beam the file to your iOS or Android device.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
            {steps.map((s, idx) => (
              <div
                key={idx}
                className="p-4 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1.5"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-black text-purple-600 dark:text-purple-400">
                    {s.num}
                  </span>
                  <h3 className="font-bold text-sm text-slate-900 dark:text-white">{s.title}</h3>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>10-minute maximum lifespan • Zero permanent server storage</span>
            </div>

            <Link to={ROUTES.HOME}>
              <Button size="md" variant="primary" className="font-bold text-xs">
                Start Media Extraction <ArrowRight className="w-3.5 h-3.5 ml-1.5" />
              </Button>
            </Link>
          </div>
        </Card>
      </div>
    </ToolLayout>
  );
}
