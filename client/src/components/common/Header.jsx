import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ROUTES } from '../../constants/routes.js';
import { HealthBadge } from './HealthBadge.jsx';
import { useTheme } from '../../hooks/useTheme.js';
import {
  Sun,
  Moon,
  Menu,
  X,
  PlaySquare,
  Youtube,
  Instagram,
  Wrench,
  HelpCircle
} from 'lucide-react';

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isDark, toggleTheme } = useTheme();
  const location = useLocation();

  const navLinks = [
    { label: 'YouTube', path: ROUTES.YOUTUBE, icon: Youtube },
    { label: 'Instagram', path: ROUTES.INSTAGRAM, icon: Instagram },
    { label: 'Tools', path: ROUTES.TOOLS, icon: Wrench },
    { label: 'How It Works', path: ROUTES.HOW_IT_WORKS, icon: PlaySquare },
    { label: 'FAQ', path: ROUTES.FAQ, icon: HelpCircle }
  ];

  const isActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 dark:border-slate-800/80 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand */}
        <Link to={ROUTES.HOME} className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm transition-transform group-hover:scale-105">
            <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
              <path d="M10 8.5v7l6-3.5-6-3.5z" />
              <path d="M19.5 3H4.5A2.5 2.5 0 002 5.5v13A2.5 2.5 0 004.5 21h15a2.5 2.5 0 002.5-2.5v-13A2.5 2.5 0 0019.5 3zm.5 15.5a.5.5 0 01-.5.5H4.5a.5.5 0 01-.5-.5v-13a.5.5 0 01.5-.5h15a.5.5 0 01.5.5v13z" />
            </svg>
          </div>
          <span className="font-extrabold text-xl tracking-tight text-slate-900 dark:text-white">
            In<span className="text-brand-600 dark:text-brand-400">Tube</span>
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-1">
          {navLinks.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`px-3.5 py-2 text-sm font-medium rounded-lg transition-colors flex items-center gap-1.5 ${
                  active
                    ? 'text-brand-600 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/40 font-semibold'
                    : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100/60 dark:hover:bg-slate-800/60'
                }`}
              >
                <item.icon className="w-4 h-4 opacity-70" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Right Utility & Mobile Menu Button */}
        <div className="flex items-center gap-3">
          <HealthBadge />

          {/* Theme Toggle Button */}
          <button
            type="button"
            onClick={toggleTheme}
            aria-label="Toggle theme"
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-slate-700" />}
          </button>

          {/* Mobile hamburger */}
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle navigation menu"
            className="md:hidden p-2 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 dark:border-slate-800 bg-white/95 dark:bg-slate-900/95 px-4 pt-2 pb-4 space-y-1">
          {navLinks.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              onClick={() => setMobileMenuOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium ${
                isActive(item.path)
                  ? 'text-brand-600 dark:text-brand-400 bg-brand-50/60 dark:bg-brand-950/40 font-semibold'
                  : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              <item.icon className="w-4 h-4 opacity-80" />
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  );
}
