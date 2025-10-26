import { supabase } from '../integrations/supabase/client';

// Admin document service for managing all documents across all users
export const adminDocumentService = {
  // Get all documents (invoices, estimates, receipts) across all users with pagination
  async getAllDocuments(page = 1, limit = 10, filters = {}) {
    try {
      console.log('🔧 Admin service: getAllDocuments called', { page, limit, filters });
      const offset = (page - 1) * limit;
      const { documentType, userId, status, dateRange } = filters;

      // Base query for invoices - include user profile data
      let invoiceQuery = supabase
        .from('invoices')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .order('created_at', { ascending: false });

      // Base query for estimates - include user profile data
      let estimateQuery = supabase
        .from('estimates')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .order('created_at', { ascending: false });

      // Base query for receipts - include user profile data
      let receiptQuery = supabase
        .from('receipts')
        .select(`
          *,
          profiles:user_id(*)
        `)
        .order('created_at', { ascending: false });

      // French invoices are stored in the regular invoices table with a type field
      // No separate french_invoices table needed

      // Apply filters
      if (userId) {
        invoiceQuery = invoiceQuery.eq('user_id', userId);
        estimateQuery = estimateQuery.eq('user_id', userId);
        receiptQuery = receiptQuery.eq('user_id', userId);
      }

      if (status) {
        invoiceQuery = invoiceQuery.eq('status', status);
        estimateQuery = estimateQuery.eq('status', status);
      }

      if (dateRange?.start) {
        invoiceQuery = invoiceQuery.gte('created_at', dateRange.start);
        estimateQuery = estimateQuery.gte('created_at', dateRange.start);
        receiptQuery = receiptQuery.gte('created_at', dateRange.start);
      }

      if (dateRange?.end) {
        invoiceQuery = invoiceQuery.lte('created_at', dateRange.end);
        estimateQuery = estimateQuery.lte('created_at', dateRange.end);
        receiptQuery = receiptQuery.lte('created_at', dateRange.end);
      }

      // Execute queries based on document type filter
      let documents = [];
      
      // First, let's check what columns exist in invoices table
      console.log('🧪 Testing simple invoice query...');
      const { data: testInvoices, error: testError } = await supabase
        .from('invoices')
        .select('*')
        .limit(5);
      
      console.log('🧪 Test invoices:', testInvoices?.length || 0, testError);
      if (testInvoices && testInvoices.length > 0) {
        console.log('🔍 Invoice columns:', Object.keys(testInvoices[0]));
        console.log('🔍 Sample invoice data:', testInvoices[0]);
      }
      
      if (!documentType || documentType === 'invoice') {
        console.log('📊 Fetching invoices...');
        const { data: invoices, error: invoiceError } = await invoiceQuery;
        if (invoiceError) {
          console.error('❌ Invoice query error:', invoiceError);
          throw invoiceError;
        }
        console.log('✅ Invoices fetched:', invoices?.length || 0);
        if (invoices && invoices.length > 0) {
          console.log('🔍 Sample invoice with profile:', invoices[0]);
          if (invoices[0].profiles) {
            console.log('👤 Profile columns available:', Object.keys(invoices[0].profiles));
          }
        }
        
        documents.push(...(invoices || []).map(doc => ({
          ...doc,
          document_type: doc.invoice_type === 'french' ? 'french_invoice' : 'invoice',
          document_number: doc.invoice_number,
          customer_name: doc.customer_name || 'N/A'
        })));
      }

      if (!documentType || documentType === 'estimate') {
        try {
          console.log('📊 Fetching estimates...');
          const { data: estimates, error: estimateError } = await estimateQuery;
          if (estimateError) {
            console.warn('⚠️ Estimates query error, skipping...', estimateError);
          } else {
            console.log('✅ Estimates fetched:', estimates?.length || 0);
            documents.push(...(estimates || []).map(doc => ({
              ...doc,
              document_type: 'estimate',
              document_number: doc.estimate_number,
              customer_name: doc.customer_name || 'N/A'
            })));
          }
        } catch (error) {
          console.warn('⚠️ Error fetching estimates, skipping...', error);
        }
      }

      if (!documentType || documentType === 'receipt') {
        try {
          console.log('📊 Fetching receipts...');
          const { data: receipts, error: receiptError } = await receiptQuery;
          if (receiptError) {
            console.warn('⚠️ Receipts query error, skipping...', receiptError);
          } else {
            console.log('✅ Receipts fetched:', receipts?.length || 0);
            documents.push(...(receipts || []).map(doc => ({
              ...doc,
              document_type: 'receipt',
              document_number: doc.receipt_number,
              customer_name: doc.customer_name || 'N/A'
            })));
          }
        } catch (error) {
          console.warn('⚠️ Error fetching receipts, skipping...', error);
        }
      }

      // French invoices are stored in the invoices table with an invoice_type field
      // They will be included in the invoice query above

      console.log('📋 Total documents collected:', documents.length);
      
      if (documents.length === 0) {
        console.warn('⚠️ No documents found! This might indicate a database issue.');
        return { 
          documents: [], 
          error: null, 
          totalCount: 0,
          currentPage: page,
          totalPages: 0,
          stats: {
            total: 0,
            invoices: 0,
            estimates: 0,
            receipts: 0,
            frenchInvoices: 0,
            totalValue: 0
          }
        };
      }
      
      // Sort all documents by created_at
      documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      // Apply pagination
      const totalCount = documents.length;
      const paginatedDocuments = documents.slice(offset, offset + limit);
      
      console.log('📄 Paginated documents:', paginatedDocuments.length, 'of', totalCount);
      console.log('📄 First document sample:', paginatedDocuments[0]);

      // Calculate stats
      const stats = {
        total: documents.length,
        invoices: documents.filter(d => d.document_type === 'invoice' || d.document_type === 'french_invoice').length,
        estimates: documents.filter(d => d.document_type === 'estimate').length,
        receipts: documents.filter(d => d.document_type === 'receipt').length,
        totalValue: documents.reduce((sum, doc) => sum + (parseFloat(doc.total) || 0), 0)
      };

      console.log('📊 Final stats:', stats);

      return { 
        documents: paginatedDocuments, 
        error: null, 
        totalCount,
        currentPage: page,
        totalPages: Math.ceil(totalCount / limit),
        stats
      };
    } catch (error) {
      console.error('Error fetching admin documents:', error);
      return { 
        documents: [], 
        error, 
        totalCount: 0, 
        currentPage: 1, 
        totalPages: 0,
        stats: {
          total: 0,
          invoices: 0,
          estimates: 0,
          receipts: 0,
          totalValue: 0
        }
      };
    }
  },

  // Get document statistics
  async getDocumentStats() {
    try {
      const [invoiceStats, estimateStats, receiptStats, frenchInvoiceStats] = await Promise.all([
        supabase.from('invoices').select('status', { count: 'exact' }),
        supabase.from('estimates').select('status', { count: 'exact' }),
        supabase.from('receipts').select('id', { count: 'exact' }),
        supabase.from('french_invoices').select('status', { count: 'exact' })
      ]);

      const { data: invoices } = await supabase
        .from('invoices')
        .select('status, total')
        .not('status', 'is', null);

      const { data: estimates } = await supabase
        .from('estimates') 
        .select('status, total')
        .not('status', 'is', null);

      const { data: receipts } = await supabase
        .from('receipts')
        .select('total');

      const { data: frenchInvoices } = await supabase
        .from('french_invoices')
        .select('status, total')
        .not('status', 'is', null);

      // Calculate totals
      const invoiceTotal = (invoices || []).reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);
      const estimateTotal = (estimates || []).reduce((sum, est) => sum + (parseFloat(est.total) || 0), 0);
      const receiptTotal = (receipts || []).reduce((sum, rec) => sum + (parseFloat(rec.total) || 0), 0);
      const frenchInvoiceTotal = (frenchInvoices || []).reduce((sum, inv) => sum + (parseFloat(inv.total) || 0), 0);

      // Count by status
      const invoiceStatusCount = {};
      const estimateStatusCount = {};
      
      (invoices || []).forEach(inv => {
        invoiceStatusCount[inv.status] = (invoiceStatusCount[inv.status] || 0) + 1;
      });
      
      (estimates || []).forEach(est => {
        estimateStatusCount[est.status] = (estimateStatusCount[est.status] || 0) + 1;
      });

      return {
        data: {
          invoices: {
            count: invoiceStats.count || 0,
            total: invoiceTotal,
            statusBreakdown: invoiceStatusCount
          },
          estimates: {
            count: estimateStats.count || 0,
            total: estimateTotal,
            statusBreakdown: estimateStatusCount
          },
          receipts: {
            count: receiptStats.count || 0,
            total: receiptTotal
          },
          frenchInvoices: {
            count: frenchInvoiceStats.count || 0,
            total: frenchInvoiceTotal
          }
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching document stats:', error);
      return { data: null, error };
    }
  }
};

// Admin service for managing users and profiles
export const adminUserService = {
  // Get all users with their profiles
  async getAllUsers() {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          customers:customers(count),
          invoices:invoices(count),
          estimates:estimates(count),
          receipts:receipts(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching users:', error);
      return { data: null, error };
    }
  },

  // Get user by ID with detailed information
  async getUserById(userId) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`
          *,
          customers:customers(*),
          invoices:invoices(*),
          estimates:estimates(*),
          receipts:receipts(*),
          user_settings:user_settings(*)
        `)
        .eq('id', userId)
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching user:', error);
      return { data: null, error };
    }
  },

  // Update user profile
  async updateUser(userId, userData) {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .update({
          first_name: userData.firstName,
          last_name: userData.lastName,
          company_name: userData.companyName,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error updating user:', error);
      return { data: null, error };
    }
  },

  // Delete user (this will cascade to all related data)
  async deleteUser(userId) {
    try {
      // First delete from auth.users (this will cascade to profiles)
      const { error } = await supabase.auth.admin.deleteUser(userId);
      
      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting user:', error);
      return { error };
    }
  },

  // Get users with pagination, search, and filtering
  async getUsers({ page = 1, limit = 10, search = '', filters = {} }) {
    try {
      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' });

      // Apply search filter
      if (search) {
        query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%,company_name.ilike.%${search}%`);
      }

      // Apply status filter (if provided)
      if (filters.status) {
        // Note: You may need to add a status column to profiles table
        // For now, we'll assume all users are 'active'
        if (filters.status !== 'active') {
          // Return empty results for non-active statuses until status field is implemented
          return { data: { users: [], total: 0 }, error: null };
        }
      }

      // Apply role filter (if provided)
      if (filters.role) {
        // Note: You may need to add a role column to profiles table
        // For now, we'll skip role filtering
      }

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      
      const { data, error, count } = await query
        .range(from, to)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // For better performance, get all counts in bulk then match them up
      const userIds = data?.map(user => user.id) || [];
      
      // Get roles and counts for all users at once
      const [rolesData, customersData, invoicesData, estimatesData, receiptsData] = await Promise.all([
        supabase.from('user_roles').select('user_id, role').in('user_id', userIds),
        supabase.from('customers').select('user_id').in('user_id', userIds),
        supabase.from('invoices').select('user_id').in('user_id', userIds),
        supabase.from('estimates').select('user_id').in('user_id', userIds),
        supabase.from('receipts').select('user_id').in('user_id', userIds)
      ]);

      // Count occurrences and roles for each user
      const userRoles = {};
      const customerCounts = {};
      const invoiceCounts = {};
      const estimateCounts = {};
      const receiptCounts = {};

      rolesData.data?.forEach(item => {
        userRoles[item.user_id] = item.role;
      });

      customersData.data?.forEach(item => {
        customerCounts[item.user_id] = (customerCounts[item.user_id] || 0) + 1;
      });

      invoicesData.data?.forEach(item => {
        invoiceCounts[item.user_id] = (invoiceCounts[item.user_id] || 0) + 1;
      });

      estimatesData.data?.forEach(item => {
        estimateCounts[item.user_id] = (estimateCounts[item.user_id] || 0) + 1;
      });

      receiptsData.data?.forEach(item => {
        receiptCounts[item.user_id] = (receiptCounts[item.user_id] || 0) + 1;
      });

      // Format the data to match expected structure
      const formattedUsers = data?.map(user => ({
        id: user.id,
        full_name: user.first_name && user.last_name ? `${user.first_name} ${user.last_name}` : null,
        email: user.email,
        company_name: user.company_name,
        role: userRoles[user.id] || 'user', // Get role from user_roles table
        status: user.status || 'active', // Default status
        last_sign_in_at: user.last_sign_in_at,
        created_at: user.created_at,
        customers_count: customerCounts[user.id] || 0,
        invoices_count: invoiceCounts[user.id] || 0,
        estimates_count: estimateCounts[user.id] || 0,
        receipts_count: receiptCounts[user.id] || 0
      })) || [];

      return { 
        data: { 
          users: formattedUsers, 
          total: count || 0 
        }, 
        error: null 
      };
    } catch (error) {
      console.error('Error fetching users with pagination:', error);
      return { data: { users: [], total: 0 }, error };
    }
  },

  // Reset user password
  async resetUserPassword(userId) {
    try {
      // Get user email first
      const { data: user, error: userError } = await supabase
        .from('profiles')
        .select('email')
        .eq('id', userId)
        .single();

      if (userError) throw userError;

      // Send password reset email
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error resetting user password:', error);
      return { error };
    }
  },

  // Get user statistics
  async getUserStats() {
    try {
      const [usersResult, customersResult, invoicesResult, estimatesResult, receiptsResult] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('id', { count: 'exact', head: true }),
        supabase.from('estimates').select('id', { count: 'exact', head: true }),
        supabase.from('receipts').select('id', { count: 'exact', head: true })
      ]);

      return {
        data: {
          totalUsers: usersResult.count || 0,
          totalCustomers: customersResult.count || 0,
          totalInvoices: invoicesResult.count || 0,
          totalEstimates: estimatesResult.count || 0,
          totalReceipts: receiptsResult.count || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching user stats:', error);
      return { data: null, error };
    }
  },

  // Get recent activity
  async getRecentActivity(limit = 10) {
    try {
      const { data, error } = await supabase
        .from('activity_logs')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email
          )
        `)
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return { data: null, error };
    }
  }
};

// Admin service for managing customers
export const adminCustomerService = {
  // Get all customers across all users
  async getAllCustomers() {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select(`
          *,
          profiles:user_id (
            first_name,
            last_name,
            email,
            company_name
          ),
          invoices:invoices(count),
          estimates:estimates(count),
          receipts:receipts(count)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;
      return { data, error: null };
    } catch (error) {
      console.error('Error fetching customers:', error);
      return { data: null, error };
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
      return { error: null };
    } catch (error) {
      console.error('Error deleting customer:', error);
      return { error };
    }
  }
};

// Admin service for managing invoices, estimates, and receipts (legacy)
export const adminDocumentServiceLegacy = {
  // Get all documents (invoices, estimates, receipts)
  async getAllDocuments(type = 'all') {
    try {
      const queries = [];
      
      if (type === 'all' || type === 'invoices') {
        queries.push(
          supabase
            .from('invoices')
            .select(`
              *,
              profiles:user_id (first_name, last_name, email, company_name),
              customers:customer_id (name, email)
            `)
            .order('created_at', { ascending: false })
        );
      }
      
      if (type === 'all' || type === 'estimates') {
        queries.push(
          supabase
            .from('estimates')
            .select(`
              *,
              profiles:user_id (first_name, last_name, email, company_name),
              customers:customer_id (name, email)
            `)
            .order('created_at', { ascending: false })
        );
      }
      
      if (type === 'all' || type === 'receipts') {
        queries.push(
          supabase
            .from('receipts')
            .select(`
              *,
              profiles:user_id (first_name, last_name, email, company_name),
              customers:customer_id (name, email)
            `)
            .order('created_at', { ascending: false })
        );
      }

      const results = await Promise.all(queries);
      const documents = [];
      
      results.forEach((result, index) => {
        if (result.data) {
          const docType = type === 'all' 
            ? ['invoices', 'estimates', 'receipts'][index] 
            : type;
          
          result.data.forEach(doc => {
            documents.push({
              ...doc,
              document_type: docType,
              number: doc.invoice_number || doc.estimate_number || doc.receipt_number
            });
          });
        }
      });

      // Sort by created_at descending
      documents.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

      return { data: documents, error: null };
    } catch (error) {
      console.error('Error fetching documents:', error);
      return { data: null, error };
    }
  },

  // Delete document
  async deleteDocument(documentId, documentType) {
    try {
      const table = documentType === 'invoices' ? 'invoices' 
                  : documentType === 'estimates' ? 'estimates' 
                  : 'receipts';
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', documentId);

      if (error) throw error;
      return { error: null };
    } catch (error) {
      console.error('Error deleting document:', error);
      return { error };
    }
  }
};

// Admin service for analytics and dashboard data
export const adminAnalyticsService = {
  // Get dashboard metrics
  async getDashboardMetrics() {
    try {
      const [
        usersCount,
        customersCount,
        invoicesData,
        estimatesCount,
        receiptsCount,
        revenueData
      ] = await Promise.all([
        supabase.from('profiles').select('id', { count: 'exact', head: true }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('total, status, created_at'),
        supabase.from('estimates').select('id', { count: 'exact', head: true }),
        supabase.from('receipts').select('id', { count: 'exact', head: true }),
        supabase.from('invoices').select('total, created_at').eq('status', 'paid')
      ]);

      // Calculate revenue
      const totalRevenue = revenueData.data?.reduce((sum, invoice) => 
        sum + parseFloat(invoice.total || 0), 0) || 0;

      // Calculate active trials (users created in last 30 days without paid invoices)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      
      const { data: trialUsers } = await supabase
        .from('profiles')
        .select('id')
        .gte('created_at', thirtyDaysAgo.toISOString());

      return {
        data: {
          totalUsers: usersCount.count || 0,
          totalCustomers: customersCount.count || 0,
          totalInvoices: invoicesData.data?.length || 0,
          totalEstimates: estimatesCount.count || 0,
          totalReceipts: receiptsCount.count || 0,
          totalRevenue: totalRevenue,
          activeTrials: trialUsers?.length || 0,
          paidInvoices: revenueData.data?.length || 0
        },
        error: null
      };
    } catch (error) {
      console.error('Error fetching dashboard metrics:', error);
      return { data: null, error };
    }
  },

  // Get recent activity for dashboard
  async getRecentActivity(limit = 20) {
    try {
      // Get recent users
      const { data: recentUsers } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent invoices with user data
      const { data: recentInvoicesRaw } = await supabase
        .from('invoices')
        .select('id, invoice_number, total, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get recent estimates with user data
      const { data: recentEstimatesRaw } = await supabase
        .from('estimates')
        .select('id, estimate_number, total, created_at, user_id')
        .order('created_at', { ascending: false })
        .limit(5);

      // Get user data for invoices and estimates
      const allUserIds = [
        ...(recentInvoicesRaw?.map(inv => inv.user_id) || []),
        ...(recentEstimatesRaw?.map(est => est.user_id) || [])
      ];

      const { data: usersData } = await supabase
        .from('profiles')
        .select('id, first_name, last_name, email')
        .in('id', [...new Set(allUserIds)]); // Remove duplicates

      // Create user lookup map
      const userMap = {};
      usersData?.forEach(user => {
        userMap[user.id] = user;
      });

      // Combine invoice data with user data
      const recentInvoices = recentInvoicesRaw?.map(invoice => ({
        ...invoice,
        profiles: userMap[invoice.user_id]
      }));

      // Combine estimate data with user data
      const recentEstimates = recentEstimatesRaw?.map(estimate => ({
        ...estimate,
        profiles: userMap[estimate.user_id]
      }));

      // Combine and format activity
      const activities = [];

      recentUsers?.forEach(user => {
        activities.push({
          type: 'signup',
          user: `${user.first_name} ${user.last_name}`,
          email: user.email,
          time: user.created_at,
          details: 'New user registered'
        });
      });

      recentInvoices?.forEach(invoice => {
        activities.push({
          type: 'invoice_created',
          user: `${invoice.profiles?.first_name} ${invoice.profiles?.last_name}`,
          email: invoice.profiles?.email,
          time: invoice.created_at,
          details: `Created invoice ${invoice.invoice_number} - $${invoice.total}`
        });
      });

      recentEstimates?.forEach(estimate => {
        activities.push({
          type: 'estimate_created',
          user: `${estimate.profiles?.first_name} ${estimate.profiles?.last_name}`,
          email: estimate.profiles?.email,
          time: estimate.created_at,
          details: `Created estimate ${estimate.estimate_number} - $${estimate.total}`
        });
      });

      // Sort by time and limit
      activities.sort((a, b) => new Date(b.time) - new Date(a.time));
      
      return { data: activities.slice(0, limit), error: null };
    } catch (error) {
      console.error('Error fetching recent activity:', error);
      return { data: null, error };
    }
  }
};