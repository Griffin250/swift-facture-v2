import { supabase } from '@/integrations/supabase/client';

export const userSettingsService = {
  // Get user settings
  async getUserSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Try to get existing settings
      const { data, error } = await supabase
        .from('user_settings')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle(); // Use maybeSingle instead of single to handle no results gracefully

      if (error) {
        console.error('Database error fetching user settings:', error);
        // Return default settings on any database error
        return {
          default_currency: 'USD',
          default_tax_rate: 0,
          invoice_prefix: 'INV-',
          estimate_prefix: 'EST-',
          receipt_prefix: 'REC-',
          default_template: 'template1',
          language: 'en',
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY'
        };
      }

      // If no settings exist, create default ones
      if (!data) {
        const defaultSettings = {
          user_id: user.id,
          default_currency: 'USD',
          default_tax_rate: 0,
          invoice_prefix: 'INV-',
          estimate_prefix: 'EST-',
          receipt_prefix: 'REC-',
          default_template: 'template1',
          language: 'en',
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY'
        };

        // Try to create the default settings
        const { data: newSettings, error: createError } = await supabase
          .from('user_settings')
          .insert(defaultSettings)
          .select()
          .single();

        if (createError) {
          console.error('Error creating default user settings:', createError);
          // Return defaults if creation fails
          return {
            default_currency: 'USD',
            default_tax_rate: 0,
            invoice_prefix: 'INV-',
            estimate_prefix: 'EST-',
            receipt_prefix: 'REC-',
            default_template: 'template1',
            language: 'en',
            timezone: 'UTC',
            date_format: 'MM/DD/YYYY'
          };
        }

        return newSettings;
      }

      return data;
    } catch (error) {
      console.error('Error fetching user settings:', error);
      // Return default settings on error
      return {
        default_currency: 'USD',
        default_tax_rate: 0,
        invoice_prefix: 'INV-',
        estimate_prefix: 'EST-',
        receipt_prefix: 'REC-',
        default_template: 'template1',
        language: 'en',
        timezone: 'UTC',
        date_format: 'MM/DD/YYYY'
      };
    }
  },

  // Create or update user settings
  async updateUserSettings(settingsData) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // First try to update existing settings
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (existingSettings) {
        // Update existing settings
        const { data, error } = await supabase
          .from('user_settings')
          .update({
            default_currency: settingsData.default_currency,
            default_tax_rate: settingsData.default_tax_rate,
            invoice_prefix: settingsData.invoice_prefix,
            estimate_prefix: settingsData.estimate_prefix,
            receipt_prefix: settingsData.receipt_prefix,
            default_template: settingsData.default_template,
            language: settingsData.language,
            timezone: settingsData.timezone,
            date_format: settingsData.date_format,
            updated_at: new Date().toISOString(),
          })
          .eq('user_id', user.id)
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      } else {
        // Create new settings
        const { data, error } = await supabase
          .from('user_settings')
          .insert({
            user_id: user.id,
            default_currency: settingsData.default_currency || 'USD',
            default_tax_rate: settingsData.default_tax_rate || 0,
            invoice_prefix: settingsData.invoice_prefix || 'INV-',
            estimate_prefix: settingsData.estimate_prefix || 'EST-',
            receipt_prefix: settingsData.receipt_prefix || 'REC-',
            default_template: settingsData.default_template || 'template1',
            language: settingsData.language || 'en',
            timezone: settingsData.timezone || 'UTC',
            date_format: settingsData.date_format || 'MM/DD/YYYY',
          })
          .select()
          .single();

        if (error) throw error;
        return { data, error: null };
      }
    } catch (error) {
      console.error('Error updating user settings:', error);
      return { data: null, error };
    }
  },

  // Update specific setting
  async updateSetting(key, value) {
    try {
      const { data: settings, error: fetchError } = await this.getUserSettings();
      if (fetchError) throw fetchError;

      const updatedSettings = { ...settings, [key]: value };
      return await this.updateUserSettings(updatedSettings);
    } catch (error) {
      console.error('Error updating specific setting:', error);
      return { data: null, error };
    }
  },

  // Get default currency
  async getDefaultCurrency() {
    try {
      const { data: settings, error } = await this.getUserSettings();
      if (error) throw error;

      return { data: settings.default_currency || 'USD', error: null };
    } catch (error) {
      console.error('Error fetching default currency:', error);
      return { data: 'USD', error };
    }
  },

  // Set default currency
  async setDefaultCurrency(currency) {
    try {
      return await this.updateSetting('default_currency', currency);
    } catch (error) {
      console.error('Error setting default currency:', error);
      return { data: null, error };
    }
  },

  // Get default tax rate
  async getDefaultTaxRate() {
    try {
      const { data: settings, error } = await this.getUserSettings();
      if (error) throw error;

      return { data: settings.default_tax_rate || 0, error: null };
    } catch (error) {
      console.error('Error fetching default tax rate:', error);
      return { data: 0, error };
    }
  },

  // Set default tax rate
  async setDefaultTaxRate(taxRate) {
    try {
      return await this.updateSetting('default_tax_rate', taxRate);
    } catch (error) {
      console.error('Error setting default tax rate:', error);
      return { data: null, error };
    }
  },

  // Get user language preference
  async getUserLanguage() {
    try {
      const { data: settings, error } = await this.getUserSettings();
      if (error) throw error;

      return { data: settings.language || 'en', error: null };
    } catch (error) {
      console.error('Error fetching user language:', error);
      return { data: 'en', error };
    }
  },

  // Set user language preference
  async setUserLanguage(language) {
    try {
      return await this.updateSetting('language', language);
    } catch (error) {
      console.error('Error setting user language:', error);
      return { data: null, error };
    }
  },

  // Get default template
  async getDefaultTemplate() {
    try {
      const { data: settings, error } = await this.getUserSettings();
      if (error) throw error;

      return { data: settings.default_template || 'template1', error: null };
    } catch (error) {
      console.error('Error fetching default template:', error);
      return { data: 'template1', error };
    }
  },

  // Set default template
  async setDefaultTemplate(template) {
    try {
      return await this.updateSetting('default_template', template);
    } catch (error) {
      console.error('Error setting default template:', error);
      return { data: null, error };
    }
  },

  // Generate next invoice number
  async generateInvoiceNumber() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const settings = await this.getUserSettings();

      // Get the last invoice number for this user
      const { data: lastInvoice } = await supabase
        .from('invoices')
        .select('invoice_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      const prefix = settings.invoice_prefix || 'INV-';
      
      if (lastInvoice && lastInvoice.invoice_number.startsWith(prefix)) {
        // Extract number and increment
        const lastNumber = parseInt(lastInvoice.invoice_number.replace(prefix, '')) || 0;
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        // Start with 0001
        return `${prefix}0001`;
      }
    } catch (error) {
      console.error('Error generating invoice number:', error);
      return `INV-${Date.now()}`;
    }
  },

  // Generate next estimate number
  async generateEstimateNumber() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const settings = await this.getUserSettings();

      // Get the last estimate number for this user
      const { data: lastEstimate } = await supabase
        .from('estimates')
        .select('estimate_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const prefix = settings.estimate_prefix || 'EST-';
      
      if (lastEstimate && lastEstimate.estimate_number.startsWith(prefix)) {
        // Extract number and increment
        const lastNumber = parseInt(lastEstimate.estimate_number.replace(prefix, '')) || 0;
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        // Start with 0001
        return `${prefix}0001`;
      }
    } catch (error) {
      console.error('Error generating estimate number:', error);
      return `EST-${Date.now()}`;
    }
  },

  // Generate next receipt number
  async generateReceiptNumber() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const settings = await this.getUserSettings();

      // Get the last receipt number for this user
      const { data: lastReceipt } = await supabase
        .from('receipts')
        .select('receipt_number')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      const prefix = settings.receipt_prefix || 'REC-';
      
      if (lastReceipt && lastReceipt.receipt_number.startsWith(prefix)) {
        // Extract number and increment
        const lastNumber = parseInt(lastReceipt.receipt_number.replace(prefix, '')) || 0;
        return `${prefix}${String(lastNumber + 1).padStart(4, '0')}`;
      } else {
        // Start with 0001
        return `${prefix}0001`;
      }
    } catch (error) {
      console.error('Error generating receipt number:', error);
      return `REC-${Date.now()}`;
    }
  },

  // Initialize default settings for new users
  async initializeDefaultSettings() {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // Check if settings already exist
      const { data: existingSettings } = await supabase
        .from('user_settings')
        .select('id')
        .eq('user_id', user.id)
        .single();

      if (!existingSettings) {
        // Create default settings
        return await this.updateUserSettings({
          default_currency: 'USD',
          default_tax_rate: 0,
          invoice_prefix: 'INV-',
          estimate_prefix: 'EST-',
          receipt_prefix: 'REC-',
          default_template: 'template1',
          language: 'en',
          timezone: 'UTC',
          date_format: 'MM/DD/YYYY'
        });
      }

      return { data: existingSettings, error: null };
    } catch (error) {
      console.error('Error initializing default settings:', error);
      return { data: null, error };
    }
  }
};