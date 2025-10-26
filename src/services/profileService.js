import { supabase } from '@/integrations/supabase/client';
import { uploadAvatar } from '../utils/avatarStorage';

export const profileService = {
  // Get current user profile
  async getUserProfile() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  // Update user profile
  async updateUserProfile(profileData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Prepare update data
      const updateData = {
        first_name: profileData.firstName,
        last_name: profileData.lastName,
        company_name: profileData.companyName,
        updated_at: new Date().toISOString()
      };

      // Handle avatar upload if provided
      if (profileData.avatar && profileData.avatar instanceof File) {
        try {
          const avatarUrl = await uploadAvatar(profileData.avatar, user.id);
          updateData.avatar_url = avatarUrl;
        } catch (avatarError) {
          console.error('Error uploading avatar:', avatarError);
          // Continue with profile update without avatar
        }
      }

      const { data, error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        // If avatar_url column doesn't exist, try without it
        if (error.message?.includes('column "avatar_url" does not exist')) {
          const updateWithoutAvatar = {
            first_name: profileData.firstName,
            last_name: profileData.lastName,
            company_name: profileData.companyName,
            updated_at: new Date().toISOString()
          };
          const { data: retryData, error: retryError } = await supabase
            .from('profiles')
            .update(updateWithoutAvatar)
            .eq('id', user.id)
            .select()
            .single();
          
          if (retryError) throw retryError;
          
          // Still update auth metadata with avatar
          const { error: authError } = await supabase.auth.updateUser({
            data: {
              first_name: profileData.firstName,
              last_name: profileData.lastName,
              avatar_url: updateData.avatar_url
            }
          });

          if (authError) {
            console.error('Error updating auth metadata:', authError);
          }

          return retryData;
        }
        throw error;
      }

      // Also update auth.users metadata
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          first_name: profileData.firstName,
          last_name: profileData.lastName,
          avatar_url: updateData.avatar_url
        }
      });

      if (authError) {
        console.error('Error updating auth metadata:', authError);
        // Don't throw error, profile was updated successfully
      }

      return data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  // Update user avatar only
  async updateUserAvatar(avatarFile) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Upload new avatar
      const avatarUrl = await uploadAvatar(avatarFile, user.id);

      // Update profile with new avatar URL
      const { data, error } = await supabase
        .from('profiles')
        .update({ 
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) throw error;

      // Also update auth.users metadata
      await supabase.auth.updateUser({
        data: { avatar_url: avatarUrl }
      });

      return { avatarUrl, profile: data };
    } catch (error) {
      console.error('Error updating user avatar:', error);
      throw error;
    }
  },

  // Get user avatar URL
  async getUserAvatar() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return null;

      // Check user metadata first
      if (user.user_metadata?.avatar_url) {
        return user.user_metadata.avatar_url;
      }

      // Fallback to profile table
      try {
        const { data } = await supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', user.id)
          .single();

        return data?.avatar_url || null;
      } catch (error) {
        // If avatar_url column doesn't exist, return null
        if (error.message?.includes('column "avatar_url" does not exist')) {
          return null;
        }
        throw error;
      }
    } catch (error) {
      console.error('Error getting user avatar:', error);
      return null;
    }
  }
};