import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Settings, LogOut, ChevronDown, Shield, Crown, CreditCard } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { SubscriptionService } from '@/services/subscriptionService';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { isAdmin } = useRole();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [subscriptionStatus, setSubscriptionStatus] = useState(null);
  const [subscriptionLoading, setSubscriptionLoading] = useState(true);

  if (!user) return null;

  // Load subscription status
  useEffect(() => {
    const loadSubscriptionStatus = async () => {
      if (!user) return;
      
      try {
        setSubscriptionLoading(true);
        const result = await SubscriptionService.checkSubscription();
        
        if (result.success) {
          setSubscriptionStatus(result);
        } else {
          // Default to free if check fails
          setSubscriptionStatus({
            success: true,
            subscribed: false,
            plan: 'free',
            status: 'free'
          });
        }
      } catch (error) {
        console.error('Error loading subscription status:', error);
        setSubscriptionStatus({
          success: true,
          subscribed: false,
          plan: 'free',
          status: 'free'
        });
      } finally {
        setSubscriptionLoading(false);
      }
    };

    loadSubscriptionStatus();
  }, [user]);

  // Get user display name from metadata or email
  const getUserDisplayName = () => {
    const metadata = user.user_metadata;
    if (metadata?.first_name && metadata?.last_name) {
      return `${metadata.first_name} ${metadata.last_name}`;
    }
    if (metadata?.full_name) {
      return metadata.full_name;
    }
    if (metadata?.name) {
      return metadata.name;
    }
    // Fallback to email username
    return user.email?.split('@')[0] || 'User';
  };

  // Get user initials for avatar
  const getUserInitials = () => {
    const displayName = getUserDisplayName();
    const names = displayName.split(' ');
    if (names.length >= 2) {
      return `${names[0][0]}${names[1][0]}`.toUpperCase();
    }
    return displayName.substring(0, 2).toUpperCase();
  };

  // Get subscription display info
  const getSubscriptionInfo = () => {
    if (subscriptionLoading) {
      return {
        label: t('subscription.loading', 'Loading...'),
        color: 'secondary',
        icon: CreditCard
      };
    }

    if (!subscriptionStatus?.subscribed) {
      return {
        label: t('subscription.free', 'Free Plan'),
        color: 'secondary',
        icon: User
      };
    }

    const plan = subscriptionStatus.plan || 'unknown';
    const status = subscriptionStatus.status;

    // Handle different plan types
    switch (plan.toLowerCase()) {
      case 'starter':
        return {
          label: t('subscription.starter', 'Starter Plan'),
          color: 'default',
          icon: Crown
        };
      case 'professional':
      case 'pro':
        return {
          label: t('subscription.professional', 'Professional Plan'),
          color: 'default',
          icon: Crown
        };
      case 'enterprise':
        return {
          label: t('subscription.enterprise', 'Enterprise Plan'),
          color: 'default',
          icon: Crown
        };
      default:
        return {
          label: t('subscription.active', 'Active Subscription'),
          color: 'default',
          icon: Crown
        };
    }
  };

  const subscriptionInfo = getSubscriptionInfo();

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      handleNavigation('/');
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to log out. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleNavigation = (to) => {
    navigate(to);
    // Scroll to top of the page
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEditProfile = () => {
    handleNavigation('/profile/edit');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">
          <Avatar className="h-6 w-6">
            <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
            <AvatarFallback className="text-xs font-semibold bg-primary/10 text-primary">
              {getUserInitials()}
            </AvatarFallback>
          </Avatar>
          <span className="hidden sm:inline max-w-24 truncate">
            {getUserDisplayName()}
          </span>
          <ChevronDown className="h-4 w-4 text-gray-600" />
        </button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent align="end" className="w-64">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium text-gray-900">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <subscriptionInfo.icon className="h-3 w-3" />
            <Badge variant={subscriptionInfo.color} className="text-xs px-2 py-0.5">
              {subscriptionInfo.label}
            </Badge>
          </div>
        </div>
        
        <DropdownMenuItem
          onClick={handleEditProfile}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <User className="h-4 w-4" />
          <span>{t('profile.editProfile', 'Edit Profile')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleNavigation('/profile')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <User className="h-4 w-4" />
          <span>{t('profile.viewProfile', 'View Profile')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleNavigation('/billing')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <CreditCard className="h-4 w-4" />
          <span>{t('profile.subscription', 'Manage Subscription')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => handleNavigation('/settings')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <Settings className="h-4 w-4" />
          <span>{t('profile.settings', 'Settings')}</span>
        </DropdownMenuItem>
        
        {isAdmin && (
          <DropdownMenuItem
            onClick={() => handleNavigation('/admin')}
            className="cursor-pointer flex items-center gap-2 py-2"
          >
            <Shield className="h-4 w-4" />
            <span>{t('profile.adminDashboard', 'Admin Dashboard')}</span>
          </DropdownMenuItem>
        )}
        
        <DropdownMenuSeparator />
        
        <DropdownMenuItem
          onClick={handleSignOut}
          disabled={loading}
          className="cursor-pointer flex items-center gap-2 py-2 text-red-600 hover:text-red-700 focus:text-red-700"
        >
          <LogOut className="h-4 w-4" />
          <span>{loading ? t('profile.signingOut', 'Signing out...') : t('profile.signOut', 'Sign Out')}</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserProfile;