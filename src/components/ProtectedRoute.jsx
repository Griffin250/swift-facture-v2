import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2 } from 'lucide-react';
import LoginRequiredModal from './LoginRequiredModal';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    // Show modal when user is not authenticated and loading is complete
    if (!loading && !user) {
      setShowModal(true);
    }
  }, [loading, user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="relative min-h-screen">
        {/* Blurred page content */}
        <div className="blur-sm pointer-events-none">
          {children}
        </div>
        
        {/* Modal overlay */}
        <LoginRequiredModal 
          isOpen={showModal} 
          onClose={() => setShowModal(false)} 
        />
      </div>
    );
  }

  return children;
};

export default ProtectedRoute;