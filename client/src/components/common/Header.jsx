import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { useTheme } from '../../hooks/useTheme.js';
import { KeyboardShortcutDialog } from './KeyboardShortcutDialog.jsx';
import { CommandPalette } from '../command-palette/CommandPalette.jsx';
import { InstallAppButton } from './InstallAppButton.jsx';
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
  ChevronDown,
  Music,
  Film,
  Image as ImageIcon,
  Smartphone,
  Search,
  Layers,
  Shield
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [toolsDropdownOpen, setToolsDropdownOpen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [commandPaletteOpen, setCommandPaletteOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  // Register global shortcuts
  useKeyboardShortcuts({
    onToggleShortcuts: () => setShortcutsOpen((prev) => !prev),
    onOpenCommandPalette: () => setCommandPaletteOpen((prev) => !prev),
    onEscape: () => {
      setShortcutsOpen(false);
      setCommandPaletteOpen(false);
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
    { label: 'Batch Downloader', path: ROUTES.TOOLS_BATCH, icon: Layers, desc: 'Multi-URL queue' },
    { label: 'Video → Audio', path: ROUTES.TOOLS_VIDEO_TO_AUDIO, icon: Music, desc: 'Extract MP3 / WAV' },
    { label: 'Audio Converter', path: ROUTES.TOOLS_AUDIO_CONVERTER, icon: Music, desc: 'Convert audio types' },
    { label: 'Video Converter', path: ROUTES.TOOLS_CONVERTER, icon: Film, desc: 'MP4 / WebM / MOV' },
    { label: 'Video → Frames', path: ROUTES.TOOLS_VIDEO_TO_IMAGE, icon: ImageIcon, desc: 'Extract JPG / ZIP' },
    { label: 'Image Tools', path: ROUTES.TOOLS_IMAGE, icon: ImageIcon, desc: 'Compress, convert, resize' },
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 shrink-0 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-purple-600 to-pink-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform duration-200">
            <PlaySquare className="w-5 h-5 fill-white/20" />
          </div>
          <div className="flex flex-col">
            <span className="font-black text-lg sm:text-xl tracking-tight bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 dark:from-white dark:via-blue-200 dark:to-white bg-clip-text text-transparent">
              InTube
            </span>
            <span className="text-[10px] font-semibold tracking-wider text-blue-600 dark:text-blue-400 uppercase -mt-1">
              Media Toolkit
            </span>
          </div>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-1.5" aria-label="Main Navigation">
          {mainLinks.map((link) => {
            const active = isActive(link.path);
            const Icon = link.icon;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                  active
                    ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50 shadow-sm'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{link.label}</span>
              </Link>
            );
          })}

          {/* Tools Mega Dropdown */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setToolsDropdownOpen((prev) => !prev)}
              onBlur={() => setTimeout(() => setToolsDropdownOpen(false), 200)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-semibold transition-all ${
                isToolsActive || toolsDropdownOpen
                  ? 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-950/50 shadow-sm'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Wrench className="w-4 h-4" />
              <span>Tools</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${toolsDropdownOpen ? 'rotate-180' : ''}`} />
            </button>

            {toolsDropdownOpen && (
              <div className="absolute right-0 mt-2 w-72 p-2 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200/80 dark:border-slate-800/80 backdrop-blur-xl z-50 animate-fadeIn">
                <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800/80 mb-1 flex items-center justify-between">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">Media Utilities</span>
                  <Link
                    to={ROUTES.TOOLS}
                    onClick={() => setToolsDropdownOpen(false)}
                    className="text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
                  >
                    View All →
                  </Link>
                </div>

                <div className="space-y-1 max-h-80 overflow-y-auto">
                  {quickTools.map((t) => {
                    const Icon = t.icon;
                    return (
                      <Link
                        key={t.path}
                        to={t.path}
                        onClick={() => setToolsDropdownOpen(false)}
                        className="flex items-start gap-2.5 p-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors group"
                      >
                        <div className="w-8 h-8 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
                          <Icon className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-slate-800 dark:text-slate-200 group-hover:text-blue-600 dark:group-hover:text-blue-400">
                            {t.label}
                          </div>
                          <div className="text-[10px] text-slate-400 truncate">
                            {t.desc}
                          </div>
                        </div>
                      </Link>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Command Palette Trigger Button (Visible on Mobile & Desktop) */}
          <button
            type="button"
            onClick={() => setCommandPaletteOpen(true)}
            className="flex items-center gap-2 px-2.5 py-1.5 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-slate-100/60 dark:bg-slate-900/60 text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:border-slate-300 dark:hover:border-slate-700 transition-all text-xs font-medium"
            title="Search tools (Ctrl+K)"
            aria-label="Open search command palette"
          >
            <Search className="w-4 h-4 sm:w-3.5 sm:h-3.5 text-blue-500" />
            <span className="hidden md:inline text-[11px] text-slate-500 dark:text-slate-400">Search tools...</span>
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 text-slate-500 rounded border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-600" />}
          </button>

          {/* Mobile Menu Button */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="lg:hidden p-2 rounded-xl text-slate-600 hover:text-slate-900 dark:text-slate-300 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl px-4 py-5 space-y-4 animate-fadeIn">
          {/* Mobile Command Palette Button */}
          <button
            type="button"
            onClick={() => {
              setMobileMenuOpen(false);
              setCommandPaletteOpen(true);
            }}
            className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-100 dark:bg-slate-900 text-slate-600 dark:text-slate-300 text-xs font-semibold hover:bg-slate-200/70 dark:hover:bg-slate-800/70 transition-colors"
          >
            <span className="flex items-center gap-2">
              <Search className="w-4 h-4 text-blue-500" /> Search Tools & Features
            </span>
            <kbd className="px-1.5 py-0.5 text-[10px] font-mono bg-white dark:bg-slate-800 rounded border border-slate-200 dark:border-slate-700">
              ⌘K
            </kbd>
          </button>

          {/* Mobile PWA Install Button inside hamburger drawer */}
          <div>
            <InstallAppButton className="w-full justify-center py-2.5 shadow-sm" variant="outline" size="md" />
          </div>

          <div className="space-y-1">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 px-3">
              Media Platforms
            </span>
            {mainLinks.map((link) => {
              const active = isActive(link.path);
              const Icon = link.icon;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                    active
                      ? 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/50'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{link.label}</span>
                </Link>
              );
            })}
          </div>

          <div className="space-y-1 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between px-3 mb-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Media Toolbox
              </span>
              <Link
                to={ROUTES.TOOLS}
                onClick={() => setMobileMenuOpen(false)}
                className="text-[10px] font-bold text-blue-600 dark:text-blue-400 hover:underline"
              >
                All Tools →
              </Link>
            </div>

            <div className="grid grid-cols-2 gap-1.5">
              {quickTools.map((t) => {
                const Icon = t.icon;
                return (
                  <Link
                    key={t.path}
                    to={t.path}
                    onClick={() => setMobileMenuOpen(false)}
                    className="flex items-center gap-2 p-2.5 rounded-xl text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
                  >
                    <Icon className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                    <span className="truncate">{t.label}</span>
                  </Link>
                );
              })}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between px-1 text-xs text-slate-500">
            <Link
              to={ROUTES.PRIVACY}
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 hover:text-slate-900 dark:hover:text-white"
            >
              <Shield className="w-3.5 h-3.5" /> Privacy & Terms
            </Link>

            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                setShortcutsOpen(true);
              }}
              className="hover:text-slate-900 dark:hover:text-white"
            >
              Shortcuts (?)
            </button>
          </div>
        </div>
      )}

      {/* Keyboard Shortcuts Dialog */}
      <KeyboardShortcutDialog
        isOpen={shortcutsOpen}
        onClose={() => setShortcutsOpen(false)}
      />

      {/* Command Palette Modal */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onOpenShortcuts={() => {
          setCommandPaletteOpen(false);
          setShortcutsOpen(true);
        }}
      />
    </header>
  );
}
