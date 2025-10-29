import { StrictMode, Suspense, useState, useEffect } from "react";
import ReactDOM from "react-dom/client";
import { I18nextProvider } from 'react-i18next';
import App from "./App.jsx";
import "./index.css";
import i18n from "./i18n"; // Import i18n instance



const LoadingFallback = () => {
  const [showTimeout, setShowTimeout] = useState(false);

  useEffect(() => {
    // Show timeout message after 5 seconds
    const timeout = setTimeout(() => {
      setShowTimeout(true);
    }, 5000);

    return () => clearTimeout(timeout);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center flex-col gap-4">
      <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-orange-600"></div>
      <p className="text-lg">Loading SwiftFacture...</p>
      {showTimeout && (
        <div className="text-center text-sm text-gray-500 max-w-md">
          <p>This is taking longer than expected.</p>
          <p>Please check your network connection or try refreshing the page.</p>
        </div>
      )}
    </div>
  );
};


ReactDOM.createRoot(document.getElementById("root")).render(
  <StrictMode>
    <I18nextProvider i18n={i18n}>
      <Suspense fallback={<LoadingFallback />}>
        <App />
      </Suspense>
    </I18nextProvider>
  </StrictMode>
);

// Register service worker for PWA
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(reg => {
        console.log('Service worker registered:', reg);
      })
      .catch(err => {
        console.error('Service worker registration failed:', err);
      });
  });
}
