import { supabase } from '@/integrations/supabase/client';
import { invoiceService } from './invoiceService';

export const estimateService = {
  // Get all estimates for the current user
  async getAllEstimates() {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          customers (
            id,
            name,
            email,
            phone,
            address,
            city,
            postal_code,
            country
          ),
          estimate_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching estimates:', error);
      return { data: null, error };
    }
  },

  // Get estimate by ID
  async getEstimateById(estimateId) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          customers (*),
          estimate_items (*)
        `)
        .eq('id', estimateId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching estimate:', error);
      return { data: null, error };
    }
  },

  // Create new estimate with items
  async createEstimate(estimateData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .insert({
          user_id: user.id,
          customer_id: estimateData.customer_id || null,
          estimate_number: estimateData.estimate_number,
          date: estimateData.date,
          expiry_date: estimateData.expiry_date || null,
          template_name: estimateData.template_name || 'template1',
          subtotal: estimateData.subtotal || 0,
          tax: estimateData.tax || 0,
          total: estimateData.total || 0,
          notes: estimateData.notes || null,
          status: estimateData.status || 'draft',
        })
        .select()
        .single();

      if (estimateError) throw estimateError;

      // Create estimate items if provided
      if (estimateData.items && estimateData.items.length > 0) {
        const items = estimateData.items.map((item, index) => ({
          estimate_id: estimate.id,
          user_id: user.id,
          description: item.description || item.name,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.amount || 0,
          tax_rate: item.tax_rate || 0,
          total: (item.quantity || 1) * (item.unit_price || item.amount || 0),
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('estimate_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return { data: estimate, error: null };
    } catch (error) {
      console.error('Error creating estimate:', error);
      return { data: null, error };
    }
  },

  // Update estimate
  async updateEstimate(estimateId, estimateData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update estimate
      const { data: estimate, error: estimateError } = await supabase
        .from('estimates')
        .update({
          customer_id: estimateData.customer_id || null,
          estimate_number: estimateData.estimate_number,
          date: estimateData.date,
          expiry_date: estimateData.expiry_date || null,
          template_name: estimateData.template_name || 'template1',
          subtotal: estimateData.subtotal || 0,
          tax: estimateData.tax || 0,
          total: estimateData.total || 0,
          notes: estimateData.notes || null,
          status: estimateData.status || 'draft',
          updated_at: new Date().toISOString(),
        })
        .eq('id', estimateId)
        .select()
        .single();

      if (estimateError) throw estimateError;

      // Update estimate items if provided
      if (estimateData.items) {
        // Delete existing items
        await supabase
          .from('estimate_items')
          .delete()
          .eq('estimate_id', estimateId);

        // Insert new items
        if (estimateData.items.length > 0) {
          const items = estimateData.items.map((item, index) => ({
            estimate_id: estimateId,
            user_id: user.id,
            description: item.description || item.name,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.amount || 0,
            tax_rate: item.tax_rate || 0,
            total: (item.quantity || 1) * (item.unit_price || item.amount || 0),
            sort_order: index,
          }));

          const { error: itemsError } = await supabase
            .from('estimate_items')
            .insert(items);

          if (itemsError) throw itemsError;
        }
      }

      return { data: estimate, error: null };
    } catch (error) {
      console.error('Error updating estimate:', error);
      return { data: null, error };
    }
  },

  // Delete estimate
  async deleteEstimate(estimateId) {
    try {
      // Items will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('estimates')
        .delete()
        .eq('id', estimateId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting estimate:', error);
      return { error };
    }
  },

  // Update estimate status
  async updateEstimateStatus(estimateId, status) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', estimateId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating estimate status:', error);
      return { data: null, error };
    }
  },

  // Convert estimate to invoice
  async convertToInvoice(estimateId) {
    try {
      // Get the estimate with items
      const { data: estimate, error: fetchError } = await this.getEstimateById(estimateId);
      if (fetchError) throw fetchError;

      // Generate new invoice number
      const timestamp = Date.now();
      const invoiceNumber = `INV-${timestamp}`;

      // Create invoice data from estimate
      const invoiceData = {
        customer_id: estimate.customer_id,
        invoice_number: invoiceNumber,
        date: new Date().toISOString().split('T')[0],
        due_date: null, // Can be set later
        status: 'draft',
        subtotal: estimate.subtotal,
        tax: estimate.tax,
        total: estimate.total,
        notes: estimate.notes,
        template_name: estimate.template_name,
        items: estimate.estimate_items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate
        })) || []
      };

      // Create the invoice
      const { data: invoice, error: invoiceError } = await invoiceService.createInvoice(invoiceData);
      if (invoiceError) throw invoiceError;

      // Update estimate status to converted
      await this.updateEstimateStatus(estimateId, 'converted');

      return { data: invoice, error: null };
    } catch (error) {
      console.error('Error converting estimate to invoice:', error);
      return { data: null, error };
    }
  },

  // Search estimates
  async searchEstimates(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          customers (name, email),
          estimate_items (*)
        `)
        .or(`estimate_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching estimates:', error);
      return { data: null, error };
    }
  },

  // Filter estimates by status
  async getEstimatesByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('estimates')
        .select(`
          *,
          customers (name, email),
          estimate_items (*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching estimates by status:', error);
      return { data: null, error };
    }
  },

  // Get estimate statistics
  async getEstimateStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [totalResult, draftResult, sentResult, acceptedResult, declinedResult] = await Promise.all([
        supabase.from('estimates').select('total', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('estimates').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft'),
        supabase.from('estimates').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
        supabase.from('estimates').select('total').eq('user_id', user.id).eq('status', 'accepted'),
        supabase.from('estimates').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'declined')
      ]);

      const totalValue = acceptedResult.data?.reduce((sum, estimate) => sum + parseFloat(estimate.total || 0), 0) || 0;

      return {
        data: {
          totalEstimates: totalResult.count || 0,
          draftEstimates: draftResult.count || 0,
          sentEstimates: sentResult.count || 0,
          acceptedEstimates: acceptedResult.data?.length || 0,
          declinedEstimates: declinedResult.count || 0,
          totalValue
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching estimate stats:', error);
      return { data: null, error };
    }
  },

  // Duplicate estimate
  async duplicateEstimate(estimateId) {
    try {
      const { data: originalEstimate, error: fetchError } = await this.getEstimateById(estimateId);
      if (fetchError) throw fetchError;

      // Generate new estimate number
      const timestamp = Date.now();
      const newEstimateNumber = `${originalEstimate.estimate_number}-COPY-${timestamp}`;

      const duplicateData = {
        customer_id: originalEstimate.customer_id,
        estimate_number: newEstimateNumber,
        date: new Date().toISOString().split('T')[0],
        expiry_date: originalEstimate.expiry_date,
        template_name: originalEstimate.template_name,
        subtotal: originalEstimate.subtotal,
        tax: originalEstimate.tax,
        total: originalEstimate.total,
        notes: originalEstimate.notes,
        status: 'draft',
        items: originalEstimate.estimate_items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate
        })) || []
      };

      return await this.createEstimate(duplicateData);
    } catch (error) {
      console.error('Error duplicating estimate:', error);
      return { data: null, error };
    }
  }
};