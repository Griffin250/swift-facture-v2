import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Mail, User, Calendar, Shield } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useRole } from '@/hooks/useRole';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';

const Profile = () => {
  const { user } = useAuth();
  const { role, loading: roleLoading } = useRole();
  const { t } = useTranslation('common');
  const navigate = useNavigate();

  const getRoleBadgeVariant = (userRole) => {
    switch (userRole) {
      case 'super_admin':
        return 'destructive';
      case 'admin':
        return 'default';
      default:
        return 'secondary';
    }
  };

  const getRoleLabel = (userRole) => {
    switch (userRole) {
      case 'super_admin':
        return 'Super Admin';
      case 'admin':
        return 'Admin';
      default:
        return 'User';
    }
  };

  // Handle navigation with scroll to top
  const handleNavigation = (path) => {
    navigate(path);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  if (!user) {
    navigate('/login');
    return null;
  }

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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate(-1)}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.title', 'Profile')}
          </h1>
        </div>

        {/* Profile Card */}
        <Card className="mb-8">
          <CardHeader className="pb-6">
            <div className="flex items-center justify-between">
              <CardTitle className="text-xl font-semibold">
                {t('profile.personalInfo', 'Personal Information')}
              </CardTitle>
              <Button
                onClick={() => handleNavigation('/profile/edit')}
                className="bg-primary hover:bg-primary/90"
              >
                <Edit className="h-4 w-4 mr-2" />
                {t('profile.editProfile', 'Edit Profile')}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Avatar and Basic Info */}
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20">
                <AvatarImage src={user.user_metadata?.avatar_url} alt={getUserDisplayName()} />
                <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                  {getUserInitials()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-2xl font-semibold text-gray-900">
                  {getUserDisplayName()}
                </h2>
                <p className="text-gray-600">{user.email}</p>
              </div>
            </div>

            {/* Profile Details */}
            <div className="grid md:grid-cols-2 gap-6 pt-6 border-t">
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <User className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('profile.fullName', 'Full Name')}
                    </p>
                    <p className="text-gray-900">{getUserDisplayName()}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Shield className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('profile.role', 'Role')}
                    </p>
                    {roleLoading ? (
                      <p className="text-gray-400">Loading...</p>
                    ) : (
                      <Badge variant={getRoleBadgeVariant(role)}>
                        {getRoleLabel(role)}
                      </Badge>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Mail className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('profile.email', 'Email')}
                    </p>
                    <p className="text-gray-900">{user.email}</p>
                    <p className="text-xs text-green-600">
                      {user.email_confirmed_at ? t('profile.verified', 'Verified') : t('profile.notVerified', 'Not Verified')}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('profile.joinedDate', 'Joined')}
                    </p>
                    <p className="text-gray-900">{formatDate(user.created_at)}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <Calendar className="h-5 w-5 text-gray-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-700">
                      {t('profile.lastSignIn', 'Last Sign In')}
                    </p>
                    <p className="text-gray-900">
                      {user.last_sign_in_at ? formatDate(user.last_sign_in_at) : 'Never'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Settings Card */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t('profile.accountSettings', 'Account Settings')}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="font-medium text-gray-900">
                  {t('profile.changePassword', 'Change Password')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('profile.changePasswordDesc', 'Update your account password')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {t('profile.change', 'Change')}
              </Button>
            </div>

            <div className="flex items-center justify-between py-2 border-t">
              <div>
                <p className="font-medium text-gray-900">
                  {t('profile.twoFactor', 'Two-Factor Authentication')}
                </p>
                <p className="text-sm text-gray-600">
                  {t('profile.twoFactorDesc', 'Add an extra layer of security')}
                </p>
              </div>
              <Button variant="outline" size="sm">
                {t('profile.enable', 'Enable')}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Profile;