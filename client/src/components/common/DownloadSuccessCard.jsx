import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  CheckCircle2,
  Download,
  Smartphone,
  Music,
  Film,
  RefreshCw,
  X,
  ShieldCheck,
  FolderDown,
  FileVideo,
  FileAudio
} from 'lucide-react';
import { Card } from './Card.jsx';
import { Button } from './Button.jsx';
import { Badge } from './Badge.jsx';
import { QrTransferCard } from '../tools/QrTransferCard.jsx';
import { ROUTES } from '../../constants/routes.js';

export function DownloadSuccessCard({
  filename = 'media.mp4',
  mediaTitle = '',
  platform = 'youtube',
  format = null,
  onDownloadAgain = null,
  onReset = null,
  onClose = null
}) {
  const [showQr, setShowQr] = useState(false);

  const isAudio = filename.endsWith('.mp3') || filename.endsWith('.m4a') || filename.endsWith('.wav') || format?.type === 'audio';
  const ext = filename.split('.').pop()?.toUpperCase() || (isAudio ? 'MP3' : 'MP4');

  return (
    <Card className="p-6 sm:p-8 space-y-6 bg-gradient-to-b from-emerald-950/40 via-slate-900/95 to-[#090d16]/95 border-2 border-emerald-500/50 rounded-3xl shadow-2xl shadow-emerald-500/10 backdrop-blur-2xl relative overflow-hidden text-white animate-fadeIn">
      {/* Background glow effects */}
      <div className="absolute -top-12 -right-12 w-56 h-56 bg-emerald-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-12 -left-12 w-56 h-56 bg-purple-500/15 rounded-full blur-3xl pointer-events-none" />

      {/* Close button */}
      {onClose && (
        <button
          type="button"
          onClick={onClose}
          aria-label="Dismiss success message"
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800/80 transition-colors z-20"
        >
          <X className="w-5 h-5" />
        </button>
      )}

      {/* Header animation with bouncy checkmark */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-5 relative z-10 text-center sm:text-left">
        <div className="relative shrink-0">
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center shadow-xl shadow-emerald-500/30 transform hover:scale-105 transition-transform">
            <CheckCircle2 className="w-10 h-10 sm:w-12 sm:h-12 stroke-[2.5]" />
          </div>
          <div className="absolute -top-1.5 -right-1.5 w-6 h-6 rounded-full bg-emerald-500 text-white flex items-center justify-center text-xs font-black shadow-md">
            ✓
          </div>
        </div>

        <div className="space-y-1.5 min-w-0 flex-1">
          <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
            <Badge variant="success" size="sm">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Download Ready
            </Badge>
            <Badge
              variant={
                platform === 'youtube' ? 'youtube'
                : platform === 'instagram' ? 'instagram'
                : platform === 'facebook' ? 'facebook'
                : 'brand'
              }
              size="sm"
            >
              {platform?.toUpperCase() || 'PUBLIC MEDIA'}
            </Badge>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-slate-300">
              .{ext}
            </span>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight leading-snug">
            Download Completed!
          </h2>

          <p className="text-xs sm:text-sm text-emerald-300/90 flex items-center justify-center sm:justify-start gap-1.5 font-medium">
            <FolderDown className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>Saved to your browser&apos;s Downloads folder.</span>
          </p>
        </div>
      </div>

      {/* File specifications container */}
      <div className="p-4 sm:p-5 rounded-2xl bg-slate-950/80 border border-slate-800/80 flex items-center justify-between gap-4 relative z-10">
        <div className="flex items-center gap-3.5 min-w-0">
          <div className="w-11 h-11 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 flex items-center justify-center shrink-0">
            {isAudio ? <FileAudio className="w-6 h-6" /> : <FileVideo className="w-6 h-6" />}
          </div>
          <div className="min-w-0">
            <h4 className="font-extrabold text-sm sm:text-base text-white truncate font-mono">
              {filename}
            </h4>
            <p className="text-xs text-slate-400 truncate mt-0.5">
              {mediaTitle || format?.quality || 'High Definition Media Stream'}
            </p>
          </div>
        </div>

        <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold shrink-0">
          <ShieldCheck className="w-4 h-4" />
          <span>Verified Safe</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-3 pt-1 relative z-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Download Again button */}
          {onDownloadAgain && (
            <Button
              size="md"
              variant="primary"
              onClick={onDownloadAgain}
              className="w-full font-bold text-xs sm:text-sm shadow-lg shadow-emerald-500/20 py-3 justify-center"
            >
              <Download className="w-4 h-4 mr-2" /> Download Again
            </Button>
          )}

          {/* Transfer to Phone button */}
          <Button
            size="md"
            variant="outline"
            onClick={() => setShowQr(true)}
            className="w-full font-bold text-xs sm:text-sm bg-slate-800/80 hover:bg-slate-700/80 border-slate-700 text-white py-3 justify-center"
          >
            <Smartphone className="w-4 h-4 mr-2 text-purple-400" /> Transfer to Phone (QR)
          </Button>
        </div>

        {/* Quick Tools & Reset actions */}
        <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-slate-400">Toolkit shortcuts:</span>
            <Link
              to={ROUTES.TOOLS_VIDEO_TO_AUDIO}
              className="inline-flex items-center gap-1 font-semibold text-purple-400 hover:text-purple-300 hover:underline"
            >
              <Music className="w-3 h-3" /> Extract Audio
            </Link>
            <span className="text-slate-600">•</span>
            <Link
              to={ROUTES.TOOLS_CONVERTER}
              className="inline-flex items-center gap-1 font-semibold text-pink-400 hover:text-pink-300 hover:underline"
            >
              <Film className="w-3 h-3" /> Convert Format
            </Link>
          </div>

          {onReset && (
            <Button
              size="sm"
              variant="ghost"
              onClick={onReset}
              className="text-xs text-slate-300 hover:text-white"
            >
              <RefreshCw className="w-3.5 h-3.5 mr-1.5" />
              Download Another URL
            </Button>
          )}
        </div>
      </div>

      {/* QR Transfer Modal */}
      {showQr && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="QR Transfer Modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fadeIn"
        >
          <div className="fixed inset-0" onClick={() => setShowQr(false)} />
          <div className="relative z-10 w-full max-w-md">
            <QrTransferCard
              token="phone_qr_transfer"
              filename={filename}
              onClose={() => setShowQr(false)}
            />
          </div>
        </div>
      )}
    </Card>
  );
}
