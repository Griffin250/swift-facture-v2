import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { BillingStatus } from '@/components/billing/BillingStatus';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, FileText, CreditCard, TrendingUp } from 'lucide-react';

const Billing = () => {
  const { t } = useTranslation();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [billingEvents, setBillingEvents] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchBillingEvents();
    }
  }, [user]);

  const fetchBillingEvents = async () => {
    try {
      const { data: orgData } = await supabase
        .from('organizations')
        .select('id')
        .eq('owner_id', user.id)
        .single();

      if (orgData) {
        const { data: events, error } = await supabase
          .from('billing_events')
          .select('*')
          .eq('org_id', orgData.id)
          .order('timestamp', { ascending: false })
          .limit(10);

        if (!error && events) {
          setBillingEvents(events);
        }
      }
    } catch (error) {
      console.error('Error fetching billing events:', error);
    } finally {
      setLoading(false);
    }
  };

  const getEventIcon = (eventType) => {
    if (eventType.includes('trial')) return <Calendar className="h-4 w-4" />;
    if (eventType.includes('payment')) return <CreditCard className="h-4 w-4" />;
    if (eventType.includes('invoice')) return <FileText className="h-4 w-4" />;
    return <TrendingUp className="h-4 w-4" />;
  };

  const getEventLabel = (eventType) => {
    const labels = {
      trial_started: 'Trial Started',
      trial_expired: 'Trial Expired',
      trial_reminder_7_days_left: '7-Day Reminder Sent',
      trial_reminder_2_days_left: '2-Day Reminder Sent',
      trial_reminder_1_day_left: '1-Day Reminder Sent',
      subscription_activated: 'Subscription Activated',
      subscription_cancelled: 'Subscription Cancelled',
    };
    return labels[eventType] || eventType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-white p-4 sm:p-6 lg:p-8">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            Billing & Subscription
          </h1>
          <p className="text-muted-foreground">
            Manage your subscription and view billing history
          </p>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Subscription Status */}
          <div className="lg:col-span-2">
            <BillingStatus />
          </div>

          {/* Quick Actions */}
          <Card className="bg-gradient-to-br from-blue-50 to-white border-blue-200">
            <CardHeader>
              <CardTitle className="text-lg">Quick Actions</CardTitle>
              <CardDescription>Manage your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/premium')}
              >
                <CreditCard className="mr-2 h-4 w-4" />
                View All Plans
              </Button>
              <Button 
                variant="outline" 
                className="w-full justify-start"
                onClick={() => navigate('/settings')}
              >
                <FileText className="mr-2 h-4 w-4" />
                Account Settings
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Billing History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Billing History
            </CardTitle>
            <CardDescription>Recent account activity and events</CardDescription>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-16 bg-muted animate-pulse rounded-lg"></div>
                ))}
              </div>
            ) : billingEvents.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No billing events yet</p>
              </div>
            ) : (
              <div className="space-y-4">
                {billingEvents.map((event, index) => (
                  <div key={event.id}>
                    {index > 0 && <Separator className="my-4" />}
                    <div className="flex items-start gap-4">
                      <div className="mt-1 p-2 rounded-lg bg-blue-100 text-blue-600">
                        {getEventIcon(event.event_type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-sm">
                            {getEventLabel(event.event_type)}
                          </h4>
                          <Badge variant="outline" className="text-xs">
                            {new Date(event.timestamp).toLocaleDateString()}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          {new Date(event.timestamp).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Billing;