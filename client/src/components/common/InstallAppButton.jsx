import { useState, useEffect } from 'react';
import { Download } from 'lucide-react';
import { Button } from './Button.jsx';

export function InstallAppButton({ className = '', variant = 'outline', size = 'sm' }) {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Check if running in standalone PWA mode
    const isStandalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      window.navigator.standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    const handleBeforeInstallPrompt = (e) => {
      // Prevent automatic mini-infobar on mobile
      e.preventDefault();
      setDeferredPrompt(e);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  if (isInstalled || !deferredPrompt) {
    return null; // Never show a fake install button
  }

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;

    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setIsInstalled(true);
    }
    setDeferredPrompt(null);
  };

  return (
    <Button
      variant={variant}
      size={size}
      onClick={handleInstallClick}
      className={`font-semibold transition-all ${className}`}
      title="Install InTube App"
    >
      <Download className="w-3.5 h-3.5 mr-1.5 text-blue-500" />
      <span>Install App</span>
    </Button>
  );
}
