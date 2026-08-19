/**
 * Supported platform identifiers
 */
export const PLATFORMS = {
  YOUTUBE: 'youtube',
  INSTAGRAM: 'instagram',
  FACEBOOK: 'facebook',
  UNKNOWN: 'unknown'
};

/**
 * Media sub-type identifiers
 */
export const MEDIA_TYPES = {
  VIDEO: 'video',
  SHORTS: 'shorts',
  REEL: 'reel',
  STORY: 'story',
  POST: 'post',
  AUDIO: 'audio',
  UNKNOWN: 'unknown'
};

/**
 * Detects the platform and extracts normalized structural metadata from a parsed URL.
 * @param {URL} parsedUrl
 * @returns {{ platform: string, mediaType: string, mediaId: string | null, isSupported: boolean }}
 */
export function detectPlatformDetails(parsedUrl) {
  if (!parsedUrl || !parsedUrl.hostname) {
    return {
      platform: PLATFORMS.UNKNOWN,
      mediaType: MEDIA_TYPES.UNKNOWN,
      mediaId: null,
      isSupported: false
    };
  }

  const hostname = parsedUrl.hostname.toLowerCase();
  const pathname = parsedUrl.pathname;

  // 1. YouTube Detection
  if (
    hostname === 'youtube.com' ||
    hostname.endsWith('.youtube.com') ||
    hostname === 'youtu.be' ||
    hostname.endsWith('.youtu.be')
  ) {
    // youtu.be/<id>
    if (hostname === 'youtu.be' || hostname.endsWith('.youtu.be')) {
      const mediaId = pathname.replace(/^\/+/, '').split('/')[0] || null;
      return {
        platform: PLATFORMS.YOUTUBE,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId,
        isSupported: Boolean(mediaId && mediaId.length >= 5)
      };
    }

    // /shorts/<id>
    if (pathname.startsWith('/shorts/')) {
      const mediaId = pathname.slice('/shorts/'.length).split('/')[0] || null;
      return {
        platform: PLATFORMS.YOUTUBE,
        mediaType: MEDIA_TYPES.SHORTS,
        mediaId,
        isSupported: Boolean(mediaId && mediaId.length >= 5)
      };
    }

    // /watch?v=<id>
    if (pathname === '/watch' || pathname.startsWith('/watch/')) {
      const mediaId = parsedUrl.searchParams.get('v');
      return {
        platform: PLATFORMS.YOUTUBE,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId: mediaId || null,
        isSupported: Boolean(mediaId && mediaId.length >= 5)
      };
    }

    // /embed/<id> or /v/<id>
    if (pathname.startsWith('/embed/') || pathname.startsWith('/v/')) {
      const parts = pathname.split('/').filter(Boolean);
      const mediaId = parts[1] || null;
      return {
        platform: PLATFORMS.YOUTUBE,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId,
        isSupported: Boolean(mediaId && mediaId.length >= 5)
      };
    }

    return {
      platform: PLATFORMS.YOUTUBE,
      mediaType: MEDIA_TYPES.UNKNOWN,
      mediaId: null,
      isSupported: false
    };
  }

  // 2. Instagram Detection
  if (
    hostname === 'instagram.com' ||
    hostname.endsWith('.instagram.com') ||
    hostname === 'instagr.am' ||
    hostname.endsWith('.instagr.am')
  ) {
    // /reel/<id> or /reels/<id>
    if (pathname.startsWith('/reel/') || pathname.startsWith('/reels/')) {
      const parts = pathname.split('/').filter(Boolean);
      const mediaId = parts[1] || null;
      return {
        platform: PLATFORMS.INSTAGRAM,
        mediaType: MEDIA_TYPES.REEL,
        mediaId,
        isSupported: Boolean(mediaId && mediaId.length >= 3)
      };
    }

    // /p/<id>
    if (pathname.startsWith('/p/')) {
      const parts = pathname.split('/').filter(Boolean);
      const mediaId = parts[1] || null;
      return {
        platform: PLATFORMS.INSTAGRAM,
        mediaType: MEDIA_TYPES.POST,
        mediaId,
        isSupported: Boolean(mediaId && mediaId.length >= 3)
      };
    }

    // /stories/<username>/<id>
    if (pathname.startsWith('/stories/')) {
      const parts = pathname.split('/').filter(Boolean);
      const mediaId = parts[2] || parts[1] || null;
      return {
        platform: PLATFORMS.INSTAGRAM,
        mediaType: MEDIA_TYPES.STORY,
        mediaId,
        isSupported: Boolean(mediaId)
      };
    }

    // /tv/<id>
    if (pathname.startsWith('/tv/')) {
      const parts = pathname.split('/').filter(Boolean);
      const mediaId = parts[1] || null;
      return {
        platform: PLATFORMS.INSTAGRAM,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId,
        isSupported: Boolean(mediaId && mediaId.length >= 3)
      };
    }

    return {
      platform: PLATFORMS.INSTAGRAM,
      mediaType: MEDIA_TYPES.UNKNOWN,
      mediaId: null,
      isSupported: false
    };
  }

  // 3. Facebook Detection
  if (
    hostname === 'facebook.com' ||
    hostname.endsWith('.facebook.com') ||
    hostname === 'fb.watch' ||
    hostname.endsWith('.fb.watch') ||
    hostname === 'fb.com' ||
    hostname.endsWith('.fb.com')
  ) {
    // fb.watch/<shortcode> — short share links
    if (hostname === 'fb.watch' || hostname.endsWith('.fb.watch')) {
      const shortcode = pathname.replace(/^\/+/, '').split('/')[0] || null;
      return {
        platform: PLATFORMS.FACEBOOK,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId: shortcode,
        isSupported: Boolean(shortcode)
      };
    }

    // /reel/<id> — Facebook Reels
    if (pathname.startsWith('/reel/')) {
      const parts = pathname.split('/').filter(Boolean);
      const mediaId = parts[1] || null;
      return {
        platform: PLATFORMS.FACEBOOK,
        mediaType: MEDIA_TYPES.REEL,
        mediaId,
        isSupported: Boolean(mediaId)
      };
    }

    // /videos/<id> or /<page>/videos/<id>
    const videoMatch = pathname.match(/\/videos\/(?:.*?\/)?([0-9]+)/);
    if (videoMatch) {
      return {
        platform: PLATFORMS.FACEBOOK,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId: videoMatch[1],
        isSupported: true
      };
    }

    // ?v=<id> query param
    const vParam = parsedUrl.searchParams.get('v') || parsedUrl.searchParams.get('story_fbid');
    if (vParam) {
      return {
        platform: PLATFORMS.FACEBOOK,
        mediaType: MEDIA_TYPES.VIDEO,
        mediaId: vParam,
        isSupported: true
      };
    }

    // Generic Facebook URL — let yt-dlp try it
    return {
      platform: PLATFORMS.FACEBOOK,
      mediaType: MEDIA_TYPES.VIDEO,
      mediaId: pathname,
      isSupported: true
    };
  }

  return {
    platform: PLATFORMS.UNKNOWN,
    mediaType: MEDIA_TYPES.UNKNOWN,
    mediaId: null,
    isSupported: false
  };
}

/**
 * Quick platform identifier string from a parsed URL.
 * @param {URL} parsedUrl
 * @returns {string} One of PLATFORMS enum
 */
export function detectPlatform(parsedUrl) {
  return detectPlatformDetails(parsedUrl).platform;
}
