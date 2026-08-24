import { useEffect } from 'react';
import { Keyboard, X, Sparkles } from 'lucide-react';
import { Card } from './Card.jsx';
import { Button } from './Button.jsx';

export function KeyboardShortcutDialog({ isOpen, onClose }) {
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    {
      action: 'Paste Media URL',
      keys: [`${modKey}`, 'V'],
      description: 'Auto-populates the URL input from clipboard'
    },
    {
      action: 'Analyze URL',
      keys: ['Enter'],
      description: 'Triggers media metadata analysis when input is focused'
    },
    {
      action: 'Primary Action',
      keys: [`${modKey}`, 'Enter'],
      description: 'Triggers primary download, conversion, or extraction'
    },
    {
      action: 'Dismiss / Close',
      keys: ['Esc'],
      description: 'Closes active modals, previews, or clear error states'
    },
    {
      action: 'Shortcuts Guide',
      keys: ['?'],
      description: 'Toggles this keyboard shortcuts reference dialog'
    }
  ];

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="shortcuts-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div
        className="fixed inset-0"
        onClick={onClose}
        aria-hidden="true"
      />

      <Card className="relative z-10 w-full max-w-lg p-6 sm:p-7 space-y-6 bg-white/95 dark:bg-slate-900/95 border border-slate-200/80 dark:border-slate-800/80 rounded-3xl shadow-2xl backdrop-blur-2xl">
        <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 dark:text-purple-400 border border-purple-200/70 dark:border-purple-800/70 flex items-center justify-center shadow-sm">
              <Keyboard className="w-5 h-5" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="font-extrabold text-base sm:text-lg text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Speed up your media workflow
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close shortcuts dialog"
            className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-2.5">
          {shortcuts.map((s, idx) => (
            <div
              key={idx}
              className="p-3 rounded-xl bg-slate-50/80 dark:bg-slate-950/60 border border-slate-200/60 dark:border-slate-800/60 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="font-bold text-xs sm:text-sm text-slate-900 dark:text-white">
                  {s.action}
                </p>
                <p className="text-[11px] text-slate-400 truncate">
                  {s.description}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                {s.keys.map((k, kIdx) => (
                  <kbd
                    key={kIdx}
                    className="px-2.5 py-1 text-xs font-mono font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-lg shadow-sm"
                  >
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>

        <div className="pt-2 flex items-center justify-between border-t border-slate-100 dark:border-slate-800 text-xs text-slate-400">
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-purple-500" />
            <span>Universal Media Toolkit Hotkeys</span>
          </span>

          <Button size="sm" variant="outline" onClick={onClose} className="text-xs">
            Got it
          </Button>
        </div>
      </Card>
    </div>
  );
}
