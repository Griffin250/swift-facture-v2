import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { AlertCircle, CreditCard } from 'lucide-react';

export const TrialExpiredModal = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [isExpired, setIsExpired] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (user) {
      checkSubscription();
    }
  }, [user]);

  const checkSubscription = async () => {
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (orgData) {
        const { data: subData } = await supabase
          .from('billing_subscriptions')
          .select('*')
          .eq('org_id', orgData.id)
          .single();

        if (subData) {
          const expired = subData.status === 'expired';
          setIsExpired(expired);
          setOpen(expired);
        }
      }
    } catch (error) {
      console.error('Error checking subscription:', error);
    }
  };

  const handleUpgrade = () => {
    setOpen(false);
    navigate('/premium');
  };

  if (!isExpired) return null;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
            <AlertCircle className="h-10 w-10 text-red-600" />
          </div>
          <DialogTitle className="text-center text-2xl">Trial Expired</DialogTitle>
          <DialogDescription className="text-center">
            Your 30-day free trial of SwiftFacture has ended. Upgrade now to continue using all features.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          <div className="rounded-lg bg-red-50 p-4 border border-red-200">
            <h4 className="font-medium text-red-900 mb-2">What you're missing:</h4>
            <ul className="space-y-1 text-sm text-red-700">
              <li>• Create unlimited invoices and estimates</li>
              <li>• Manage customer information</li>
              <li>• Access beautiful templates</li>
              <li>• Track payments and receivables</li>
            </ul>
          </div>
          <Button 
            onClick={handleUpgrade}
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md"
            size="lg"
          >
            <CreditCard className="mr-2 h-5 w-5" />
            View Plans & Upgrade
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};