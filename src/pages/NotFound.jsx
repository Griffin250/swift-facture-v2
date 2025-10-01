import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const NotFound = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);

  // Handle navigation with scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Loading simulation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/30 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary border-orange-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-muted/10 to-muted/30">
      <div className="flex flex-col items-center space-y-6">
        <div className="rounded-full w-28 h-28 md:w-28 md:h-28 flex items-center justify-center bg-gradient-to-br from-primary/20 to-secondary/20 elegant-shadow animate-fade-in">
          <div className="text-3xl md:text-4xl font-extrabold text-primary transform animate-pulse">404!</div>
        </div>

        <div className="card-modern p-6 max-w-2xl text-center glow-shadow">
          <h2 className="text-2xl md:text-3xl font-bold mb-2">Page not found</h2>
          <p className="text-muted-foreground mb-6">We couldn&apos;t find the page you&apos;re looking for. It may have been moved or the URL is incorrect.</p>

          <div className="flex justify-center gap-3">
            <Button onClick={() => handleNavigation('/')} className="px-4">Go home</Button>
            <Button variant="outline" onClick={() => navigate(-1)} className="px-4">Go back</Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
