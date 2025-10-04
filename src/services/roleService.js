import { supabase } from '@/integrations/supabase/client';

export const roleService = {
  // Get user's role
  async getUserRole(userId) {
    try {
      const { data, error } = await supabase
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (error) throw error;
      return { data: data?.role || 'user', error: null };
    } catch (error) {
      console.error('Error fetching user role:', error);
      return { data: 'user', error };
    }
  },

  // Assign role to user (super_admin only)
  async assignRole(userId, role) {
    try {
      // First check if role already exists
      const { data: existing } = await supabase
        .from('user_roles')
        .select('id')
        .eq('user_id', userId)
        .eq('role', role)
        .single();

      if (existing) {
        return { data: existing, error: null };
      }

      // Insert new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: role
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error assigning role:', error);
      return { data: null, error };
    }
  },

  // Update user role (super_admin only)
  async updateUserRole(userId, newRole) {
    try {
      // Delete existing roles for the user
      await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId);

      // Insert new role
      const { data, error } = await supabase
        .from('user_roles')
        .insert({
          user_id: userId,
          role: newRole
        })
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating role:', error);
      return { data: null, error };
    }
  },

  // Get all users with their roles
  async getAllUsersWithRoles() {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Get roles for all users
      const userIds = profiles.map(p => p.id);
      const { data: roles, error: rolesError } = await supabase
        .from('user_roles')
        .select('*')
        .in('user_id', userIds);

      if (rolesError) throw rolesError;

      // Merge roles with profiles
      const usersWithRoles = profiles.map(profile => {
        const userRole = roles.find(r => r.user_id === profile.id);
        return {
          ...profile,
          role: userRole?.role || 'user'
        };
      });

      return { data: usersWithRoles, error: null };
    } catch (error) {
      console.error('Error fetching users with roles:', error);
      return { data: null, error };
    }
  },

  // Remove role from user (super_admin only)
  async removeRole(userId, role) {
    try {
      const { error } = await supabase
        .from('user_roles')
        .delete()
        .eq('user_id', userId)
        .eq('role', role);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error removing role:', error);
      return { error };
    }
  }
};
