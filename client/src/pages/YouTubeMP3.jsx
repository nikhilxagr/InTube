import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Music, Radio, Volume2 } from 'lucide-react';

export function YouTubeMP3() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="YouTube to MP3 Converter — High Quality Audio Extraction"
        description="Convert authorized public YouTube videos to high-bitrate MP3 or M4A audio with pristine acoustics."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-emerald-50 dark:bg-emerald-950/50 text-emerald-600 border border-emerald-200 dark:border-emerald-900 shadow-subtle">
          <Music className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          YouTube to MP3 Converter
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Extract pure audio tracks from public YouTube videos in high-bitrate MP3 or M4A format.
        </p>
      </div>

      <Downloader
        defaultPlatform="YouTube Audio"
        placeholder="Paste YouTube URL to convert to MP3 (e.g. https://www.youtube.com/watch?v=...)"
      />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-5 space-y-2">
          <Radio className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Up to 320kbps Audio</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Extracts high-bitrate AAC or Opus source streams and converts cleanly to standard MP3.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <Volume2 className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Lossless M4A Option</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Direct audio container demuxing without re-encoding when original AAC format is preferred.
          </p>
        </Card>

        <Card className="p-5 space-y-2">
          <Music className="w-5 h-5 text-emerald-500" />
          <h2 className="font-bold text-sm text-slate-900 dark:text-white">Universal Compatibility</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
            Plays seamlessly across iPhone, Android, car stereos, and standard desktop media players.
          </p>
        </Card>
      </div>
    </div>
  );
}
