import { RefreshCw, Zap, AlertCircle } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';

export function ProcessingState({
  statusText = 'Processing your media...',
  subText = 'Please keep this tab open while FFmpeg processes the file.',
  progress = null,
  isError = false,
  errorMessage = '',
  onRetry = null,
  onCancel = null
}) {
  const percent = progress?.percent ?? null;

  return (
    <Card className="p-6 sm:p-8 space-y-6 border border-purple-500/30 bg-gradient-to-b from-slate-900/95 to-[#090d16]/95 backdrop-blur-xl shadow-2xl rounded-2xl relative overflow-hidden text-white">
      <div className="absolute top-0 right-0 w-48 h-48 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-48 h-48 bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

      {isError ? (
        <div className="space-y-4 text-center relative z-10">
          <div className="w-12 h-12 rounded-2xl bg-red-500/20 border border-red-500/40 text-red-400 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-extrabold text-lg text-white">Processing Encountered an Issue</h3>
            <p className="text-sm text-red-300 max-w-md mx-auto">{errorMessage || 'Operation could not be completed.'}</p>
          </div>
          <div className="pt-2 flex items-center justify-center gap-3">
            {onRetry && (
              <Button size="sm" variant="primary" onClick={onRetry} className="font-bold text-xs">
                <RefreshCw className="w-3.5 h-3.5 mr-1.5" /> Retry Conversion
              </Button>
            )}
            {onCancel && (
              <Button size="sm" variant="outline" onClick={onCancel} className="text-xs">
                Select Another File
              </Button>
            )}
          </div>
        </div>
      ) : (
        <div className="space-y-5 relative z-10">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center shrink-0">
                <RefreshCw className="w-5 h-5 text-purple-400 animate-spin" />
              </div>
              <div>
                <h4 className="font-bold text-sm sm:text-base text-white flex items-center gap-2">
                  {statusText}
                  <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Zap className="w-2.5 h-2.5 mr-1 animate-bounce" /> Active
                  </span>
                </h4>
                <p className="text-xs text-slate-400 mt-0.5">{subText}</p>
              </div>
            </div>

            {percent !== null && (
              <span className="font-mono text-base font-extrabold px-3 py-1 rounded-xl bg-purple-500/20 border border-purple-500/40 text-purple-200">
                {Math.round(percent)}%
              </span>
            )}
          </div>

          <div className="w-full h-3.5 bg-slate-950/80 rounded-full overflow-hidden p-0.5 border border-slate-700/60 shadow-inner">
            <div
              className="h-full rounded-full transition-all duration-300 relative overflow-hidden"
              style={{
                width: percent !== null ? `${Math.max(percent, 5)}%` : '35%',
                background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 30%, #a855f7 65%, #3b82f6 100%)',
                animation: percent === null ? 'pulse 2s ease-in-out infinite' : 'none'
              }}
            >
              <div
                className="absolute inset-0"
                style={{
                  background: 'linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.4) 50%, transparent 100%)',
                  animation: 'gradientShift 2s ease infinite'
                }}
              />
            </div>
          </div>
        </div>
      )}
    </Card>
  );
}
