import { useEffect, useCallback } from 'react';

/**
 * Custom hook for keyboard shortcut workflows.
 * @param {object} handlers
 * @param {Function} [handlers.onPasteUrl] - Called with clipboard URL on Ctrl/Cmd+V when not inside an input
 * @param {Function} [handlers.onPrimaryAction] - Called on Ctrl/Cmd+Enter
 * @param {Function} [handlers.onEscape] - Called on Escape
 * @param {Function} [handlers.onToggleShortcuts] - Called on '?'
 */
export function useKeyboardShortcuts({
  onPasteUrl,
  onPrimaryAction,
  onEscape,
  onToggleShortcuts,
  onOpenCommandPalette
} = {}) {
  const handleKeyDown = useCallback(
    async (e) => {
      const isMac = typeof navigator !== 'undefined' && /Mac|iPod|iPhone|iPad/.test(navigator.platform);
      const isModifier = isMac ? e.metaKey : e.ctrlKey;
      const target = e.target;
      const isInputFocused =
        target instanceof HTMLInputElement ||
        target instanceof HTMLTextAreaElement ||
        target.isContentEditable;

      // Ctrl/Cmd + K -> Open Command Palette
      if (isModifier && (e.key === 'k' || e.key === 'K')) {
        if (onOpenCommandPalette) {
          e.preventDefault();
          onOpenCommandPalette();
        }
        return;
      }

      // Escape -> close dialogs / cancel
      if (e.key === 'Escape') {
        if (onEscape) {
          e.preventDefault();
          onEscape();
        }
        return;
      }

      // '?' -> toggle shortcut help (only when not focused in input)
      if (e.key === '?' && !isInputFocused && !e.ctrlKey && !e.metaKey && !e.altKey) {
        if (onToggleShortcuts) {
          e.preventDefault();
          onToggleShortcuts();
        }
        return;
      }

      // Ctrl/Cmd + Enter -> Primary Action
      if (isModifier && e.key === 'Enter') {
        if (onPrimaryAction) {
          e.preventDefault();
          onPrimaryAction();
        }
        return;
      }

      // Ctrl/Cmd + V -> Paste URL into downloader if not in an input
      if (isModifier && (e.key === 'v' || e.key === 'V') && !isInputFocused) {
        if (onPasteUrl && navigator.clipboard && navigator.clipboard.readText) {
          try {
            const text = await navigator.clipboard.readText();
            if (text && text.trim().startsWith('http')) {
              e.preventDefault();
              onPasteUrl(text.trim());
            }
          } catch {
            // Clipboard permission denied or unavailable
          }
        }
      }
    },
    [onPasteUrl, onPrimaryAction, onEscape, onToggleShortcuts, onOpenCommandPalette]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleKeyDown]);
}
