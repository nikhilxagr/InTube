import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Smartphone, Clock, AlertTriangle, ShieldCheck, FileCheck, ArrowLeft } from 'lucide-react';
import { Button } from '../components/common/Button.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { ToolsService } from '../services/tools.service.js';

export function TransferPage() {
  const { token } = useParams();
  const [loading, setLoading] = useState(true);
  const [transfer, setTransfer] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');
  const [timeLeft, setTimeLeft] = useState(0);

  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    setLoading(true);

    ToolsService.getTransferInfo(token)
      .then((res) => {
        if (isMounted && res.success && res.data) {
          setTransfer(res.data);
          setTimeLeft(res.data.remainingSeconds || 0);
        }
      })
      .catch((err) => {
        if (isMounted) {
          setErrorMessage(err?.message || 'This transfer link has expired or is invalid.');
        }
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    return () => {
      isMounted = false;
    };
  }, [token]);

  useEffect(() => {
    if (timeLeft <= 0) return;

    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          setErrorMessage('This transfer link has expired. Please generate a new QR code on desktop.');
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [timeLeft]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const downloadUrl = ToolsService.getTransferDownloadUrl(token);

  return (
    <div className="min-h-screen bg-slate-950 text-white flex flex-col items-center justify-center p-4 selection:bg-purple-500/30">
      <SEO
        title="Mobile Media Transfer - InTube"
        description="Download your media file directly to your smartphone."
      />

      <div className="w-full max-w-md space-y-6">
        {/* Minimal Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex p-3 rounded-2xl bg-purple-500/10 border border-purple-500/30 text-purple-400 shadow-inner">
            <Smartphone className="w-8 h-8" />
          </div>
          <h1 className="text-xl sm:text-2xl font-extrabold tracking-tight">
            Mobile Media Transfer
          </h1>
          <p className="text-xs text-slate-400">
            Secure ephemeral transfer to your mobile device
          </p>
        </div>

        {loading ? (
          <Card className="p-8 text-center space-y-4 bg-slate-900/90 border border-slate-800 rounded-3xl backdrop-blur-xl">
            <div className="w-10 h-10 border-4 border-purple-500/30 border-t-purple-500 rounded-full animate-spin mx-auto" />
            <p className="text-xs text-slate-400">Locating media package...</p>
          </Card>
        ) : errorMessage || !transfer ? (
          <Card className="p-8 text-center space-y-5 bg-slate-900/90 border border-red-900/40 rounded-3xl backdrop-blur-xl">
            <div className="w-14 h-14 rounded-2xl bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto shadow-inner">
              <AlertTriangle className="w-7 h-7" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-base font-bold text-white">Transfer Link Expired</h2>
              <p className="text-xs text-slate-400 leading-relaxed">
                {errorMessage || 'For your security, temporary transfers expire automatically after 10 minutes.'}
              </p>
            </div>

            <div className="pt-2">
              <Link to="/">
                <Button size="sm" variant="outline" className="text-xs font-bold w-full justify-center">
                  <ArrowLeft className="w-3.5 h-3.5 mr-1.5" /> Back to Home
                </Button>
              </Link>
            </div>
          </Card>
        ) : (
          <Card className="p-6 sm:p-8 space-y-6 bg-slate-900/95 border border-purple-500/30 rounded-3xl backdrop-blur-2xl shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="space-y-4 relative z-10">
              <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800 flex items-start gap-3.5">
                <div className="w-10 h-10 rounded-xl bg-purple-500/20 text-purple-300 flex items-center justify-center shrink-0 mt-0.5">
                  <FileCheck className="w-5 h-5" />
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-sm text-white truncate">
                    {transfer.title || transfer.filename}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-slate-400 mt-1">
                    <span className="font-semibold text-purple-400">
                      {transfer.size > 0 ? `${(transfer.size / (1024 * 1024)).toFixed(1)} MB` : 'Media File'}
                    </span>
                    <span>•</span>
                    <span className="uppercase">{transfer.filename?.split('.').pop()}</span>
                  </div>
                </div>
              </div>

              {/* Expiration counter */}
              <div className="p-3 rounded-xl bg-slate-950/60 border border-purple-500/20 flex items-center justify-between text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <Clock className="w-4 h-4 text-purple-400" />
                  Expires in:
                </span>
                <span className="font-mono font-black text-sm text-purple-300">
                  {formatCountdown(timeLeft)}
                </span>
              </div>

              {/* Big Download Button */}
              <a
                href={downloadUrl}
                download={transfer.filename}
                className="block w-full"
              >
                <Button
                  size="lg"
                  variant="primary"
                  className="w-full py-4 text-base font-extrabold shadow-xl shadow-purple-600/30 justify-center"
                >
                  <Download className="w-5 h-5 mr-2" /> Download File Now
                </Button>
              </a>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 text-center pt-2">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>Zero tracking • Auto-deleted from server</span>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
}
