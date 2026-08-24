import { useState, useEffect } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Smartphone, Copy, Check, X, Clock, AlertTriangle, RefreshCw, ShieldCheck } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';

export function QrTransferCard({
  token,
  expiresAt = null,
  filename = 'media_file',
  size = 0,
  onClose = null,
  onRegenerate = null
}) {
  const [copied, setCopied] = useState(false);
  const [timeLeft, setTimeLeft] = useState(() => {
    if (!expiresAt) return 600;
    return Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
  });

  const transferUrl = typeof window !== 'undefined'
    ? `${window.location.origin}/transfer/${token}`
    : `/transfer/${token}`;

  useEffect(() => {
    if (!expiresAt) return;

    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.round((expiresAt - Date.now()) / 1000));
      setTimeLeft(remaining);
      if (remaining <= 0) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [expiresAt]);

  const formatCountdown = (secs) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(transferUrl).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const isExpired = timeLeft <= 0;
  const isExpiringSoon = timeLeft > 0 && timeLeft < 120; // under 2 minutes

  return (
    <Card className="p-6 sm:p-8 space-y-6 border border-slate-200/90 dark:border-slate-800/90 bg-white/95 dark:bg-slate-900/95 backdrop-blur-2xl shadow-2xl rounded-3xl max-w-md mx-auto relative overflow-hidden">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
        <div className="flex items-center gap-2.5">
          <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center shadow-sm">
            <Smartphone className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white leading-tight">
              Transfer to Phone
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Ephemeral direct QR download
            </p>
          </div>
        </div>

        {onClose && (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close transfer modal"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {isExpired ? (
        <div className="p-6 text-center space-y-4 rounded-2xl bg-red-50/50 dark:bg-red-950/20 border border-red-200 dark:border-red-900">
          <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 flex items-center justify-center mx-auto">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">Transfer Expired</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              For your privacy, this temporary transfer link was purged after the 10-minute window.
            </p>
          </div>
          {onRegenerate && (
            <Button size="sm" variant="primary" onClick={onRegenerate} className="text-xs font-bold w-full">
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Generate New QR
            </Button>
          )}
        </div>
      ) : (
        <div className="space-y-5">
          {/* QR Box */}
          <div className="flex flex-col items-center justify-center p-6 bg-white dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-inner">
            <div className="p-3 bg-white rounded-xl shadow-md border border-slate-100">
              <QRCodeSVG
                value={transferUrl}
                size={180}
                level="M"
                includeMargin={false}
                imageSettings={{
                  src: '/favicon.ico',
                  x: undefined,
                  y: undefined,
                  height: 24,
                  width: 24,
                  excavate: true
                }}
              />
            </div>

            <div className="mt-4 text-center space-y-1">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                Scan with your phone camera
              </p>
              <p className="text-[11px] text-slate-400 truncate max-w-[240px]">
                {filename} {size > 0 ? `(${(size / (1024 * 1024)).toFixed(1)} MB)` : ''}
              </p>
            </div>
          </div>

          {/* Expiration bar */}
          <div
            className={`p-3 rounded-xl flex items-center justify-between text-xs font-semibold ${
              isExpiringSoon
                ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-900 animate-pulse'
                : 'bg-slate-100/80 dark:bg-slate-950/80 text-slate-700 dark:text-slate-300 border border-slate-200/80 dark:border-slate-800/80'
            }`}
          >
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-purple-500" />
              Expires in:
            </span>
            <span className="font-mono text-sm font-extrabold text-purple-600 dark:text-purple-400">
              {formatCountdown(timeLeft)}
            </span>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="outline"
              onClick={handleCopy}
              className="flex-1 text-xs font-bold py-2.5 justify-center"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-500 mr-1.5" />
                  <span>Link Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-4 h-4 text-slate-400 mr-1.5" />
                  <span>Copy Transfer Link</span>
                </>
              )}
            </Button>
          </div>

          <div className="flex items-center justify-center gap-1 text-[11px] text-slate-400 text-center">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Encrypted ephemeral transfer • Auto-deleted after use</span>
          </div>
        </div>
      )}
    </Card>
  );
}
