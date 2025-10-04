import { supabase } from '@/integrations/supabase/client';

// Migration script to fix RLS policy for role assignment
const runMigration = async () => {
  try {
    console.log('Running migration to fix role assignment...');
    
    const migrationSQL = `
      -- Add policy to allow users to insert their first role (bootstrap solution)
      CREATE POLICY IF NOT EXISTS "Users can insert their first role"
        ON public.user_roles
        FOR INSERT
        WITH CHECK (
          auth.uid() = user_id 
          AND NOT EXISTS (
            SELECT 1 FROM public.user_roles WHERE user_id = auth.uid()
          )
        );
    `;

    const { error } = await supabase.rpc('exec_sql', { sql: migrationSQL });
    
    if (error) {
      console.error('Migration failed:', error);
      return false;
    }
    
    console.log('Migration completed successfully!');
    return true;
  } catch (err) {
    console.error('Migration error:', err);
    return false;
  }
};

export { runMigration };