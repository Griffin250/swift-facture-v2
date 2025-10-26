import { supabase } from '@/integrations/supabase/client';

export const frenchInvoiceService = {
  // Get all French invoices for the current user
  async getAllFrenchInvoices() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { data, error } = await supabase
        .from('invoices')
        .select('*')
        .eq('user_id', user.id)
        .eq('template_name', 'french_invoice')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Fetch invoice items separately for each invoice
      const invoicesWithItems = await Promise.all(
        (data || []).map(async (invoice) => {
          const { data: items } = await supabase
            .from('invoice_items')
            .select('*')
            .eq('invoice_id', invoice.id)
            .order('sort_order');
            
          return {
            ...invoice,
            invoice_items: items || []
          };
        })
      );
      
      return invoicesWithItems;
    } catch (error) {
      console.error('Error fetching French invoices:', error);
      return [];
    }
  },

  // Get French invoice by ID
  async getFrenchInvoiceById(invoiceId) {
    try {
      const { data, error } = await supabase
        .from('invoices')
        .select(`
          *,
          invoice_items (*)
        `)
        .eq('id', invoiceId)
        .eq('template_name', 'french_invoice')
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching French invoice:', error);
      return null;
    }
  },

  // Create new French invoice
  async createFrenchInvoice(invoiceData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate totals
      const totals = this.calculateTotals(invoiceData.items || []);

      // Prepare invoice data for database using existing schema
      const dbInvoiceData = {
        user_id: user.id,
        invoice_number: invoiceData.invoice?.number || `SF-${Date.now()}`,
        date: invoiceData.invoice?.date || new Date().toISOString().split('T')[0],
        due_date: invoiceData.invoice?.dueDate || null,
        status: 'draft',
        subtotal: totals.subtotal,
        tax: totals.vatAmount,
        total: totals.total,
        template_name: 'french_invoice',
        
        // Store French invoice specific data as JSON in notes field
        notes: JSON.stringify({
          type: 'french_invoice',
          company: invoiceData.company || {},
          client: invoiceData.client || {},
          invoice: invoiceData.invoice || {},
          payment: invoiceData.payment || {},
          footer: invoiceData.footer || {},
          operationType: invoiceData.invoice?.operationType || 'Livraison de marchandises',
          userNotes: invoiceData.invoice?.notes || ''
        })
      };

      // Create invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .insert(dbInvoiceData)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Create invoice items
      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map((item, index) => ({
          invoice_id: invoice.id,
          user_id: user.id,
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.unitPrice) || 0,
          tax_rate: parseFloat(item.vatRate) || 0,
          total: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
          sort_order: index
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return invoice;
    } catch (error) {
      console.error('Error creating French invoice:', error);
      throw error;
    }
  },

  // Update French invoice
  async updateFrenchInvoice(invoiceId, invoiceData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Calculate totals
      const totals = this.calculateTotals(invoiceData.items || []);

      // Prepare update data
      const updateData = {
        invoice_number: invoiceData.invoice?.number,
        date: invoiceData.invoice?.date,
        due_date: invoiceData.invoice?.dueDate || null,
        subtotal: totals.subtotal,
        tax: totals.vatAmount,
        total: totals.total,
        
        // Store French invoice specific data as JSON in notes field
        notes: JSON.stringify({
          type: 'french_invoice',
          company: invoiceData.company || {},
          client: invoiceData.client || {},
          invoice: invoiceData.invoice || {},
          payment: invoiceData.payment || {},
          footer: invoiceData.footer || {},
          operationType: invoiceData.invoice?.operationType || 'Livraison de marchandises',
          userNotes: invoiceData.invoice?.notes || ''
        })
      };

      // Update invoice
      const { data: invoice, error: invoiceError } = await supabase
        .from('invoices')
        .update(updateData)
        .eq('id', invoiceId)
        .eq('user_id', user.id)
        .select()
        .single();

      if (invoiceError) throw invoiceError;

      // Delete existing items and create new ones
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      if (invoiceData.items && invoiceData.items.length > 0) {
        const items = invoiceData.items.map((item, index) => ({
          invoice_id: invoiceId,
          user_id: user.id,
          description: item.description || '',
          quantity: parseFloat(item.quantity) || 0,
          unit_price: parseFloat(item.unitPrice) || 0,
          tax_rate: parseFloat(item.vatRate) || 0,
          total: (parseFloat(item.quantity) || 0) * (parseFloat(item.unitPrice) || 0),
          sort_order: index,
          item_data: {
            unit: item.unit || 'pce',
            date: item.date || invoice.date
          }
        }));

        const { error: itemsError } = await supabase
          .from('invoice_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return invoice;
    } catch (error) {
      console.error('Error updating French invoice:', error);
      throw error;
    }
  },

  // Delete French invoice
  async deleteFrenchInvoice(invoiceId) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Delete invoice items first (foreign key constraint)
      await supabase
        .from('invoice_items')
        .delete()
        .eq('invoice_id', invoiceId);

      // Delete invoice
      const { error } = await supabase
        .from('invoices')
        .delete()
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error deleting French invoice:', error);
      throw error;
    }
  },

  // Calculate totals for French invoice
  calculateTotals(items) {
    let subtotal = 0;
    let vatAmount = 0;

    items.forEach(item => {
      const quantity = parseFloat(item.quantity) || 0;
      const unitPrice = parseFloat(item.unitPrice) || 0;
      const vatRate = parseFloat(item.vatRate) || 0;
      
      const lineTotal = quantity * unitPrice;
      const lineVat = lineTotal * (vatRate / 100);
      
      subtotal += lineTotal;
      vatAmount += lineVat;
    });

    return {
      subtotal: Math.round(subtotal * 100) / 100,
      vatAmount: Math.round(vatAmount * 100) / 100,
      total: Math.round((subtotal + vatAmount) * 100) / 100
    };
  },

  // Update invoice status
  async updateInvoiceStatus(invoiceId, status) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const { error } = await supabase
        .from('invoices')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', invoiceId)
        .eq('user_id', user.id);

      if (error) throw error;
      return true;
    } catch (error) {
      console.error('Error updating invoice status:', error);
      throw error;
    }
  }
};