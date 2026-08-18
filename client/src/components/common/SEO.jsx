import { useEffect } from 'react';

export function SEO({ title, description }) {
  useEffect(() => {
    const defaultTitle = 'InTube — Modern Media Utility & Downloader';
    const defaultDesc = 'Stateless, privacy-focused media downloader and converter for public YouTube and Instagram media.';

    document.title = title ? `${title} | InTube` : defaultTitle;

    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', description || defaultDesc);
    }
  }, [title, description]);

  return null;
}
