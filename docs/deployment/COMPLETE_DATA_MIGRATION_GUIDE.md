# 🚀 Complete Database Migration Guide: Lovable Cloud → Original Supabase Database

## 📋 Migration Overview

**Source Database (Lovable Cloud)**: `LOVABLE_CLOUD`
**Target Database (Your Original)**: `<YOUR_ORIGINAL_PROJECT_ID>`

**Current Data to Migrate**:
- ✅ **12 registered users** with profiles
- ✅ **2 customers**
- ✅ **3 invoices** with invoice items
- ✅ All user settings, roles, and organizations
- ✅ All storage files (avatars)

**Estimated Time**: 5-7 hours
**Difficulty**: Intermediate
**Risk Level**: Medium (with proper backups: Low)

---

## ⚠️ CRITICAL: Before You Start

### Pre-Migration Checklist
- [ ] **BACKUP EVERYTHING** - Take a full backup of Lovable Cloud database
- [ ] Have your original Supabase project credentials ready
- [ ] Ensure you have admin access to both databases
- [ ] Set aside uninterrupted time to complete migration
- [ ] Have rollback plan ready (this guide includes one)
- [ ] Test database connection to original Supabase project

---

# 📦 Phase 1: Data Export from Lovable Cloud

## Step 1.1: Export User Authentication Data

### Option A: Export User List (for bulk import)

Run this SQL in Lovable Cloud SQL Editor or use the query tool:

```sql
-- Export user authentication data
SELECT 
  id,
  email,
  raw_user_meta_data,
  created_at,
  email_confirmed_at,
  phone,
  phone_confirmed_at
FROM auth.users
ORDER BY created_at;
```

**Save this as**: `users_export.csv`

### Option B: Simple User Email List (for re-registration)

```sql
-- Export just emails for user notification
SELECT 
  id,
  email,
  created_at
FROM auth.users
ORDER BY created_at;
```

**Save this as**: `users_email_list.csv`

---

## Step 1.2: Export All Application Data

### 🎯 AUTOMATED EXPORT SCRIPT

Run these SQL queries in order and save each result as a CSV file:

```sql
-- ============================================
-- 1. EXPORT PROFILES (12 records expected)
-- ============================================
SELECT * FROM profiles ORDER BY created_at;
-- Save as: profiles_export.csv

-- ============================================
-- 2. EXPORT USER ROLES
-- ============================================
SELECT * FROM user_roles ORDER BY created_at;
-- Save as: user_roles_export.csv

-- ============================================
-- 3. EXPORT ORGANIZATIONS
-- ============================================
SELECT * FROM organizations ORDER BY created_at;
-- Save as: organizations_export.csv

-- ============================================
-- 4. EXPORT ORG MEMBERS
-- ============================================
SELECT * FROM org_members ORDER BY joined_at;
-- Save as: org_members_export.csv

-- ============================================
-- 5. EXPORT CUSTOMERS (2 records expected)
-- ============================================
SELECT * FROM customers ORDER BY created_at;
-- Save as: customers_export.csv

-- ============================================
-- 6. EXPORT USER SETTINGS
-- ============================================
SELECT * FROM user_settings ORDER BY created_at;
-- Save as: user_settings_export.csv

-- ============================================
-- 7. EXPORT INVOICES (3 records expected)
-- ============================================
SELECT * FROM invoices ORDER BY created_at;
-- Save as: invoices_export.csv

-- ============================================
-- 8. EXPORT INVOICE ITEMS
-- ============================================
SELECT * FROM invoice_items ORDER BY invoice_id, sort_order;
-- Save as: invoice_items_export.csv

-- ============================================
-- 9. EXPORT ESTIMATES
-- ============================================
SELECT * FROM estimates ORDER BY created_at;
-- Save as: estimates_export.csv

-- ============================================
-- 10. EXPORT ESTIMATE ITEMS
-- ============================================
SELECT * FROM estimate_items ORDER BY estimate_id, sort_order;
-- Save as: estimate_items_export.csv

-- ============================================
-- 11. EXPORT RECEIPTS
-- ============================================
SELECT * FROM receipts ORDER BY created_at;
-- Save as: receipts_export.csv

-- ============================================
-- 12. EXPORT RECEIPT ITEMS
-- ============================================
SELECT * FROM receipt_items ORDER BY receipt_id, sort_order;
-- Save as: receipt_items_export.csv

-- ============================================
-- 13. EXPORT PAYMENTS
-- ============================================
SELECT * FROM payments ORDER BY created_at;
-- Save as: payments_export.csv

-- ============================================
-- 14. EXPORT BILLING SUBSCRIPTIONS
-- ============================================
SELECT * FROM billing_subscriptions ORDER BY created_at;
-- Save as: billing_subscriptions_export.csv

-- ============================================
-- 15. EXPORT BILLING EVENTS
-- ============================================
SELECT * FROM billing_events ORDER BY timestamp;
-- Save as: billing_events_export.csv

-- ============================================
-- 16. EXPORT PLANS
-- ============================================
SELECT * FROM plans ORDER BY display_order;
-- Save as: plans_export.csv

-- ============================================
-- 17. EXPORT NOTIFICATIONS
-- ============================================
SELECT * FROM notifications ORDER BY created_at;
-- Save as: notifications_export.csv

-- ============================================
-- 18. EXPORT ACTIVITY LOGS
-- ============================================
SELECT * FROM activity_logs ORDER BY created_at;
-- Save as: activity_logs_export.csv
```

### 📊 Verification Queries

Run these to verify your exports are complete:

```sql
-- Verify record counts
SELECT 'profiles' as table_name, COUNT(*) as record_count FROM profiles
UNION ALL
SELECT 'customers', COUNT(*) FROM customers
UNION ALL
SELECT 'invoices', COUNT(*) FROM invoices
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM invoice_items
UNION ALL
SELECT 'estimates', COUNT(*) FROM estimates
UNION ALL
SELECT 'receipts', COUNT(*) FROM receipts
UNION ALL
SELECT 'user_roles', COUNT(*) FROM user_roles
UNION ALL
SELECT 'organizations', COUNT(*) FROM organizations;
```

**Expected Results**:
- profiles: 12
- customers: 2
- invoices: 3
- invoice_items: (varies based on invoices)
- Other tables: varies

---

## Step 1.3: Export Storage Files

### Export Avatars from Storage

1. Go to Lovable Cloud Backend → Storage → `avatars` bucket
2. Download all files maintaining folder structure
3. Organize them by user_id folders
4. **Alternative**: Use Supabase CLI:

```bash
# Export storage bucket
supabase storage download --bucket avatars --recursive
```

**Save to**: `storage_backup/avatars/`

---

# 🔧 Phase 2: Prepare Your Original Database

## Step 2.1: Update Environment Variables

Update your `.env` file:

```env
# OLD VALUES (Lovable Cloud - COMMENT OUT)
# VITE_SUPABASE_URL=https://<YOUR_NEW_PROJECT_ID>.supabase.co
# VITE_SUPABASE_PUBLISHABLE_KEY=<YOUR_PUBLISHABLE_KEY>
# VITE_SUPABASE_PROJECT_ID=<YOUR_NEW_PROJECT_ID>

# NEW VALUES (Your Original Database)
VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[YOUR_ORIGINAL_ANON_KEY]
VITE_SUPABASE_PROJECT_ID=<YOUR_PROJECT_ID>

# Keep service role key from your original project
SUPABASE_SERVICE_ROLE_KEY=[YOUR_ORIGINAL_SERVICE_ROLE_KEY]
```

**⚠️ Important**: Get your original keys from your Supabase project dashboard:
- Go to: https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>/settings/api
- Copy "anon public" key for `VITE_SUPABASE_PUBLISHABLE_KEY`
- Copy "service_role" key for `SUPABASE_SERVICE_ROLE_KEY`

---

## Step 2.2: Update Supabase Config

Update `supabase/config.toml`:

```toml
project_id = "<YOUR_PROJECT_ID>"

[functions]
enabled = true

[functions.check-trial-expiry]
verify_jwt = false

[functions.send-trial-reminders]
verify_jwt = false

[functions.send-trial-email]
verify_jwt = false

[functions.create-checkout]
verify_jwt = true

[functions.check-subscription]
verify_jwt = true

[functions.customer-portal]
verify_jwt = true
```

---

## Step 2.3: Create Complete Database Schema

Run this SQL in your **ORIGINAL** Supabase database (<YOUR_PROJECT_ID>) SQL Editor.

### Part 1: Create Enums

```sql
-- ============================================
-- CREATE ENUMS
-- ============================================

-- App role enum for user roles
CREATE TYPE public.app_role AS ENUM ('super_admin', 'admin', 'user');
```

### Part 2: Create Core Tables

```sql
-- ============================================
-- CREATE PROFILES TABLE
-- ============================================
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE USER_ROLES TABLE
-- ============================================
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ORGANIZATIONS TABLE
-- ============================================
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ORG_MEMBERS TABLE
-- ============================================
CREATE TABLE public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, org_id)
);

ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE CUSTOMERS TABLE
-- ============================================
CREATE TABLE public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE USER_SETTINGS TABLE
-- ============================================
CREATE TABLE public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency TEXT DEFAULT 'USD',
  default_tax_rate NUMERIC DEFAULT 0,
  invoice_prefix TEXT DEFAULT 'INV-',
  estimate_prefix TEXT DEFAULT 'EST-',
  receipt_prefix TEXT DEFAULT 'REC-',
  default_template TEXT,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE INVOICES TABLE
-- ============================================
CREATE TABLE public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  template_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE INVOICE_ITEMS TABLE
-- ============================================
CREATE TABLE public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ESTIMATES TABLE
-- ============================================
CREATE TABLE public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  estimate_number TEXT NOT NULL,
  date DATE NOT NULL,
  expiry_date DATE,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  status TEXT DEFAULT 'draft',
  notes TEXT,
  template_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ESTIMATE_ITEMS TABLE
-- ============================================
CREATE TABLE public.estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RECEIPTS TABLE
-- ============================================
CREATE TABLE public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL,
  date DATE NOT NULL,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_method TEXT,
  notes TEXT,
  template_name TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE RECEIPT_ITEMS TABLE
-- ============================================
CREATE TABLE public.receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE PAYMENTS TABLE
-- ============================================
CREATE TABLE public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE BILLING_SUBSCRIPTIONS TABLE
-- ============================================
CREATE TABLE public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE BILLING_EVENTS TABLE
-- ============================================
CREATE TABLE public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE PLANS TABLE
-- ============================================
CREATE TABLE public.plans (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC,
  features JSONB NOT NULL DEFAULT '[]',
  max_customers INTEGER,
  max_invoices_per_month INTEGER,
  max_premium_deliveries INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE NOTIFICATIONS TABLE
-- ============================================
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- ============================================
-- CREATE ACTIVITY_LOGS TABLE
-- ============================================
CREATE TABLE public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
```

### Part 3: Create Database Functions

```sql
-- ============================================
-- CREATE DATABASE FUNCTIONS
-- ============================================

-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id uuid)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Function to check active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.billing_subscriptions bs
    JOIN public.organizations o ON bs.org_id = o.id
    WHERE o.owner_id = user_uuid
    AND (
      bs.status = 'active' 
      OR (bs.status = 'trialing' AND bs.trial_end > now())
    )
  );
$$;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Function to handle new user creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, first_name, last_name)
  VALUES (
    NEW.id,
    NEW.email,
    NEW.raw_user_meta_data->>'first_name',
    NEW.raw_user_meta_data->>'last_name'
  );
  RETURN NEW;
END;
$$;

-- Function to handle new user role assignment
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

-- Function to handle new user trial
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization
  INSERT INTO public.organizations (owner_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email))
  RETURNING id INTO new_org_id;
  
  -- Add user as org owner
  INSERT INTO public.org_members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'owner');
  
  -- Create trial subscription
  INSERT INTO public.billing_subscriptions (org_id, plan_id, status, trial_start, trial_end)
  VALUES (
    new_org_id, 
    'trial-30', 
    'trialing', 
    now(), 
    now() + INTERVAL '30 days'
  );
  
  -- Log trial start event
  INSERT INTO public.billing_events (event_type, org_id, metadata)
  VALUES ('trial_started', new_org_id, jsonb_build_object('user_id', NEW.id, 'email', NEW.email));
  
  RETURN NEW;
END;
$$;
```

### Part 4: Create Triggers

```sql
-- ============================================
-- CREATE TRIGGERS
-- ============================================

-- Trigger for new user creation (profile)
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Trigger for new user role assignment
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger for new user trial
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_trial();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_roles_updated_at
  BEFORE UPDATE ON public.user_roles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
```

### Part 5: Create RLS Policies

```sql
-- ============================================
-- CREATE RLS POLICIES - PROFILES
-- ============================================

CREATE POLICY "Users can view profiles based on role"
  ON public.profiles FOR SELECT
  USING (
    auth.uid() = id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update profiles based on role"
  ON public.profiles FOR UPDATE
  USING (
    auth.uid() = id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- CREATE RLS POLICIES - USER_ROLES
-- ============================================

CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- CREATE RLS POLICIES - ORGANIZATIONS
-- ============================================

CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM org_members 
      WHERE org_id = organizations.id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert their own organization"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

-- ============================================
-- CREATE RLS POLICIES - ORG_MEMBERS
-- ============================================

CREATE POLICY "Users can view members of their organization"
  ON public.org_members FOR SELECT
  USING (
    user_id = auth.uid() 
    OR EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = org_members.org_id 
      AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage org members"
  ON public.org_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = org_members.org_id 
      AND owner_id = auth.uid()
    )
  );

-- ============================================
-- CREATE RLS POLICIES - CUSTOMERS
-- ============================================

CREATE POLICY "Users can view customers based on role"
  ON public.customers FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update customers based on role"
  ON public.customers FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can delete customers based on role"
  ON public.customers FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - USER_SETTINGS
-- ============================================

CREATE POLICY "Users can view settings based on role"
  ON public.user_settings FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update settings based on role"
  ON public.user_settings FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admins can delete settings"
  ON public.user_settings FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- ============================================
-- CREATE RLS POLICIES - INVOICES
-- ============================================

CREATE POLICY "Users can view invoices based on role"
  ON public.invoices FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update invoices based on role"
  ON public.invoices FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can delete invoices based on role"
  ON public.invoices FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - INVOICE_ITEMS
-- ============================================

CREATE POLICY "Users can view their own invoice items"
  ON public.invoice_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own invoice items"
  ON public.invoice_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own invoice items"
  ON public.invoice_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own invoice items"
  ON public.invoice_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREATE RLS POLICIES - ESTIMATES
-- ============================================

CREATE POLICY "Users can view estimates based on role"
  ON public.estimates FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create their own estimates"
  ON public.estimates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update estimates based on role"
  ON public.estimates FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can delete estimates based on role"
  ON public.estimates FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - ESTIMATE_ITEMS
-- ============================================

CREATE POLICY "Users can view their own estimate items"
  ON public.estimate_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own estimate items"
  ON public.estimate_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own estimate items"
  ON public.estimate_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own estimate items"
  ON public.estimate_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREATE RLS POLICIES - RECEIPTS
-- ============================================

CREATE POLICY "Users can view receipts based on role"
  ON public.receipts FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update receipts based on role"
  ON public.receipts FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can delete receipts based on role"
  ON public.receipts FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - RECEIPT_ITEMS
-- ============================================

CREATE POLICY "Users can view their own receipt items"
  ON public.receipt_items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own receipt items"
  ON public.receipt_items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own receipt items"
  ON public.receipt_items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own receipt items"
  ON public.receipt_items FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================
-- CREATE RLS POLICIES - PAYMENTS
-- ============================================

CREATE POLICY "Users can view payments based on role"
  ON public.payments FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update payments based on role"
  ON public.payments FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can delete payments based on role"
  ON public.payments FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - BILLING_SUBSCRIPTIONS
-- ============================================

CREATE POLICY "Users can view their organization's subscription"
  ON public.billing_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = billing_subscriptions.org_id 
      AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM org_members 
      WHERE org_id = billing_subscriptions.org_id 
      AND user_id = auth.uid()
    )
  );

CREATE POLICY "System can create subscriptions"
  ON public.billing_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can update their organization's subscription"
  ON public.billing_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = billing_subscriptions.org_id 
      AND owner_id = auth.uid()
    )
  );

-- ============================================
-- CREATE RLS POLICIES - BILLING_EVENTS
-- ============================================

CREATE POLICY "Users can view their organization's billing events"
  ON public.billing_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM organizations 
      WHERE id = billing_events.org_id 
      AND owner_id = auth.uid()
    )
    OR EXISTS (
      SELECT 1 FROM org_members 
      WHERE org_id = billing_events.org_id 
      AND user_id = auth.uid()
    )
  );

-- ============================================
-- CREATE RLS POLICIES - PLANS
-- ============================================

CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (
    public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - NOTIFICATIONS
-- ============================================

CREATE POLICY "Users can view notifications based on role"
  ON public.notifications FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Users can update notifications based on role"
  ON public.notifications FOR UPDATE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

-- ============================================
-- CREATE RLS POLICIES - ACTIVITY_LOGS
-- ============================================

CREATE POLICY "Users can view activity logs based on role"
  ON public.activity_logs FOR SELECT
  USING (
    auth.uid() = user_id 
    OR public.has_role(auth.uid(), 'admin') 
    OR public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "System can create activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can update activity logs"
  ON public.activity_logs FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete activity logs"
  ON public.activity_logs FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));
```

---

## Step 2.4: Configure Storage Buckets

Run this SQL in your original database:

```sql
-- ============================================
-- CREATE STORAGE BUCKET FOR AVATARS
-- ============================================

-- Create the avatars bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Avatar images are publicly accessible"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'avatars');

CREATE POLICY "Users can upload their own avatar"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can update their own avatar"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Users can delete their own avatar"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'avatars' 
    AND auth.uid()::text = (storage.foldername(name))[1]
  );
```

---

## Step 2.5: Configure Authentication Settings

In your **original** Supabase dashboard (https://supabase.com/dashboard/project/<YOUR_PROJECT_ID>):

1. Go to **Authentication** → **Settings**
2. Configure:
   - **Site URL**: Set to your production URL or `http://localhost:5173` for development
   - **Redirect URLs**: Add your application URLs
   - **Email Auth**: Enable
   - **Auto Confirm**: Enable (for development/testing)
   - **Email Templates**: Customize if needed

---

# 📥 Phase 3: Data Import to Your Original Database

## Step 3.1: Import Users (Critical!)

### Option A: Bulk User Import (RECOMMENDED - Preserves User IDs)

1. **Export users from Lovable Cloud with passwords** (requires admin API access or Supabase CLI)
2. **Use Supabase Admin API to bulk import users**

```bash
# Using Supabase CLI
supabase db remote --project-ref <YOUR_PROJECT_ID> \
  --db-url "postgresql://postgres:[YOUR-PASSWORD]@db.<YOUR_PROJECT_ID>.supabase.co:5432/postgres" \
  seed users_export.sql
```

### Option B: Manual User Re-registration (SIMPLER but loses linkage)

If bulk import is not feasible:
1. Notify all 12 users they need to re-register
2. They create new accounts with same email
3. You manually reassign data to new user IDs (complex!)

**⚠️ IMPORTANT**: Option A is strongly recommended to preserve data integrity!

---

## Step 3.2: Import Application Data

**⚠️ CRITICAL**: Import in this EXACT order to maintain referential integrity!

### Step-by-Step Import Process

```sql
-- ============================================
-- DISABLE TRIGGERS TEMPORARILY (Optional but recommended)
-- ============================================
ALTER TABLE public.profiles DISABLE TRIGGER ALL;
ALTER TABLE public.user_roles DISABLE TRIGGER ALL;
ALTER TABLE public.organizations DISABLE TRIGGER ALL;
ALTER TABLE public.org_members DISABLE TRIGGER ALL;
ALTER TABLE public.customers DISABLE TRIGGER ALL;
ALTER TABLE public.user_settings DISABLE TRIGGER ALL;
ALTER TABLE public.invoices DISABLE TRIGGER ALL;
ALTER TABLE public.invoice_items DISABLE TRIGGER ALL;
ALTER TABLE public.estimates DISABLE TRIGGER ALL;
ALTER TABLE public.estimate_items DISABLE TRIGGER ALL;
ALTER TABLE public.receipts DISABLE TRIGGER ALL;
ALTER TABLE public.receipt_items DISABLE TRIGGER ALL;
ALTER TABLE public.payments DISABLE TRIGGER ALL;
ALTER TABLE public.billing_subscriptions DISABLE TRIGGER ALL;
ALTER TABLE public.billing_events DISABLE TRIGGER ALL;
ALTER TABLE public.plans DISABLE TRIGGER ALL;
ALTER TABLE public.notifications DISABLE TRIGGER ALL;
ALTER TABLE public.activity_logs DISABLE TRIGGER ALL;

-- ============================================
-- 1. IMPORT PROFILES (12 records)
-- ============================================
-- Use the Supabase dashboard Table Editor to import profiles_export.csv
-- OR use this SQL if you have the data:

COPY public.profiles FROM '/path/to/profiles_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify import
SELECT COUNT(*) as profile_count FROM public.profiles;
-- Expected: 12

-- ============================================
-- 2. IMPORT USER_ROLES
-- ============================================
COPY public.user_roles FROM '/path/to/user_roles_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.user_roles;

-- ============================================
-- 3. IMPORT ORGANIZATIONS
-- ============================================
COPY public.organizations FROM '/path/to/organizations_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.organizations;

-- ============================================
-- 4. IMPORT ORG_MEMBERS
-- ============================================
COPY public.org_members FROM '/path/to/org_members_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.org_members;

-- ============================================
-- 5. IMPORT CUSTOMERS (2 records)
-- ============================================
COPY public.customers FROM '/path/to/customers_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify import
SELECT COUNT(*) as customer_count FROM public.customers;
-- Expected: 2

-- ============================================
-- 6. IMPORT USER_SETTINGS
-- ============================================
COPY public.user_settings FROM '/path/to/user_settings_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.user_settings;

-- ============================================
-- 7. IMPORT INVOICES (3 records)
-- ============================================
COPY public.invoices FROM '/path/to/invoices_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify import
SELECT COUNT(*) as invoice_count FROM public.invoices;
-- Expected: 3

-- ============================================
-- 8. IMPORT INVOICE_ITEMS
-- ============================================
COPY public.invoice_items FROM '/path/to/invoice_items_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.invoice_items;

-- Verify linkage to invoices
SELECT i.invoice_number, COUNT(ii.id) as item_count
FROM public.invoices i
LEFT JOIN public.invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.invoice_number;

-- ============================================
-- 9. IMPORT ESTIMATES
-- ============================================
COPY public.estimates FROM '/path/to/estimates_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.estimates;

-- ============================================
-- 10. IMPORT ESTIMATE_ITEMS
-- ============================================
COPY public.estimate_items FROM '/path/to/estimate_items_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.estimate_items;

-- ============================================
-- 11. IMPORT RECEIPTS
-- ============================================
COPY public.receipts FROM '/path/to/receipts_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.receipts;

-- ============================================
-- 12. IMPORT RECEIPT_ITEMS
-- ============================================
COPY public.receipt_items FROM '/path/to/receipt_items_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.receipt_items;

-- ============================================
-- 13. IMPORT PAYMENTS
-- ============================================
COPY public.payments FROM '/path/to/payments_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.payments;

-- ============================================
-- 14. IMPORT BILLING_SUBSCRIPTIONS
-- ============================================
COPY public.billing_subscriptions FROM '/path/to/billing_subscriptions_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.billing_subscriptions;

-- ============================================
-- 15. IMPORT BILLING_EVENTS
-- ============================================
COPY public.billing_events FROM '/path/to/billing_events_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.billing_events;

-- ============================================
-- 16. IMPORT PLANS
-- ============================================
COPY public.plans FROM '/path/to/plans_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.plans;

-- ============================================
-- 17. IMPORT NOTIFICATIONS
-- ============================================
COPY public.notifications FROM '/path/to/notifications_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.notifications;

-- ============================================
-- 18. IMPORT ACTIVITY_LOGS
-- ============================================
COPY public.activity_logs FROM '/path/to/activity_logs_export.csv' 
WITH (FORMAT csv, HEADER true);

-- Verify
SELECT COUNT(*) FROM public.activity_logs;

-- ============================================
-- RE-ENABLE TRIGGERS
-- ============================================
ALTER TABLE public.profiles ENABLE TRIGGER ALL;
ALTER TABLE public.user_roles ENABLE TRIGGER ALL;
ALTER TABLE public.organizations ENABLE TRIGGER ALL;
ALTER TABLE public.org_members ENABLE TRIGGER ALL;
ALTER TABLE public.customers ENABLE TRIGGER ALL;
ALTER TABLE public.user_settings ENABLE TRIGGER ALL;
ALTER TABLE public.invoices ENABLE TRIGGER ALL;
ALTER TABLE public.invoice_items ENABLE TRIGGER ALL;
ALTER TABLE public.estimates ENABLE TRIGGER ALL;
ALTER TABLE public.estimate_items ENABLE TRIGGER ALL;
ALTER TABLE public.receipts ENABLE TRIGGER ALL;
ALTER TABLE public.receipt_items ENABLE TRIGGER ALL;
ALTER TABLE public.payments ENABLE TRIGGER ALL;
ALTER TABLE public.billing_subscriptions ENABLE TRIGGER ALL;
ALTER TABLE public.billing_events ENABLE TRIGGER ALL;
ALTER TABLE public.plans ENABLE TRIGGER ALL;
ALTER TABLE public.notifications ENABLE TRIGGER ALL;
ALTER TABLE public.activity_logs ENABLE TRIGGER ALL;
```

---

## Step 3.3: Import Storage Files (Avatars)

### Using Supabase Dashboard

1. Go to **Storage** → **avatars** bucket
2. Create folders matching user IDs
3. Upload avatar files to respective folders
4. Maintain folder structure: `{user_id}/avatar.jpg`

### Using Supabase CLI

```bash
# Upload all avatars maintaining structure
cd storage_backup/avatars
for dir in */; do
  supabase storage upload avatars "$dir" --project-ref <YOUR_PROJECT_ID>
done
```

---

# 🔌 Phase 4: Configure Integrations

## Step 4.1: Deploy Edge Functions

```bash
# Link to your original Supabase project
npx supabase link --project-ref <YOUR_PROJECT_ID>

# Deploy edge functions
npx supabase functions deploy create-checkout
npx supabase functions deploy check-subscription
npx supabase functions deploy customer-portal
```

---

## Step 4.2: Update Stripe Integration

### Re-add Stripe Secret to Original Database

In your original Supabase project:
1. Go to **Settings** → **Vault** (or use Supabase secrets)
2. Add secret: `STRIPE_SECRET_KEY` with your Stripe secret key value

### Update Stripe Webhook (if using webhooks)

1. Go to Stripe Dashboard → **Developers** → **Webhooks**
2. Update webhook endpoint URL to:
   ```
   https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/stripe-webhook
   ```
3. Update webhook signing secret in your database

---

# ✅ Phase 5: Testing & Verification

## Step 5.1: Comprehensive Data Verification

Run these verification queries in your **ORIGINAL** database:

```sql
-- ============================================
-- COMPREHENSIVE DATA VERIFICATION
-- ============================================

-- Check all table counts
SELECT 
  'profiles' as table_name, COUNT(*) as count FROM public.profiles
UNION ALL
SELECT 'user_roles', COUNT(*) FROM public.user_roles
UNION ALL
SELECT 'organizations', COUNT(*) FROM public.organizations
UNION ALL
SELECT 'org_members', COUNT(*) FROM public.org_members
UNION ALL
SELECT 'customers', COUNT(*) FROM public.customers
UNION ALL
SELECT 'user_settings', COUNT(*) FROM public.user_settings
UNION ALL
SELECT 'invoices', COUNT(*) FROM public.invoices
UNION ALL
SELECT 'invoice_items', COUNT(*) FROM public.invoice_items
UNION ALL
SELECT 'estimates', COUNT(*) FROM public.estimates
UNION ALL
SELECT 'estimate_items', COUNT(*) FROM public.estimate_items
UNION ALL
SELECT 'receipts', COUNT(*) FROM public.receipts
UNION ALL
SELECT 'receipt_items', COUNT(*) FROM public.receipt_items
UNION ALL
SELECT 'payments', COUNT(*) FROM public.payments
UNION ALL
SELECT 'billing_subscriptions', COUNT(*) FROM public.billing_subscriptions
UNION ALL
SELECT 'billing_events', COUNT(*) FROM public.billing_events
UNION ALL
SELECT 'plans', COUNT(*) FROM public.plans
UNION ALL
SELECT 'notifications', COUNT(*) FROM public.notifications
UNION ALL
SELECT 'activity_logs', COUNT(*) FROM public.activity_logs;

-- ============================================
-- EXPECTED COUNTS
-- ============================================
-- profiles: 12
-- customers: 2
-- invoices: 3
-- Others: varies

-- ============================================
-- VERIFY USER PROFILES MATCH AUTH USERS
-- ============================================
SELECT 
  COUNT(CASE WHEN p.id IS NOT NULL THEN 1 END) as profiles_with_auth,
  COUNT(CASE WHEN p.id IS NULL THEN 1 END) as auth_without_profile
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id;
-- Expected: All auth users should have profiles

-- ============================================
-- VERIFY INVOICE-CUSTOMER RELATIONSHIPS
-- ============================================
SELECT 
  i.invoice_number,
  c.name as customer_name,
  i.total,
  i.status
FROM public.invoices i
LEFT JOIN public.customers c ON i.customer_id = c.id
ORDER BY i.created_at DESC;
-- Expected: 3 invoices with proper customer linkage

-- ============================================
-- VERIFY INVOICE ITEMS LINKAGE
-- ============================================
SELECT 
  i.invoice_number,
  COUNT(ii.id) as item_count,
  SUM(ii.total) as items_total,
  i.total as invoice_total
FROM public.invoices i
LEFT JOIN public.invoice_items ii ON i.id = ii.invoice_id
GROUP BY i.id, i.invoice_number, i.total;
-- Expected: All invoices should have items, totals should match

-- ============================================
-- VERIFY USER ROLES
-- ============================================
SELECT 
  p.email,
  ur.role
FROM public.profiles p
LEFT JOIN public.user_roles ur ON p.id = ur.user_id
ORDER BY p.email;
-- Expected: All users should have at least 'user' role

-- ============================================
-- VERIFY ORGANIZATIONS
-- ============================================
SELECT 
  o.name,
  p.email as owner_email,
  COUNT(om.id) as member_count
FROM public.organizations o
JOIN public.profiles p ON o.owner_id = p.id
LEFT JOIN public.org_members om ON o.id = om.org_id
GROUP BY o.id, o.name, p.email;
-- Expected: All organizations should have owners

-- ============================================
-- VERIFY STORAGE BUCKET
-- ============================================
SELECT * FROM storage.buckets WHERE name = 'avatars';
-- Expected: avatars bucket exists and is public

-- ============================================
-- VERIFY DATABASE FUNCTIONS
-- ============================================
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_type = 'FUNCTION'
ORDER BY routine_name;
-- Expected: has_role, get_user_role, has_active_subscription, etc.

-- ============================================
-- VERIFY TRIGGERS
-- ============================================
SELECT 
  trigger_name,
  event_object_table,
  action_statement
FROM information_schema.triggers
WHERE trigger_schema = 'public'
ORDER BY event_object_table, trigger_name;
-- Expected: Multiple triggers on various tables

-- ============================================
-- VERIFY RLS IS ENABLED
-- ============================================
SELECT 
  schemaname,
  tablename,
  rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;
-- Expected: rowsecurity = true for all public tables
```

---

## Step 5.2: Functional Testing Checklist

### Test User Authentication
- [ ] Can users log in with existing credentials?
- [ ] Does login redirect to dashboard?
- [ ] Are user profiles loading correctly?
- [ ] Can users update their profile?
- [ ] Does avatar display work?

### Test Customer Management
- [ ] Can view list of customers (2 expected)?
- [ ] Can create new customer?
- [ ] Can edit existing customer?
- [ ] Can delete customer?
- [ ] Customer search works?

### Test Invoice Management
- [ ] Can view list of invoices (3 expected)?
- [ ] Invoice details load correctly?
- [ ] Invoice items display properly?
- [ ] Can create new invoice?
- [ ] Can edit existing invoice?
- [ ] Can generate PDF from invoice?
- [ ] Invoice status updates work?

### Test Estimates & Receipts
- [ ] Estimates load and function?
- [ ] Receipts load and function?
- [ ] Can convert estimate to invoice?

### Test Storage
- [ ] Avatar upload works?
- [ ] Existing avatars display?
- [ ] Avatar update works?
- [ ] Avatar delete works?

### Test Admin Features (if applicable)
- [ ] Admin users can access admin panel?
- [ ] Can view all users?
- [ ] Can manage user roles?
- [ ] Activity logs display?

### Test Stripe Integration (if configured)
- [ ] Checkout flow works?
- [ ] Subscription check works?
- [ ] Customer portal accessible?

---

## Step 5.3: Security Testing

```sql
-- ============================================
-- TEST RLS POLICIES
-- ============================================

-- Test as regular user (should only see own data)
-- Login as a test user, then run:
SELECT COUNT(*) FROM public.customers;
-- Should only see user's own customers

SELECT COUNT(*) FROM public.invoices;
-- Should only see user's own invoices

-- Test as admin (should see all data)
-- Login as admin user, then run:
SELECT COUNT(*) FROM public.customers;
-- Should see all customers

-- Test unauthorized access (should fail)
-- Try to update another user's customer
UPDATE public.customers 
SET name = 'Hacked' 
WHERE user_id != auth.uid();
-- Should return 0 rows updated due to RLS
```

---

# 🚀 Phase 6: Cutover & Final Steps

## Step 6.1: Final Data Sync

1. **Freeze Lovable Cloud** - Stop using the old database
2. **Export any new data** created during testing
3. **Import final data** to original database
4. **Run verification queries** one more time

---

## Step 6.2: Deploy Application

1. **Update all environment variables** in production
2. **Deploy updated code** to your hosting platform
3. **Test production deployment**
4. **Monitor for errors**

---

## Step 6.3: Notification & Communication

### Notify Your Users

**Email Template**:

```
Subject: Important: SwiftFacture Database Migration Complete

Dear [User Name],

We've successfully completed a database migration to improve performance and reliability.

What you need to know:
✅ All your data has been safely migrated
✅ Your 12 user accounts are preserved
✅ All 2 customers are intact
✅ All 3 invoices and documents are safe
✅ No action required on your part

You can continue using SwiftFacture as normal. If you experience any issues, please contact support.

Thank you for your patience!
- SwiftFacture Team
```

---

## Step 6.4: Post-Migration Monitoring

### Monitor for 7 Days

1. **Check error logs daily**
2. **Monitor user activity**
3. **Watch for support tickets**
4. **Verify data integrity weekly**

### Quick Health Check Query

```sql
-- Run this daily for the first week
SELECT 
  (SELECT COUNT(*) FROM public.profiles) as users,
  (SELECT COUNT(*) FROM public.customers) as customers,
  (SELECT COUNT(*) FROM public.invoices) as invoices,
  (SELECT COUNT(*) FROM public.estimates) as estimates,
  (SELECT COUNT(*) FROM public.receipts) as receipts,
  now() as checked_at;
```

---

# 🔄 Rollback Plan

## If Something Goes Wrong

### Emergency Rollback Steps

1. **Don't Panic** - Your Lovable Cloud data is still intact!

2. **Revert Environment Variables**
   ```env
   # Revert to Lovable Cloud
   VITE_SUPABASE_URL=https://kvvqkzwrkselznrnqcbi.supabase.co
   VITE_SUPABASE_PUBLISHABLE_KEY=[LOVABLE_CLOUD_KEY]
   VITE_SUPABASE_PROJECT_ID=kvvqkzwrkselznrnqcbi
   ```

3. **Revert Config File**
   ```toml
   # supabase/config.toml
   project_id = "kvvqkzwrkselznrnqcbi"
   ```

4. **Redeploy Application**

5. **Debug the Issue**
   - Check what went wrong
   - Review error logs
   - Consult this guide again

6. **Try Migration Again**
   - Fix the issue
   - Start from the failed step
   - Follow the guide carefully

---

# 📊 Success Metrics

## Migration is Successful When:

- ✅ All 12 users can log in
- ✅ All 2 customers are visible
- ✅ All 3 invoices display correctly
- ✅ Invoice items load properly
- ✅ PDF generation works
- ✅ Avatar uploads/downloads work
- ✅ No RLS policy errors in logs
- ✅ Edge functions respond correctly
- ✅ Stripe integration works (if configured)
- ✅ No data loss reported
- ✅ Application performance is good

---

# 🎯 Key Advantages You'll Gain

## With Your Original Database

✅ **Full Control** - Direct access to Supabase dashboard
✅ **SQL Editor** - Run custom queries anytime
✅ **Better Debugging** - View logs, monitor performance in real-time
✅ **Custom Configuration** - Full control over all settings
✅ **Data Ownership** - Your project, your data, your rules
✅ **Integration Flexibility** - Connect to any service easily
✅ **No Restrictions** - Use all Supabase features without limitations
✅ **Better Support** - Direct access to Supabase support
✅ **Scalability** - Easier to scale as your app grows
✅ **Peace of Mind** - You own and control everything

---

# ⏱️ Estimated Timeline

| Phase | Task | Time Estimate |
|-------|------|---------------|
| 1 | Data Export | 30 minutes |
| 2 | Database Schema Setup | 1-2 hours |
| 3 | Data Import | 1-2 hours |
| 4 | Configuration | 30 minutes |
| 5 | Testing | 2-3 hours |
| 6 | Deployment | 1 hour |
| **Total** | **Full Migration** | **6-9 hours** |

---

# 📞 Support & Help

## If You Need Help

1. **Review Troubleshooting Section** below
2. **Check Supabase Logs** in dashboard
3. **Review Error Messages** carefully
4. **Consult Supabase Documentation**
5. **Ask for Help** in:
   - Supabase Discord
   - Stack Overflow
   - Your development team

---

# 🔧 Troubleshooting Common Issues

## Issue 1: "violates row-level security policy"

**Cause**: RLS policy is blocking the operation

**Solutions**:
- Verify user is authenticated
- Check if user_id column is being set correctly
- Verify RLS policies are created
- Check if has_role function exists

```sql
-- Check if policies exist
SELECT * FROM pg_policies WHERE schemaname = 'public';

-- Check if has_role function exists
SELECT * FROM pg_proc WHERE proname = 'has_role';
```

---

## Issue 2: "relation does not exist"

**Cause**: Table wasn't created

**Solution**:
- Re-run table creation SQL
- Check for typos in table names
- Verify you're connected to correct database

```sql
-- Check if all tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
ORDER BY table_name;
```

---

## Issue 3: Data Import Fails

**Cause**: Foreign key violations or data format issues

**Solutions**:
- Import tables in correct order (parents before children)
- Disable triggers temporarily during import
- Verify CSV format matches table columns
- Check for NULL values in NOT NULL columns

```sql
-- Disable foreign key checks temporarily
SET session_replication_role = 'replica';
-- Import data
-- Then re-enable
SET session_replication_role = 'origin';
```

---

## Issue 4: Users Can't See Their Data

**Cause**: User IDs don't match

**Solutions**:
- Verify user IDs match between auth.users and imported data
- Use bulk user import to preserve UUIDs
- Check if user_id column is set correctly in all tables

```sql
-- Verify user ID matches
SELECT 
  u.id as auth_id,
  p.id as profile_id,
  u.email
FROM auth.users u
LEFT JOIN public.profiles p ON u.id = p.id
WHERE p.id IS NULL;
-- Should return no rows
```

---

## Issue 5: Edge Functions Fail

**Cause**: Not deployed or misconfigured

**Solutions**:
- Redeploy edge functions
- Check environment variables
- Verify JWT settings in config.toml
- Check function logs

```bash
# Check function logs
npx supabase functions serve --inspect
```

---

## Issue 6: Avatars Don't Display

**Cause**: Storage bucket not configured

**Solutions**:
- Verify avatars bucket exists and is public
- Check storage policies
- Verify file paths match user IDs
- Check CORS settings

```sql
-- Verify bucket exists
SELECT * FROM storage.buckets WHERE name = 'avatars';

-- Check bucket is public
SELECT * FROM storage.buckets WHERE name = 'avatars' AND public = true;
```

---

## Issue 7: Stripe Integration Broken

**Cause**: Secrets not migrated

**Solutions**:
- Re-add STRIPE_SECRET_KEY to new database
- Update webhook endpoints in Stripe dashboard
- Redeploy edge functions
- Test with Stripe test mode first

---

## Issue 8: Performance Issues

**Cause**: Missing indexes or inefficient queries

**Solutions**:
- Add indexes on frequently queried columns
- Optimize RLS policies
- Use connection pooling
- Monitor query performance

```sql
-- Add useful indexes
CREATE INDEX idx_invoices_user_id ON public.invoices(user_id);
CREATE INDEX idx_customers_user_id ON public.customers(user_id);
CREATE INDEX idx_invoice_items_invoice_id ON public.invoice_items(invoice_id);
```

---

# ✅ Final Checklist

## Before You Start
- [ ] Backed up all Lovable Cloud data
- [ ] Have original Supabase credentials ready
- [ ] Reviewed entire migration guide
- [ ] Set aside uninterrupted time
- [ ] Tested database connection

## Database Setup
- [ ] Updated .env file
- [ ] Updated supabase/config.toml
- [ ] Created all enums
- [ ] Created all tables
- [ ] Created all functions
- [ ] Created all triggers
- [ ] Enabled RLS on all tables
- [ ] Created all RLS policies
- [ ] Created storage bucket
- [ ] Configured authentication

## Data Migration
- [ ] Exported all user data
- [ ] Exported all application data
- [ ] Imported users (preserving IDs)
- [ ] Imported profiles
- [ ] Imported organizations
- [ ] Imported customers
- [ ] Imported invoices
- [ ] Imported invoice items
- [ ] Imported all other tables
- [ ] Imported storage files

## Integration Setup
- [ ] Deployed edge functions
- [ ] Configured Stripe integration
- [ ] Updated webhook endpoints
- [ ] Tested edge functions

## Testing
- [ ] Verified data counts
- [ ] Tested user authentication
- [ ] Tested customer operations
- [ ] Tested invoice operations
- [ ] Tested storage operations
- [ ] Tested RLS policies
- [ ] Tested admin features
- [ ] Tested Stripe integration

## Deployment
- [ ] Deployed application with new env vars
- [ ] Tested production deployment
- [ ] Notified users of migration
- [ ] Set up monitoring
- [ ] Documented changes

## Post-Migration
- [ ] Monitoring for issues daily
- [ ] Running health checks
- [ ] Responding to user feedback
- [ ] Keeping Lovable Cloud backup for 30 days

---

# 🎉 Congratulations!

If you've completed all steps in this guide, you have successfully migrated your **entire SwiftFacture application** from Lovable Cloud to your original Supabase database with:

✅ **12 users** with full profiles
✅ **2 customers** with complete data
✅ **3 invoices** with all items
✅ **All user settings** preserved
✅ **All storage files** migrated
✅ **Full control** over your database
✅ **Better performance** and flexibility

Your application is now running on your own infrastructure with complete control and full access to all Supabase features!

---

**Document Version**: 1.0  
**Last Updated**: 2025  
**Status**: Production-Ready Migration Guide

**Questions?** Review the troubleshooting section or consult Supabase documentation.

**Good luck with your migration! 🚀**
