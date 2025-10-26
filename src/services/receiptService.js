import { supabase } from '@/integrations/supabase/client';

export const receiptService = {
  // Get all receipts for the current user
  async getAllReceipts() {
    try {
      const { data, error } = await supabase
        .from('receipts')
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
          receipt_items (*)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching receipts:', error);
      return { data: null, error };
    }
  },

  // Get receipt by ID
  async getReceiptById(receiptId) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          customers (*),
          receipt_items (*)
        `)
        .eq('id', receiptId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching receipt:', error);
      return { data: null, error };
    }
  },

  // Create new receipt with items
  async createReceipt(receiptData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Create receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .insert({
          user_id: user.id,
          customer_id: receiptData.customer_id || null,
          receipt_number: receiptData.receipt_number,
          date: receiptData.date,
          template_name: receiptData.template_name || 'receipt1',
          subtotal: receiptData.subtotal || 0,
          tax: receiptData.tax || 0,
          total: receiptData.total || 0,
          payment_method: receiptData.payment_method || null,
          notes: receiptData.notes || null,
          status: receiptData.status || 'draft',
        })
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Create receipt items if provided
      if (receiptData.items && receiptData.items.length > 0) {
        const items = receiptData.items.map((item, index) => ({
          receipt_id: receipt.id,
          user_id: user.id,
          description: item.description || item.name,
          quantity: item.quantity || 1,
          unit_price: item.unit_price || item.amount || 0,
          tax_rate: item.tax_rate || 0,
          total: (item.quantity || 1) * (item.unit_price || item.amount || 0),
          sort_order: index,
        }));

        const { error: itemsError } = await supabase
          .from('receipt_items')
          .insert(items);

        if (itemsError) throw itemsError;
      }

      return { data: receipt, error: null };
    } catch (error) {
      console.error('Error creating receipt:', error);
      return { data: null, error };
    }
  },

  // Update receipt
  async updateReceipt(receiptId, receiptData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Update receipt
      const { data: receipt, error: receiptError } = await supabase
        .from('receipts')
        .update({
          customer_id: receiptData.customer_id || null,
          receipt_number: receiptData.receipt_number,
          date: receiptData.date,
          template_name: receiptData.template_name || 'receipt1',
          subtotal: receiptData.subtotal || 0,
          tax: receiptData.tax || 0,
          total: receiptData.total || 0,
          payment_method: receiptData.payment_method || null,
          notes: receiptData.notes || null,
          status: receiptData.status,
          updated_at: new Date().toISOString(),
        })
        .eq('id', receiptId)
        .select()
        .single();

      if (receiptError) throw receiptError;

      // Update receipt items if provided
      if (receiptData.items) {
        // Delete existing items
        await supabase
          .from('receipt_items')
          .delete()
          .eq('receipt_id', receiptId);

        // Insert new items
        if (receiptData.items.length > 0) {
          const items = receiptData.items.map((item, index) => ({
            receipt_id: receiptId,
            user_id: user.id,
            description: item.description || item.name,
            quantity: item.quantity || 1,
            unit_price: item.unit_price || item.amount || 0,
            tax_rate: item.tax_rate || 0,
            total: (item.quantity || 1) * (item.unit_price || item.amount || 0),
            sort_order: index,
          }));

          const { error: itemsError } = await supabase
            .from('receipt_items')
            .insert(items);

          if (itemsError) throw itemsError;
        }
      }

      return { data: receipt, error: null };
    } catch (error) {
      console.error('Error updating receipt:', error);
      return { data: null, error };
    }
  },

  // Update receipt status only
  async updateReceiptStatus(receiptId, status) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .update({ 
          status,
          updated_at: new Date().toISOString()
        })
        .eq('id', receiptId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating receipt status:', error);
      return { data: null, error };
    }
  },

  // Delete receipt
  async deleteReceipt(receiptId) {
    try {
      // Items will be deleted automatically due to CASCADE
      const { error } = await supabase
        .from('receipts')
        .delete()
        .eq('id', receiptId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting receipt:', error);
      return { error };
    }
  },

  // Search receipts
  async searchReceipts(searchTerm) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          customers (name, email),
          receipt_items (*)
        `)
        .or(`receipt_number.ilike.%${searchTerm}%,notes.ilike.%${searchTerm}%`)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error searching receipts:', error);
      return { data: null, error };
    }
  },

  // Filter receipts by payment method
  async getReceiptsByPaymentMethod(paymentMethod) {
    try {
      const { data, error } = await supabase
        .from('receipts')
        .select(`
          *,
          customers (name, email),
          receipt_items (*)
        `)
        .eq('payment_method', paymentMethod)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching receipts by payment method:', error);
      return { data: null, error };
    }
  },

  // Get receipt statistics
  async getReceiptStats() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const [totalResult, todayResult, thisMonthResult, thisYearResult] = await Promise.all([
        supabase.from('receipts').select('total').eq('user_id', user.id),
        supabase.from('receipts').select('total').eq('user_id', user.id).gte('date', new Date().toISOString().split('T')[0]),
        supabase.from('receipts').select('total').eq('user_id', user.id).gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
        supabase.from('receipts').select('total').eq('user_id', user.id).gte('date', new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0])
      ]);

      const totalRevenue = totalResult.data?.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0) || 0;
      const todayRevenue = todayResult.data?.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0) || 0;
      const monthRevenue = thisMonthResult.data?.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0) || 0;
      const yearRevenue = thisYearResult.data?.reduce((sum, receipt) => sum + parseFloat(receipt.total || 0), 0) || 0;

      return {
        data: {
          totalReceipts: totalResult.data?.length || 0,
          todayReceipts: todayResult.data?.length || 0,
          monthReceipts: thisMonthResult.data?.length || 0,
          yearReceipts: thisYearResult.data?.length || 0,
          totalRevenue,
          todayRevenue,
          monthRevenue,
          yearRevenue
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching receipt stats:', error);
      return { data: null, error };
    }
  },

  // Duplicate receipt
  async duplicateReceipt(receiptId) {
    try {
      const { data: originalReceipt, error: fetchError } = await this.getReceiptById(receiptId);
      if (fetchError) throw fetchError;

      // Generate new receipt number
      const timestamp = Date.now();
      const newReceiptNumber = `${originalReceipt.receipt_number}-COPY-${timestamp}`;

      const duplicateData = {
        customer_id: originalReceipt.customer_id,
        receipt_number: newReceiptNumber,
        date: new Date().toISOString().split('T')[0],
        template_name: originalReceipt.template_name,
        subtotal: originalReceipt.subtotal,
        tax: originalReceipt.tax,
        total: originalReceipt.total,
        payment_method: originalReceipt.payment_method,
        notes: originalReceipt.notes,
        items: originalReceipt.receipt_items?.map(item => ({
          description: item.description,
          quantity: item.quantity,
          unit_price: item.unit_price,
          tax_rate: item.tax_rate
        })) || []
      };

      return await this.createReceipt(duplicateData);
    } catch (error) {
      console.error('Error duplicating receipt:', error);
      return { data: null, error };
    }
  },

  // Generate receipt number
  async generateReceiptNumber() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Get user settings for prefix
      const { data: settings } = await supabase
        .from('user_settings')
        .select('receipt_prefix')
        .eq('user_id', user.id)
        .single();

      const prefix = settings?.receipt_prefix || 'REC-';
      const timestamp = Date.now();
      
      return `${prefix}${timestamp}`;
    } catch (error) {
      console.error('Error generating receipt number:', error);
      return `REC-${Date.now()}`;
    }
  }
};