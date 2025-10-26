import { Download } from 'lucide-react';
import { useEffect, useState } from 'react';

const FooterInstallButton = () => {
  const [deferredPrompt, setDeferredPrompt] = useState(null);
  useEffect(() => {
    const handler = (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handler);
    return () => window.removeEventListener('beforeinstallprompt', handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
      }
    } else {
      alert('To install the app, use your browser menu or look for the install button in the main app interface.');
    }
  };

  return (
    <button
      onClick={handleInstall}
      className="ml-2 bg-gradient-to-br from-blue-500 to-orange-400 text-white px-3 py-1 rounded-sm flex items-center gap-2 shadow hover:scale-105 transition-transform text-sm font-semibold"
      aria-label="Install SwiftFacture"
    >
      <Download className="w-4 h-4" /> Install App
    </button>
  );
};

export default FooterInstallButton;
