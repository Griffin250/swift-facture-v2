import { supabase } from '@/integrations/supabase/client';

/**
 * Upload an avatar image to Supabase storage
 * @param {File} file - The image file to upload
 * @param {string} userId - The user's ID
 * @returns {Promise<string>} - The public URL of the uploaded image
 */
export const uploadAvatar = async (file, userId) => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${userId}/${userId}-${Date.now()}.${fileExt}`;
    const filePath = fileName;

    // Upload new file
    const { error: uploadError } = await supabase.storage
      .from('avatars')
      .upload(filePath, file, { upsert: true });

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
    const { data: files } = await supabase.storage
      .from('avatars')
      .list(userId);

    if (files && files.length > 0) {
      const filePaths = files.map(file => `${userId}/${file.name}`);
      const { error } = await supabase.storage
        .from('avatars')
        .remove(filePaths);

      if (error) throw error;
    }
    return true;
  } catch (error) {
    console.error('Error deleting avatar:', error);
    return false;
  }
};