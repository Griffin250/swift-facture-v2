import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';


const isIOS = () => {
  return /iphone|ipad|ipod/.test(window.navigator.userAgent.toLowerCase());
};

const isInStandaloneMode = () => (
  window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true
);



const InstallPWAButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [show, setShow] = useState(false);
  const [installed, setInstalled] = useState(false);
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    if (isInStandaloneMode()) return;
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShow(true);
      if (!localStorage.getItem('pwa-banner-shown')) {
        setShowBanner(true);
        localStorage.setItem('pwa-banner-shown', '1');
      }
    });
    window.addEventListener('appinstalled', () => {
      setInstalled(true);
      setShow(false);
    });
    // iOS: show banner if not installed
    if (isIOS() && !isInStandaloneMode() && !localStorage.getItem('pwa-banner-shown')) {
      setShowBanner(true);
      localStorage.setItem('pwa-banner-shown', '1');
    }
    // Always show install popup for eligible users (ignore referrer/search engine)
    if (!isIOS() && !isInStandaloneMode()) {
      setShow(true);
    }
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      try {
        deferredPrompt.prompt();
        const { outcome } = await deferredPrompt.userChoice;
        if (outcome === 'accepted') {
          setShow(false);
          setInstalled(true);
        }
      } catch (err) {
        // Silent fail in production
      }
    }
  };

  if (installed || isInStandaloneMode()) return null;

  // iOS install instructions
  if (isIOS() && showBanner) {
    const handleClose = () => {
      setShowBanner(false);
      window.localStorage.setItem('pwa-footer-install-closed', '1');
    };
    return (
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg px-6 py-4 flex items-center gap-3 animate-fade-in w-[95vw] max-w-md">
        <img src="/assets/logo/WebsiteLogo.png" alt="SwiftFacture" className="w-10 h-10 rounded-full border border-blue-200" />
        <div>
          <div className="font-semibold text-blue-700 dark:text-blue-300">⚡ Installez SwiftFacture</div>
          <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-300 mt-1">Sur iPhone/iPad : Touchez <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Partager</span> puis <span className="inline-block px-2 py-1 bg-gray-200 dark:bg-gray-700 rounded">Ajouter &agrave; l&apos;&eacute;cran d&apos;accueil</span>.</div>
        </div>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Fermer"
        >
          <span className="text-lg font-bold">×</span>
        </button>
      </div>
    );
  }

  // Android/desktop PWA install prompt
  if (show) {
    const handleClose = () => {
      setShow(false);
      window.localStorage.setItem('pwa-footer-install-closed', '1');
    };
    return (
      <div className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 bg-white dark:bg-gray-900 border border-blue-200 dark:border-blue-700 rounded-xl shadow-lg px-6 py-4 flex items-center gap-3 animate-fade-in w-[95vw] max-w-md">
        <img src="/assets/logo/WebsiteLogo.png" alt="SwiftFacture" className="w-10 h-10 rounded-full border border-blue-200" />
        <div>
          <div className="hidden sm:block font-semibold text-blue-700 dark:text-blue-300">⚡ Install SwiftFacture</div>
          <div className="hidden sm:block text-xs text-gray-600 dark:text-gray-300 mt-1">Get instant access anywhere.</div>
        </div>
        <button
          onClick={handleInstall}
          className="ml-4 bg-gradient-to-br from-blue-500 to-orange-400 text-white px-4 py-2 rounded-lg flex items-center gap-2 shadow hover:scale-105 transition-transform"
        >
          <Download className="w-5 h-5" /> Install
        </button>
        <button
          onClick={handleClose}
          className="absolute top-2 right-2 w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 dark:bg-gray-800 text-gray-500 hover:bg-red-100 hover:text-red-600 dark:hover:bg-red-900 transition-colors shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-400"
          aria-label="Close"
        >
          <span className="text-lg font-bold">×</span>
        </button>
      </div>
    );
  }

  return null;
};

export default InstallPWAButton;
