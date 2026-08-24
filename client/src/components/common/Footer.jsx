import { Link } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { ShieldCheck } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand & Purpose */}
          <div className="md:col-span-1 space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg flex items-center justify-center text-white font-bold text-xs"
                style={{ background: 'linear-gradient(135deg, #ef4444, #a855f7, #3b82f6)' }}>
                IT
              </div>
              <span className="font-bold text-base text-slate-900 dark:text-white">InTube</span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Stateless, privacy-oriented media utility for analyzing and downloading authorized public video & audio content.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400">
              <ShieldCheck className="w-4 h-4 text-emerald-500" />
              <span>No user data or media stored</span>
            </div>
          </div>

          {/* Quick Tools */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Tools & Platforms
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to={ROUTES.YOUTUBE_VIDEO} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  YouTube Video
                </Link>
              </li>
              <li>
                <Link to={ROUTES.YOUTUBE_SHORTS} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  YouTube Shorts
                </Link>
              </li>
              <li>
                <Link to={ROUTES.YOUTUBE_MP3} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  YouTube to MP3
                </Link>
              </li>
              <li>
                <Link to={ROUTES.INSTAGRAM_REELS} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Instagram Reels
                </Link>
              </li>
              <li>
                <Link to={ROUTES.INSTAGRAM_STORIES} className="hover:text-purple-600 dark:hover:text-purple-400 transition-colors">
                  Instagram Stories
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FACEBOOK} className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                  Facebook Videos
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Resources
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to={ROUTES.HOW_IT_WORKS} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  How It Works
                </Link>
              </li>
              <li>
                <Link to={ROUTES.FAQ} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Frequently Asked Questions
                </Link>
              </li>
              <li>
                <Link to={ROUTES.ABOUT} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  About InTube
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TOOLS} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  All Utilities
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal & Compliance */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-900 dark:text-white mb-3">
              Legal & Privacy
            </h4>
            <ul className="space-y-2 text-xs text-slate-600 dark:text-slate-400">
              <li>
                <Link to={ROUTES.PRIVACY} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link to={ROUTES.TERMS} className="hover:text-brand-600 dark:hover:text-brand-400 transition-colors">
                  Terms of Service
                </Link>
              </li>
            </ul>
            <p className="mt-4 text-[11px] text-slate-400 dark:text-slate-500 leading-tight">
              Notice: Intended solely for personal use and content you are authorized to access and download.
            </p>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 dark:text-slate-400">
          <p>© {new Date().getFullYear()} InTube. A <span className="font-semibold text-slate-700 dark:text-slate-300">Nikhil Projects</span> initiative. All rights reserved.</p>
          <p className="text-center sm:text-right">Nikhil YT Downloader • Stateless • Zero Accounts • 100% Privacy</p>
        </div>
      </div>
    </footer>
  );
}
