import { useEffect } from 'react';

export function SEO({
  title,
  description,
  keywords,
  canonicalUrl = 'https://intubedl.vercel.app/'
}) {
  useEffect(() => {
    const defaultTitle = 'InTube — YouTube Video Downloader, Shorts & MP3 Converter | Nikhil Projects';
    const defaultDesc = 'InTube by Nikhil Projects is the ultimate fast, free, and privacy-first online media downloader. Download YouTube 4K/1080p videos, Shorts, MP3 audio, Instagram Reels, and Facebook videos.';
    const defaultKeywords = 'Nikhil Projects, Nikhil youtube video downloader, yt downloader, youtube downloader, youtube video downloader, youtube to mp3, youtube shorts downloader, 4k youtube downloader, instagram reels downloader, facebook video downloader, intube, intubedl';

    // Page Title
    document.title = title
      ? `${title} | InTube — Nikhil Projects`
      : defaultTitle;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute('content', description || defaultDesc);
    }

    // Meta Keywords
    let metaKeywords = document.querySelector('meta[name="keywords"]');
    if (metaKeywords) {
      metaKeywords.setAttribute('content', keywords ? `${keywords}, ${defaultKeywords}` : defaultKeywords);
    }

    // Canonical Tag
    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', canonicalUrl);
    }

    // OG Title & Description
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) {
      ogTitle.setAttribute('content', title ? `${title} | InTube — Nikhil Projects` : defaultTitle);
    }

    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) {
      ogDesc.setAttribute('content', description || defaultDesc);
    }
  }, [title, description, keywords, canonicalUrl]);

  return null;
}
