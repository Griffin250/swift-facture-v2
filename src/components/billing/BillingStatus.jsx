import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import { Calendar, CreditCard, AlertCircle, CheckCircle, Clock } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

export const BillingStatus = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [daysLeft, setDaysLeft] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);

  useEffect(() => {
    if (user) {
      fetchSubscription();
    }
  }, [user]);

  const fetchSubscription = async () => {
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (orgData) {
        const { data: subData, error } = await supabase
          .from('billing_subscriptions')
          .select('*')
          .eq('org_id', orgData.id)
          .single();

        if (!error && subData) {
          setSubscription(subData);
          
          if (subData.status === 'trialing' && subData.trial_end) {
            const endDate = new Date(subData.trial_end);
            const startDate = new Date(subData.trial_start);
            const now = new Date();
            
            const totalDays = Math.ceil((endDate - startDate) / (1000 * 60 * 60 * 24));
            const remaining = Math.ceil((endDate - now) / (1000 * 60 * 60 * 24));
            const elapsed = totalDays - remaining;
            
            setDaysLeft(Math.max(0, remaining));
            setProgressPercent(Math.min(100, (elapsed / totalDays) * 100));
          }
        }
      }
    } catch (error) {
      console.error('Error fetching subscription:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = () => {
    if (!subscription) return null;

    const statusConfig = {
      trialing: { 
        label: 'Free Trial', 
        className: 'bg-blue-100 text-blue-700 hover:bg-blue-200',
        icon: <Clock className="h-3 w-3 mr-1" />
      },
      active: { 
        label: 'Active', 
        className: 'bg-green-100 text-green-700 hover:bg-green-200',
        icon: <CheckCircle className="h-3 w-3 mr-1" />
      },
      expired: { 
        label: 'Expired', 
        className: 'bg-red-100 text-red-700 hover:bg-red-200',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      },
      cancelled: { 
        label: 'Cancelled', 
        className: 'bg-gray-100 text-gray-700 hover:bg-gray-200',
        icon: <AlertCircle className="h-3 w-3 mr-1" />
      },
    };

    const config = statusConfig[subscription.status] || statusConfig.expired;

    return (
      <Badge variant="outline" className={config.className}>
        {config.icon}
        {config.label}
      </Badge>
    );
  };

  if (loading) {
    return (
      <Card className="animate-pulse">
        <CardHeader>
          <div className="h-6 bg-muted rounded w-1/3"></div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="h-4 bg-muted rounded w-2/3"></div>
            <div className="h-4 bg-muted rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!subscription) {
    return (
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          No subscription found. Please contact support.
        </AlertDescription>
      </Alert>
    );
  }

  const isExpired = subscription.status === 'expired';
  const isTrial = subscription.status === 'trialing';

  return (
    <Card className="bg-gradient-to-br from-white to-gray-50 border-gray-200 shadow-lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-bold">Subscription Status</CardTitle>
          {getStatusBadge()}
        </div>
        <CardDescription>
          {isTrial ? 'Manage your trial and upgrade options' : 'Your current billing information'}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {isExpired ? (
          <Alert variant="destructive" className="bg-red-50 border-red-200">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="font-medium">
              Your trial has expired. Upgrade now to continue using SwiftFacture.
            </AlertDescription>
          </Alert>
        ) : isTrial ? (
          <>
            {daysLeft <= 7 && (
              <Alert className={`${daysLeft <= 2 ? 'bg-red-50 border-red-200' : 'bg-amber-50 border-amber-200'}`}>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription className="font-medium">
                  {daysLeft === 0 ? 'Your trial ends today!' : `Your trial ends in ${daysLeft} day${daysLeft !== 1 ? 's' : ''}!`}
                </AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium">Trial Progress</span>
                <span className="text-muted-foreground">{daysLeft} days remaining</span>
              </div>
              <Progress value={progressPercent} className="h-2" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Started
                </div>
                <div className="font-medium">
                  {new Date(subscription.trial_start).toLocaleDateString()}
                </div>
              </div>
              <div className="space-y-1">
                <div className="text-sm text-muted-foreground flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Ends
                </div>
                <div className="font-medium">
                  {new Date(subscription.trial_end).toLocaleDateString()}
                </div>
              </div>
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <CreditCard className="h-4 w-4" />
              <span>Active Subscription</span>
            </div>
          </div>
        )}

        <div className="pt-4 border-t">
          <Button 
            onClick={() => navigate('/premium')} 
            className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-semibold shadow-md"
          >
            <CreditCard className="mr-2 h-4 w-4" />
            {isExpired ? 'Upgrade Now' : isTrial ? 'Upgrade to Premium' : 'Manage Subscription'}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};