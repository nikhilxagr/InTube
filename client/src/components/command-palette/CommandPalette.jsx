import { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  Download,
  Music,
  Film,
  Image as ImageIcon,
  Layers,
  TrendingDown,
  Smartphone,
  Info,
  Shield,
  Keyboard,
  Sun,
  Moon,
  Compass
} from 'lucide-react';
import { ROUTES } from '../../constants/routes.js';
import { useTheme } from '../../hooks/useTheme.js';

export function CommandPalette({ isOpen, onClose, onOpenShortcuts }) {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const commands = useMemo(() => [
    // Navigation / Downloaders
    {
      id: 'universal-downloader',
      title: 'Universal Downloader',
      description: 'Download video/audio from YouTube, Instagram, Facebook',
      category: 'Downloaders',
      icon: Download,
      action: () => navigate(ROUTES.HOME)
    },
    {
      id: 'batch-downloader',
      title: 'Batch URL Downloader',
      description: 'Analyze and download multiple URLs in a single queue',
      category: 'Downloaders',
      icon: Layers,
      action: () => navigate(ROUTES.TOOLS_BATCH || '/tools/batch')
    },
    {
      id: 'tools-dashboard',
      title: 'Media Toolbox',
      description: 'Explore all video, audio, and image utilities',
      category: 'Navigation',
      icon: Compass,
      action: () => navigate(ROUTES.TOOLS)
    },

    // Video Tools
    {
      id: 'video-converter',
      title: 'Video Format Converter',
      description: 'Convert local videos to MP4, WebM, or MOV',
      category: 'Video Tools',
      icon: Film,
      action: () => navigate(ROUTES.TOOLS_CONVERTER)
    },
    {
      id: 'video-to-audio',
      title: 'Video → Audio Extractor',
      description: 'Extract MP3, M4A, WAV, or OGG audio from video',
      category: 'Video Tools',
      icon: Music,
      action: () => navigate(ROUTES.TOOLS_VIDEO_TO_AUDIO)
    },
    {
      id: 'video-to-image',
      title: 'Video → Image Frames',
      description: 'Extract single frames or intervals to JPG/PNG/ZIP',
      category: 'Video Tools',
      icon: ImageIcon,
      action: () => navigate(ROUTES.TOOLS_VIDEO_TO_IMAGE || '/tools/video-to-image')
    },

    // Audio Tools
    {
      id: 'audio-converter',
      title: 'Audio Converter',
      description: 'Convert between MP3, M4A, WAV, AAC, and OGG formats',
      category: 'Audio Tools',
      icon: Music,
      action: () => navigate(ROUTES.TOOLS_AUDIO_CONVERTER || '/tools/audio-converter')
    },

    // Image Tools
    {
      id: 'image-tools',
      title: 'Image Tools Suite',
      description: 'Convert, compress, and resize images',
      category: 'Image Tools',
      icon: ImageIcon,
      action: () => navigate(ROUTES.TOOLS_IMAGE || '/tools/image')
    },
    {
      id: 'image-convert',
      title: 'Image Converter',
      description: 'Convert images to JPG, PNG, WebP, or AVIF',
      category: 'Image Tools',
      icon: ImageIcon,
      action: () => navigate('/tools/image/convert')
    },
    {
      id: 'image-compress',
      title: 'Image Compressor',
      description: 'Reduce image file size with lossless/lossy compression',
      category: 'Image Tools',
      icon: TrendingDown,
      action: () => navigate('/tools/image/compress')
    },
    {
      id: 'image-resize',
      title: 'Image Resizer',
      description: 'Resize dimensions while maintaining aspect ratio',
      category: 'Image Tools',
      icon: Layers,
      action: () => navigate('/tools/image/resize')
    },
    {
      id: 'thumbnail-downloader',
      title: 'HD Thumbnail Downloader',
      description: 'Download maximum resolution cover images',
      category: 'Image Tools',
      icon: ImageIcon,
      action: () => navigate(ROUTES.TOOLS_THUMBNAIL)
    },

    // Utilities & Privacy
    {
      id: 'qr-transfer',
      title: 'QR Mobile Transfer',
      description: 'Beam media directly to your phone via single-use QR token',
      category: 'Utilities',
      icon: Smartphone,
      action: () => navigate(ROUTES.TOOLS_QR_TRANSFER)
    },
    {
      id: 'media-metadata',
      title: 'Media Metadata Inspector',
      description: 'Inspect codecs, bitrate, sample rates, channels & resolution',
      category: 'Utilities',
      icon: Info,
      action: () => navigate(ROUTES.TOOLS_METADATA)
    },
    {
      id: 'privacy-dashboard',
      title: 'Privacy by Design',
      description: 'Learn about stateless media processing & auto-cleanup',
      category: 'Privacy',
      icon: Shield,
      action: () => navigate(ROUTES.PRIVACY || '/privacy')
    },

    // System Actions
    {
      id: 'toggle-theme',
      title: `Switch to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`,
      description: 'Toggle UI color theme',
      category: 'System',
      icon: theme === 'dark' ? Sun : Moon,
      action: () => toggleTheme()
    },
    {
      id: 'keyboard-shortcuts',
      title: 'Keyboard Shortcuts Helper',
      description: 'View all keyboard shortcuts and hotkeys',
      category: 'System',
      icon: Keyboard,
      action: () => onOpenShortcuts && onOpenShortcuts()
    }
  ], [navigate, theme, toggleTheme, onOpenShortcuts]);

  // Filter commands by fuzzy match on title, description, or category
  const filteredCommands = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return commands;
    return commands.filter(
      (cmd) =>
        cmd.title.toLowerCase().includes(q) ||
        cmd.description.toLowerCase().includes(q) ||
        cmd.category.toLowerCase().includes(q)
    );
  }, [commands, query]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Auto-focus input when opened
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Keyboard navigation
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % (filteredCommands.length || 1));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + (filteredCommands.length || 1)) % (filteredCommands.length || 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filteredCommands[selectedIndex]) {
          filteredCommands[selectedIndex].action();
          onClose();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filteredCommands, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Command Palette"
      className="fixed inset-0 z-50 flex items-start justify-center pt-16 sm:pt-24 p-4 bg-black/75 backdrop-blur-md animate-fadeIn"
    >
      <div className="fixed inset-0" onClick={onClose} />

      <div className="relative z-10 w-full max-w-xl bg-slate-900 border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
        {/* Search Input */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 bg-slate-950/60">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command or search tools (e.g., audio, convert, privacy)..."
            className="w-full bg-transparent text-white placeholder-slate-500 text-sm focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono bg-slate-800 text-slate-400 rounded border border-slate-700">
            ESC
          </kbd>
        </div>

        {/* Command List */}
        <div ref={listRef} className="overflow-y-auto p-2 space-y-1 divide-y divide-slate-800/40">
          {filteredCommands.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-sm">
              No matching tools or actions found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            filteredCommands.map((cmd, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = cmd.icon;

              return (
                <button
                  key={cmd.id}
                  type="button"
                  onClick={() => {
                    cmd.action();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between p-3 rounded-xl text-left transition-all ${
                    isSelected
                      ? 'bg-blue-600/20 border border-blue-500/40 text-white'
                      : 'text-slate-300 hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-blue-500 text-white shadow-md shadow-blue-500/30'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="font-semibold text-sm truncate flex items-center gap-2">
                        <span>{cmd.title}</span>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800/80 text-slate-400 border border-slate-700/50">
                          {cmd.category}
                        </span>
                      </div>
                      <div className="text-xs text-slate-400 truncate mt-0.5">
                        {cmd.description}
                      </div>
                    </div>
                  </div>

                  <span className="text-xs text-slate-500 font-mono hidden sm:inline ml-2">
                    ↵
                  </span>
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span>InTube Command Center</span>
        </div>
      </div>
    </div>
  );
}
