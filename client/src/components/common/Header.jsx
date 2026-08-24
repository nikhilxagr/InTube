import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useTheme } from '../../hooks/useTheme.js';
import { KeyboardShortcutDialog } from './KeyboardShortcutDialog.jsx';
import { useKeyboardShortcuts } from '../../hooks/useKeyboardShortcuts.js';
import {
  Sun,
  Moon,
  Menu,
  X,
  PlaySquare,
  Youtube,
  Instagram,
  Wrench,
  HelpCircle,
  Keyboard,
  ChevronDown,
  Music,
  Film,
  Image as ImageIcon,
  Smartphone
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Register global shortcuts
  useKeyboardShortcuts({
    onToggleShortcuts: () => setShortcutsOpen((prev) => !prev),
    onEscape: () => {
      setShortcutsOpen(false);
      setToolsDropdownOpen(false);
      setMobileMenuOpen(false);
    }
  });

  const mainLinks = [
    { label: 'YouTube', path: ROUTES.YOUTUBE, icon: Youtube },
    { label: 'Instagram', path: ROUTES.INSTAGRAM, icon: Instagram },
    {
      label: 'Facebook',
      path: ROUTES.FACEBOOK,
      icon: (props) => (
        <svg {...props} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
        </svg>
      )
    },
    { label: 'How It Works', path: ROUTES.HOW_IT_WORKS, icon: PlaySquare },
    { label: 'FAQ', path: ROUTES.FAQ, icon: HelpCircle }
  ];

  const quickTools = [
    { label: 'Video → Audio', path: ROUTES.TOOLS_VIDEO_TO_AUDIO, icon: Music, desc: 'Extract MP3 / WAV' },
    { label: 'Video Converter', path: ROUTES.TOOLS_CONVERTER, icon: Film, desc: 'MP4 / WebM / MOV' },
    { label: 'Thumbnail Downloader', path: ROUTES.TOOLS_THUMBNAIL, icon: ImageIcon, desc: 'Official HD covers' },
    { label: 'QR Mobile Transfer', path: ROUTES.TOOLS_QR_TRANSFER, icon: Smartphone, desc: 'Direct to phone' }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  const isToolsActive = location.pathname.startsWith('/tools');

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/70 dark:border-slate-800/70 bg-white/80 dark:bg-slate-950/80 backdrop-blur-xl transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shadow-md transition-transform group-hover:scale-105"
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #ec4899 35%, #a855f7 65%, #3b82f6 100%)' }}
          >
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M10 8.5v7l6-3.5-6-3.5z" />
              <path d="M19.5 3H4.5A2.5 2.5 0 002 5.5v13A2.5 2.5 0 004.5 21h15a2.5 2.5 0 002.5-2.5v-13A2.5 2.5 0 0019.5 3zm.5 15.5a.5.5 0 01-.5.5H4.5a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5h15a.5.5 0 01.5.5v13z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            In<span className="text-gradient-tri">Tube</span>
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-1.5">
          {/* Tools Menu with Dropdown */}
          <div
            className="relative"
            onMouseEnter={() => setToolsDropdownOpen(true)}
            onMouseLeave={() => setToolsDropdownOpen(false)}
          >
            <Link
              to={ROUTES.TOOLS}
              className={`px-3 py-1.5 text-sm font-semibold rounded-xl transition-all flex items-center gap-1.5 ${
                isToolsActive
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 border border-purple-200/60 dark:border-purple-800/60 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
              }`}
            >
              <Wrench className="w-4 h-4 text-purple-500" />
              <span>Tools</span>
              <span className="px-1.5 py-0.2 rounded-md bg-purple-500/10 text-purple-600 dark:text-purple-400 text-[10px] font-bold">
                New
              </span>
              <ChevronDown className="w-3.5 h-3.5 opacity-60 ml-0.5" />
            </Link>

            {toolsDropdownOpen && (
              <div className="absolute top-full left-0 w-64 pt-2 animate-fadeIn z-50">
                <div className="p-2 rounded-2xl bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl backdrop-blur-2xl space-y-1">
                  <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    Media Utilities
                  </div>
                  {quickTools.map((qt) => (
                    <Link
                      key={qt.path}
                      to={qt.path}
                      onClick={() => setToolsDropdownOpen(false)}
                      className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors group"
                    >
                      <div className="w-7 h-7 rounded-lg bg-purple-50 dark:bg-purple-950 text-purple-600 dark:text-purple-400 flex items-center justify-center shrink-0">
                        <qt.icon className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="font-bold text-slate-800 dark:text-slate-200 group-hover:text-purple-600 dark:group-hover:text-purple-400">
                          {qt.label}
                        </div>
                        <div className="text-[10px] text-slate-400">{qt.desc}</div>
                      </div>
                    </Link>
                  ))}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                    <Link
                      to={ROUTES.TOOLS}
                      onClick={() => setToolsDropdownOpen(false)}
                      className="block px-3 py-2 text-center text-xs font-bold text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/50 rounded-xl transition-colors"
                    >
                      Explore All Tools →
                    </Link>
                  </div>
                </div>
              </div>
            )}
          </div>

          {mainLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3 py-1.5 text-sm font-medium rounded-xl transition-all flex items-center gap-1.5 ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 border border-blue-200/60 dark:border-blue-800/60 font-semibold shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/70 dark:hover:bg-slate-800/70'
                }`}
              >
                <item.icon className="w-4 h-4 opacity-75" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-2.5">
          {/* Keyboard Shortcuts Trigger */}
          <button
            type="button"
            onClick={() => setShortcutsOpen(true)}
            title="Keyboard Shortcuts (?)"
            aria-label="Keyboard shortcuts guide"
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-medium transition-all shadow-sm"
          >
            <Keyboard className="w-3.5 h-3.5 text-purple-500" />
            <span className="font-mono text-[10px] bg-slate-200/70 dark:bg-slate-800 px-1 py-0.2 rounded font-bold">?</span>
          </button>

          {/* Theme Toggle */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-50/80 dark:bg-slate-900/80 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all shadow-sm"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 backdrop-blur-xl px-4 pt-3 pb-5 space-y-2 shadow-xl">
          <Link
            to={ROUTES.TOOLS}
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between p-3 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 font-bold text-sm border border-purple-200 dark:border-purple-800"
          >
            <span className="flex items-center gap-2.5">
              <Wrench className="w-4 h-4 text-purple-500" />
              <span>Media Toolbox (All Tools)</span>
            </span>
            <span className="px-2 py-0.5 rounded-md bg-purple-600 text-white text-[10px]">
              New
            </span>
          </Link>

          <div className="grid grid-cols-2 gap-2 pt-1">
            {quickTools.map((qt) => (
              <Link
                key={qt.path}
                to={qt.path}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-100/70 dark:bg-slate-800/70 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-purple-50 dark:hover:bg-purple-950"
              >
                <qt.icon className="w-3.5 h-3.5 text-purple-500 shrink-0" />
                <span className="truncate">{qt.label}</span>
              </Link>
            ))}
          </div>

          <div className="border-t border-slate-200 dark:border-slate-800 pt-2 space-y-1">
            {mainLinks.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-3 py-2 rounded-xl text-sm font-medium transition-colors ${
                  isActive(item.path)
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 font-semibold'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <item.icon className="w-4 h-4 opacity-80" />
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />
    </header>
  );
}
