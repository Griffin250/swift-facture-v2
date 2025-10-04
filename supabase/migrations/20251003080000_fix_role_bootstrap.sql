-- Add policy to allow users to insert their first role (bootstrap solution)
-- This allows users to assign themselves a role if they don't have one yet

CREATE POLICY "Users can insert their first role"
  ON public.user_roles
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    AND NOT EXISTS (
      SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
    )
  );

-- Alternative: Allow users to insert any role for themselves (less secure but simpler for development)
-- Uncomment this and comment out the above policy if you want simpler role assignment
/*
CREATE POLICY "Users can manage their own roles"
  ON public.user_roles
  FOR ALL
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
*/