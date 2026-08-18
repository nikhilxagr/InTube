import { Downloader } from '../components/downloader/Downloader.jsx';
import { Card } from '../components/common/Card.jsx';
import { Alert } from '../components/common/Alert.jsx';
import { SEO } from '../components/common/SEO.jsx';
import { Eye } from 'lucide-react';

export function Stories() {
  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      <SEO
        title="Instagram Stories Downloader — Save Public Stories"
        description="Download public Instagram Stories anonymously before the 24-hour expiration window closes."
      />

      <div className="text-center space-y-3">
        <div className="inline-flex p-3 rounded-2xl bg-pink-50 dark:bg-pink-950/50 text-pink-600 border border-pink-200 dark:border-pink-900 shadow-subtle">
          <Eye className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
          Instagram Stories Downloader
        </h1>
        <p className="text-sm sm:text-base text-slate-600 dark:text-slate-300 max-w-lg mx-auto">
          Save active public Instagram Stories before they disappear after 24 hours.
        </p>
      </div>

      <Alert
        type="info"
        title="Public Accounts Only"
        message="In accordance with privacy standards, InTube only processes stories from open, public profiles. Private accounts requiring login or session access are strictly not supported."
      />

      <Downloader
        defaultPlatform="Instagram Stories"
        placeholder="Paste Instagram Story link (e.g. https://www.instagram.com/stories/username/12345/)"
      />

      <Card className="p-6 sm:p-8 space-y-4">
        <h2 className="font-bold text-lg text-slate-900 dark:text-white">Important Story Information</h2>
        <ul className="space-y-2.5 text-xs sm:text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
            <span><strong>24-Hour Lifetime:</strong> Instagram Stories expire after 24 hours. Expired stories cannot be analyzed or retrieved.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
            <span><strong>Zero Account Linkage:</strong> You do not need to connect your Instagram account or enter passwords.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-pink-500 mt-2 shrink-0" />
            <span><strong>Original Resolution:</strong> Downloads preservation-quality MP4 video or JPG photo streams.</span>
          </li>
        </ul>
      </Card>
    </div>
  );
}
