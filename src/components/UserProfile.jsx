import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { User, Settings, LogOut, ChevronDown } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const UserProfile = () => {
  const { user, signOut } = useAuth();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  if (!user) return null;

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

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await signOut();
      toast({
        title: "Success",
        description: "You have been logged out successfully.",
      });
      navigate('/');
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

  const handleEditProfile = () => {
    navigate('/profile/edit');
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button className="flex items-center gap-2 px-3 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-50 transition-colors duration-200 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50">
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
      
      <DropdownMenuContent align="end" className="w-56">
        <div className="px-3 py-2 border-b">
          <p className="text-sm font-medium text-gray-900">
            {getUserDisplayName()}
          </p>
          <p className="text-xs text-gray-500 truncate">
            {user.email}
          </p>
        </div>
        
        <DropdownMenuItem
          onClick={handleEditProfile}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <Settings className="h-4 w-4" />
          <span>{t('profile.editProfile', 'Edit Profile')}</span>
        </DropdownMenuItem>
        
        <DropdownMenuItem
          onClick={() => navigate('/profile')}
          className="cursor-pointer flex items-center gap-2 py-2"
        >
          <User className="h-4 w-4" />
          <span>{t('profile.viewProfile', 'View Profile')}</span>
        </DropdownMenuItem>
        
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