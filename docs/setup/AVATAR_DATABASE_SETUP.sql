-- IMPORTANT: Run this SQL command in your Supabase dashboard to add avatar support
-- Go to: https://supabase.com/dashboard/project/[your-project]/sql

-- Add avatar_url column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url TEXT;

-- Create index for better performance (optional)
CREATE INDEX IF NOT EXISTS idx_profiles_avatar_url ON public.profiles(avatar_url);

-- After running this, avatars will persist properly in the database