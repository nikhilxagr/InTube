import { useState } from 'react';
import { Film, Music, Clock, HardDrive, Gauge, Copy, Check, Info } from 'lucide-react';
import { Card } from '../common/Card.jsx';
import { Button } from '../common/Button.jsx';

export function MediaInfo({ metadata }) {
  const [copied, setCopied] = useState(false);

  if (!metadata) return null;

  const handleCopy = () => {
    const jsonStr = JSON.stringify(metadata, null, 2);
    navigator.clipboard.writeText(jsonStr).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const items = [
    {
      label: 'Format',
      value: (metadata.format || 'Media').toUpperCase(),
      icon: HardDrive
    },
    {
      label: 'Duration',
      value: metadata.durationFormatted || (metadata.duration ? `${metadata.duration}s` : 'Unknown'),
      icon: Clock
    },
    {
      label: 'File Size',
      value: metadata.sizeFormatted || `${((metadata.sizeBytes || 0) / (1024 * 1024)).toFixed(2)} MB`,
      icon: HardDrive
    },
    {
      label: 'Bitrate',
      value: metadata.bitrateKbps ? `${metadata.bitrateKbps} kbps` : (metadata.audio?.bitrate || 'Dynamic'),
      icon: Gauge
    },
    ...(metadata.video ? [
      {
        label: 'Resolution',
        value: metadata.video.resolution || `${metadata.video.width}x${metadata.video.height}`,
        icon: Film
      },
      {
        label: 'Video Codec',
        value: (metadata.video.codec || 'h264').toUpperCase(),
        icon: Film
      },
      {
        label: 'Frame Rate',
        value: metadata.video.fps ? `${metadata.video.fps} FPS` : 'Standard',
        icon: Film
      }
    ] : []),
    ...(metadata.audio ? [
      {
        label: 'Audio Codec',
        value: (metadata.audio.codec || 'aac').toUpperCase(),
        icon: Music
      },
      {
        label: 'Sample Rate',
        value: metadata.audio.sampleRate || '44.1 kHz',
        icon: Music
      },
      {
        label: 'Channels',
        value: metadata.audio.channels === 1 ? 'Mono' : 'Stereo (2.0)',
        icon: Music
      }
    ] : [])
  ];

  return (
    <Card className="p-5 sm:p-6 space-y-4 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl shadow-xl rounded-2xl">
      <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3.5">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-purple-500" />
          <h3 className="font-bold text-sm sm:text-base text-slate-900 dark:text-white">
            Media Technical Specifications
          </h3>
        </div>

        <Button
          size="sm"
          variant="outline"
          onClick={handleCopy}
          className="text-xs gap-1.5 font-semibold py-1.5"
        >
          {copied ? (
            <>
              <Check className="w-3.5 h-3.5 text-emerald-500" />
              <span>Copied!</span>
            </>
          ) : (
            <>
              <Copy className="w-3.5 h-3.5 text-slate-400" />
              <span>Copy JSON</span>
            </>
          )}
        </Button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {items.map((item, idx) => (
          <div
            key={idx}
            className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 space-y-1"
          >
            <div className="flex items-center gap-1.5 text-slate-400 dark:text-slate-500 text-[11px] font-medium">
              <item.icon className="w-3 h-3 text-purple-500/70" />
              <span>{item.label}</span>
            </div>
            <p className="font-mono font-bold text-xs sm:text-sm text-slate-800 dark:text-slate-200 truncate">
              {item.value}
            </p>
          </div>
        ))}
      </div>
    </Card>
  );
}
