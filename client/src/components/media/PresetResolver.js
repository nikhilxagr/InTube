export const PRESET_KEYS = {
  SMART: 'smart',
  BEST_QUALITY: 'best_quality',
  MOBILE: 'mobile',
  AUDIO: 'audio',
  SMALL_FILE: 'small_file'
};

export const PRESET_DEFINITIONS = [
  {
    key: PRESET_KEYS.SMART,
    label: 'Smart',
    description: 'Balanced 1080p/720p HD with optimal file size'
  },
  {
    key: PRESET_KEYS.BEST_QUALITY,
    label: 'Best Quality',
    description: 'Highest available resolution (4K, 2K, 1080p Full HD)'
  },
  {
    key: PRESET_KEYS.MOBILE,
    label: 'Mobile',
    description: '720p/1080p MP4 lightweight stream for smartphones'
  },
  {
    key: PRESET_KEYS.AUDIO,
    label: 'Audio Only',
    description: 'High-bitrate MP3 or M4A audio track'
  },
  {
    key: PRESET_KEYS.SMALL_FILE,
    label: 'Small File',
    description: '480p/360p compact size for quick saving or low bandwidth'
  }
];

const PRESET_STORAGE_KEY = 'intube_download_preset';

export const PresetResolver = {
  /**
   * Retrieves saved preset from localStorage.
   * @returns {string}
   */
  getSavedPreset() {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = localStorage.getItem(PRESET_STORAGE_KEY);
        if (saved && Object.values(PRESET_KEYS).includes(saved)) {
          return saved;
        }
      }
    } catch {
      // Ignore localStorage read errors
    }
    return PRESET_KEYS.SMART;
  },

  /**
   * Saves preset to localStorage.
   * @param {string} key
   */
  savePreset(key) {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        localStorage.setItem(PRESET_STORAGE_KEY, key);
      }
    } catch {
      // Ignore localStorage write errors
    }
  },

  /**
   * Resolves a preset to an authentic available format from provider formats list.
   * @param {string} presetKey
   * @param {Array} formats
   * @returns {object|null}
   */
  resolvePreset(presetKey, formats = []) {
    if (!formats || formats.length === 0) return null;

    const videoFormats = formats.filter((f) => f.type === 'video');
    const audioFormats = formats.filter((f) => f.type === 'audio');

    switch (presetKey) {
      case PRESET_KEYS.AUDIO: {
        // Prefer MP3 then M4A
        const mp3 = audioFormats.find((f) => f.container === 'mp3');
        if (mp3) return mp3;
        const anyAudio = audioFormats[0];
        if (anyAudio) return anyAudio;
        // Fallback to lowest video if no audio format
        return videoFormats[videoFormats.length - 1] || formats[0];
      }

      case PRESET_KEYS.BEST_QUALITY: {
        // Highest height video
        if (videoFormats.length > 0) {
          const sorted = [...videoFormats].sort((a, b) => (b.height || 0) - (a.height || 0));
          return sorted[0];
        }
        return formats[0];
      }

      case PRESET_KEYS.MOBILE: {
        // Prefer 720p, then 1080p, then first available video
        const fmt720 = videoFormats.find((f) => f.height === 720);
        if (fmt720) return fmt720;
        const fmt1080 = videoFormats.find((f) => f.height === 1080);
        if (fmt1080) return fmt1080;
        return videoFormats[0] || formats[0];
      }

      case PRESET_KEYS.SMALL_FILE: {
        // Lowest height video (480p, 360p, etc.)
        if (videoFormats.length > 0) {
          const sorted = [...videoFormats].sort((a, b) => (a.height || 9999) - (b.height || 9999));
          return sorted[0];
        }
        return audioFormats[0] || formats[0];
      }

      case PRESET_KEYS.SMART:
      default: {
        // Smart: Prefer 1080p, fallback to 720p, fallback to highest available video
        const fmt1080 = videoFormats.find((f) => f.height === 1080);
        if (fmt1080) return fmt1080;
        const fmt720 = videoFormats.find((f) => f.height === 720);
        if (fmt720) return fmt720;
        return videoFormats[0] || formats[0];
      }
    }
  }
};
