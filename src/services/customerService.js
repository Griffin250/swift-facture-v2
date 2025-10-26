import { supabase } from '@/integrations/supabase/client';

export const customerService = {
  // Get all customers for the current user
  async getAllCustomers() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching customers:', error);
      return [];
    }
  },

  // Get customer by ID
  async getCustomerById(customerId) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching customer:', error);
      return null;
    }
  },

  // Create new customer
  async createCustomer(customerData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Basic customer data that works with existing schema
      const insertData = {
        user_id: user.id,
        name: customerData.name,
        email: customerData.email || null,
        phone: customerData.phone || null,
        city: customerData.city || null,
        postal_code: customerData.postal_code || null,
        country: customerData.country || null,
      };

      // Add new fields only if they're provided (for enhanced schema)
      if (customerData.customer_type) insertData.customer_type = customerData.customer_type;
      if (customerData.company_name) insertData.company_name = customerData.company_name;
      if (customerData.mobile_phone) insertData.mobile_phone = customerData.mobile_phone;
      if (customerData.website) insertData.website = customerData.website;
      if (customerData.street_address) insertData.street_address = customerData.street_address;
      if (customerData.state_province) insertData.state_province = customerData.state_province;
      if (customerData.vat_id) insertData.vat_id = customerData.vat_id;
      if (customerData.currency) insertData.currency = customerData.currency;
      if (customerData.status) insertData.status = customerData.status;
      if (customerData.notes) insertData.notes = customerData.notes;
      
      // Use the legacy address field if street_address is not available
      if (customerData.street_address && !insertData.address) {
        insertData.address = customerData.street_address;
      }

      const { data, error } = await supabase
        .from('customers')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating customer:', error);
      throw error;
    }
  },

  // Update customer
  async updateCustomer(customerId, customerData) {
    try {
      const updateData = {
        updated_at: new Date().toISOString(),
      };

      // Basic fields that exist in original schema
      if (customerData.name !== undefined) updateData.name = customerData.name;
      if (customerData.email !== undefined) updateData.email = customerData.email;
      if (customerData.phone !== undefined) updateData.phone = customerData.phone;
      if (customerData.city !== undefined) updateData.city = customerData.city;
      if (customerData.postal_code !== undefined) updateData.postal_code = customerData.postal_code;
      if (customerData.country !== undefined) updateData.country = customerData.country;

      // Enhanced fields (only add if they exist in the database)
      if (customerData.customer_type !== undefined) updateData.customer_type = customerData.customer_type;
      if (customerData.company_name !== undefined) updateData.company_name = customerData.company_name;
      if (customerData.mobile_phone !== undefined) updateData.mobile_phone = customerData.mobile_phone;
      if (customerData.website !== undefined) updateData.website = customerData.website;
      if (customerData.street_address !== undefined) updateData.street_address = customerData.street_address;
      if (customerData.state_province !== undefined) updateData.state_province = customerData.state_province;
      if (customerData.vat_id !== undefined) updateData.vat_id = customerData.vat_id;
      if (customerData.currency !== undefined) updateData.currency = customerData.currency;
      if (customerData.status !== undefined) updateData.status = customerData.status;
      if (customerData.notes !== undefined) updateData.notes = customerData.notes;
      
      // Use legacy address field if street_address doesn't exist
      if (customerData.street_address !== undefined && !updateData.street_address) {
        updateData.address = customerData.street_address;
      }

      const { data, error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', customerId)
        .select()
        .single();

      if (error) {
        console.error('Database error:', error);
        throw error;
      }
      return data;
    } catch (error) {
      console.error('Error updating customer:', error);
      throw error;
    }
  },

  // Delete customer
  async deleteCustomer(customerId) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', customerId);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting customer:', error);
      throw error;
    }
  },

  // Search customers
  async searchCustomers(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .or(`name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching customers:', error);
      return { data: null, error };
    }
  },

  // Get customer with related documents
  async getCustomerWithDocuments(customerId) {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          invoices(*),
          estimates(*),
          receipts(*)
        `)
        .eq('id', customerId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching customer with documents:', error);
      return { data: null, error };
    }
  },

  // Bulk delete customers
  async bulkDeleteCustomers(customerIds) {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .in('id', customerIds);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error bulk deleting customers:', error);
      return { error };
    }
  }
};