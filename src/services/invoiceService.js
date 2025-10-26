import { supabase } from '@/integrations/supabase/client';

export const invoiceService = {
  // Get all invoices for the current user
  async getAllInvoices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch invoice items separately for each invoice
      const invoicesWithItems = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: items } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id);
            
          return {
            ...invoice,
            invoice_items: items || []
          };
        })
      );
      
      return invoicesWithItems;
    } catch (error) {
      console.error('Error fetching invoices:', error);
      return [];
    }
  },

  // Get invoice by ID
  async getInvoiceById(invoiceId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (*),
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching invoice:', error);
      return null;
    }
  },

  // Create new invoice with items
  async createInvoice(invoiceData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Start transaction
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert({
          user_id: user.id,
          customer_id: invoiceData.customer_id || null,
          invoice_number: invoiceData.invoice_number,
          date: invoiceData.invoice_date || invoiceData.date || new Date().toISOString().split('T')[0],
          due_date: invoiceData.due_date,
          status: invoiceData.status || 'draft',
          subtotal: invoiceData.subtotal || 0,
          tax: invoiceData.tax_amount || 0,
          total: invoiceData.total_amount || invoiceData.total || 0,
          notes: invoiceData.notes,
          template_name: invoiceData.template_name || 'template1',
        })
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items if provided
      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map((item, index) => ({
          invoice_id: invoice.id,
          user_id: user.id,
          description: item.description || item.name,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.amount || 0,
          tax_rate: item.tax_rate || 0,
          total: (item.quantity || 1) * (item.unit_price || item.amount || 0),
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return invoice;
    } catch (error) {
      console.error('Error creating invoice:', error);
      throw error;
    }
  },

  // Update invoice
  async updateInvoice(invoiceId, invoiceData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update({
          customer_id: invoiceData.customer_id || null,
          invoice_number: invoiceData.invoice_number,
          date: invoiceData.date,
          due_date: invoiceData.due_date || null,
          status: invoiceData.status || 'draft',
          subtotal: invoiceData.subtotal || 0,
          tax: invoiceData.tax || 0,
          total: invoiceData.total || 0,
          notes: invoiceData.notes || null,
          template_name: invoiceData.template_name || 'template1',
          updated_at: new Date().toISOString(),
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Update invoice items if provided
      if (invoiceData.items) {
        // Delete existing items
        await supabase
          .from('invoice_items')
          .delete()
          .eq('invoice_id', invoiceId);

        // Insert new items
        if (invoiceData.items.length > 0) {
          const items = invoiceData.items.map((item, index) => ({
            invoice_id: invoiceId,
            user_id: user.id,
            description: item.description || item.name,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.amount || 0,
            tax_rate: item.tax_rate || 0,
            total: (item.quantity || 1) * (item.unit_price || item.amount || 0),
            sort_order: index,
          }));

          const { error: itemsError } = await supabase
            .from('invoice_items')
            .insert(items);

          if (itemsError) throw itemsError;
        }
      }

      return { data: invoice, error: null };
    } catch (error) {
      console.error('Error updating invoice:', error);
      return { data: null, error };
    }
  },

  // Delete invoice
  async deleteInvoice(invoiceId) {
    try {
      // Items will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting invoice:', error);
      return { error };
    }
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceId, status) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating invoice status:', error);
      return { data: null, error };
    }
  },

  // Search invoices
  async searchInvoices(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name, email),
          invoice_items (*)
        `)
        .or(`invoice_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching invoices:', error);
      return { data: null, error };
    }
  },

  // Filter invoices by status
  async getInvoicesByStatus(status) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          customers (name, email),
          invoice_items (*)
        `)
        .eq('status', status)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching invoices by status:', error);
      return { data: null, error };
    }
  },

  // Get invoice statistics
  async getInvoiceStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [totalResult, draftResult, sentResult, paidResult, overdueResult] = await Promise.all([
        supabase.from('invoices').select('total', { count: 'exact', head: true }).eq('user_id', user.id),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'draft'),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'sent'),
        supabase.from('invoices').select('total').eq('user_id', user.id).eq('status', 'paid'),
        supabase.from('invoices').select('id', { count: 'exact', head: true }).eq('user_id', user.id).eq('status', 'overdue')
      ]);

      const totalRevenue = paidResult.data?.reduce((sum, invoice) => sum + parseFloat(invoice.total || 0), 0) || 0;

      return {
        data: {
          totalInvoices: totalResult.count || 0,
          draftInvoices: draftResult.count || 0,
          sentInvoices: sentResult.count || 0,
          paidInvoices: paidResult.data?.length || 0,
          overdueInvoices: overdueResult.count || 0,
          totalRevenue
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching invoice stats:', error);
      return { data: null, error };
    }
  },

  // Duplicate invoice
  async duplicateInvoice(invoiceId) {
    try {
      const { data: originalInvoice, error: fetchError } = await this.getInvoiceById(invoiceId);
      if (fetchError) throw fetchError;

      // Generate new invoice number
      const timestamp = Date.now();
      const newInvoiceNumber = `${originalInvoice.invoice_number}-COPY-${timestamp}`;

      const duplicateData = {
        customer_id: originalInvoice.customer_id,
        invoice_number: newInvoiceNumber,
        date: new Date().toISOString().split('T')[0],
        due_date: originalInvoice.due_date,
        status: 'draft',
        subtotal: originalInvoice.subtotal,
        tax: originalInvoice.tax,
        total: originalInvoice.total,
        notes: originalInvoice.notes,
        template_name: originalInvoice.template_name,
        items: originalInvoice.invoice_items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate
        })) || []
      };

      return await this.createInvoice(duplicateData);
    } catch (error) {
      console.error('Error duplicating invoice:', error);
      return { data: null, error };
    }
  }
};