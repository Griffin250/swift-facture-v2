import { supabase } from '@/integrations/supabase/client';

/**
 * Initialize the avatars storage bucket with proper policies
 * This should be run once during setup
 */
export const initializeAvatarStorage = async () => {
  try {
    // Create the avatars bucket if it doesn't exist
    const { data, error } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/jpeg', 'image/png', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880, // 5MB
    });

    if (error && error.message !== 'Bucket avatars already exists') {
      console.error('Error creating avatars bucket:', error);
      return false;
    }

    console.log('Avatars bucket initialized successfully');
    return true;
  } catch (error) {
    console.error('Failed to initialize avatar storage:', error);
    return false;
  }
};

/**
 * Upload an avatar image to Supabase storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadAvatar = async (file, userId) => {
  try {
    // Delete old avatar if exists
    const oldAvatarPath = `avatars/${userId}`;
    await supabase.storage.from('avatars').remove([oldAvatarPath]);

    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}-${Date.now()}.${fileExt}`;
    const filePath = `avatars/${fileName}`;

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file);

    if (uploadError) throw uploadError;

    // Get public URL
    const { data: { publicUrl } } = supabase.storage
      .from('avatars')
      .getPublicUrl(filePath);

    return publicUrl;
  } catch (error) {
    console.error('Error uploading avatar:', error);
    throw error;
  }
};

/**
 * Delete an avatar from storage
 * @param {string} userId - The user's ID
 * @returns {Promise<boolean>} - Success status
 */
export const deleteAvatar = async (userId) => {
  try {
    const { error } = await supabase.storage
      .from('avatars')
      .remove([`avatars/${userId}`]);

    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
};