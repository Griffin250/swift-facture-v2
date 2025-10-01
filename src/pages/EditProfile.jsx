import { useState, useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Upload, Camera, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/components/ui/use-toast';
import { uploadAvatar } from '@/utils/avatarStorage';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

const EditProfile = () => {
  const { user, refreshUser } = useAuth();
  const { t } = useTranslation('common');
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [avatarLoading, setAvatarLoading] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const fileInputRef = useRef(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
  });

  useEffect(() => {
    if (user) {
      const metadata = user.user_metadata;
      setFormData({
        firstName: metadata?.first_name || '',
        lastName: metadata?.last_name || '',
        email: user.email || '',
      });
    }
  }, [user]);

  if (!user) {
    navigate('/login');
    return null;
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        toast({
          title: "Error",
          description: "Please select a valid image file.",
          variant: "destructive",
        });
        return;
      }

      // Validate file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        toast({
          title: "Error",
          description: "Image size should be less than 5MB.",
          variant: "destructive",
        });
        return;
      }

      setAvatarFile(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAvatarUpload = async () => {
    if (!avatarFile) return null;

    setAvatarLoading(true);
    try {
      const publicUrl = await uploadAvatar(avatarFile, user.id);
      return publicUrl;
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to upload avatar. Please try again.",
        variant: "destructive",
      });
      throw error;
    } finally {
      setAvatarLoading(false);
    }
  };

  const removeAvatarPreview = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let avatarUrl = user.user_metadata?.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        avatarUrl = await handleAvatarUpload();
      }

      const { error } = await supabase.auth.updateUser({
        data: {
          first_name: formData.firstName,
          last_name: formData.lastName,
          avatar_url: avatarUrl,
        }
      });

      if (error) throw error;

      // Refresh user data to reflect changes immediately
      await refreshUser();

      toast({
        title: "Success!",
        description: "Your profile has been updated successfully.",
      });
      
      navigate('/profile');
    } catch (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

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

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/profile')}
            className="rounded-full"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <h1 className="text-3xl font-bold text-gray-900">
            {t('profile.editProfile', 'Edit Profile')}
          </h1>
        </div>

        {/* Edit Profile Form */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-semibold">
              {t('profile.personalInfo', 'Personal Information')}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Avatar Section */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
                <div className="relative">
                  <Avatar className="h-20 w-20">
                    <AvatarImage src={avatarPreview || user.user_metadata?.avatar_url} />
                    <AvatarFallback className="text-lg font-semibold bg-primary/10 text-primary">
                      {getUserInitials()}
                    </AvatarFallback>
                  </Avatar>
                  {avatarPreview && (
                    <button
                      type="button"
                      onClick={removeAvatarPreview}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-700 mb-2">
                    {t('profile.profilePicture', 'Profile Picture')}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-3">
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={avatarLoading}
                    >
                      {avatarLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600 mr-2"></div>
                          {t('profile.uploading', 'Uploading...')}
                        </>
                      ) : (
                        <>
                          <Camera className="h-4 w-4 mr-2" />
                          {t('profile.changeAvatar', 'Change Avatar')}
                        </>
                      )}
                    </Button>
                    {avatarPreview && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={removeAvatarPreview}
                        className="text-red-600 hover:text-red-700"
                      >
                        {t('profile.removePreview', 'Remove Preview')}
                      </Button>
                    )}
                  </div>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleAvatarChange}
                    className="hidden"
                  />
                  <p className="text-xs text-gray-500 mt-2">
                    {t('profile.avatarGuidelines', 'Supported formats: JPG, PNG, GIF. Max size: 5MB.')}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">
                    {t('profile.firstName', 'First Name')}
                  </Label>
                  <Input
                    id="firstName"
                    name="firstName"
                    type="text"
                    value={formData.firstName}
                    onChange={handleInputChange}
                    placeholder={t('profile.enterFirstName', 'Enter your first name')}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="lastName">
                    {t('profile.lastName', 'Last Name')}
                  </Label>
                  <Input
                    id="lastName"
                    name="lastName"
                    type="text"
                    value={formData.lastName}
                    onChange={handleInputChange}
                    placeholder={t('profile.enterLastName', 'Enter your last name')}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">
                  {t('profile.email', 'Email')}
                </Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  disabled
                  className="bg-gray-100"
                />
                <p className="text-xs text-gray-500">
                  {t('profile.emailCannotChange', 'Email address cannot be changed')}
                </p>
              </div>

              {/* Form Actions */}
              <div className="flex gap-3 pt-6 border-t">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate('/profile')}
                  disabled={loading}
                >
                  {t('common.cancel', 'Cancel')}
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="bg-primary hover:bg-primary/90"
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      {t('profile.updating', 'Updating...')}
                    </>
                  ) : (
                    <>
                      <Save className="h-4 w-4 mr-2" />
                      {t('profile.saveChanges', 'Save Changes')}
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EditProfile;