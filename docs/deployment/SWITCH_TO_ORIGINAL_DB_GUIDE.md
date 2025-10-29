# Switch Back to Original Supabase Database

## Complete Migration Guide

This guide will help you switch from the Lovable Cloud database back to your original Supabase database (`<YOUR_PROJECT_ID>`).

---

## ⚠️ IMPORTANT: Backup First!

Before proceeding, backup any data from the Lovable Cloud database that you want to keep:

1. Go to Lovable Cloud backend (in Lovable interface)
2. Export data from all tables you've been using
3. Save the exported data files locally

---

## Step 1: Update Environment Variables

Update your `.env` file to point to your original database:

```env
VITE_SUPABASE_URL=https://<YOUR_PROJECT_ID>.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=[Your original anon/public key]
VITE_SUPABASE_PROJECT_ID=<YOUR_PROJECT_ID>
```

**Note:** You'll need your original anon/public key from your Supabase dashboard.

---

## Step 2: Update Supabase Config

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

## Step 3: Create Missing Database Schema

Run the following SQL scripts in your original Supabase database SQL Editor in **THIS EXACT ORDER**:

### 3.1 Create Enums

```sql
-- Create app_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;
```

### 3.2 Create Core Tables

```sql
-- Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User roles table
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL DEFAULT 'user'::app_role,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, role)
);

-- Organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Org members table
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member',
  joined_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, org_id)
);

-- Customers table
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User settings table
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  default_currency TEXT DEFAULT 'USD',
  default_tax_rate NUMERIC DEFAULT 0,
  invoice_prefix TEXT DEFAULT 'INV-',
  estimate_prefix TEXT DEFAULT 'EST-',
  receipt_prefix TEXT DEFAULT 'REC-',
  default_template TEXT,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Invoices table
CREATE TABLE IF NOT EXISTS public.invoices (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, invoice_number)
);

-- Invoice items table
CREATE TABLE IF NOT EXISTS public.invoice_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_id UUID NOT NULL REFERENCES public.invoices(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Estimates table
CREATE TABLE IF NOT EXISTS public.estimates (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, estimate_number)
);

-- Estimate items table
CREATE TABLE IF NOT EXISTS public.estimate_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Receipts table
CREATE TABLE IF NOT EXISTS public.receipts (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, receipt_number)
);

-- Receipt items table
CREATE TABLE IF NOT EXISTS public.receipt_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  receipt_id UUID NOT NULL REFERENCES public.receipts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  description TEXT NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 1,
  unit_price NUMERIC NOT NULL DEFAULT 0,
  tax_rate NUMERIC DEFAULT 0,
  total NUMERIC NOT NULL DEFAULT 0,
  sort_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Payments table
CREATE TABLE IF NOT EXISTS public.payments (
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
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing subscriptions table
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing',
  trial_start TIMESTAMPTZ,
  trial_end TIMESTAMPTZ,
  subscription_start TIMESTAMPTZ,
  subscription_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Billing events table
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  metadata JSONB,
  timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Plans table
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_customers INTEGER,
  max_invoices_per_month INTEGER,
  max_premium_deliveries INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT DEFAULT 'info',
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Activity logs table
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 3.3 Create Database Functions

```sql
-- Function to check if user has a specific role
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
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
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE SQL
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

-- Function to check if user has active subscription
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE SQL
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

-- Function to handle new user profile creation
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

-- Function to handle new user trial creation
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

### 3.4 Create Triggers

```sql
-- Trigger for new user profile creation
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Trigger for new user role assignment
DROP TRIGGER IF EXISTS on_auth_user_created_role ON auth.users;
CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- Trigger for new user trial
DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_trial();

-- Triggers for updated_at columns
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_organizations_updated_at
  BEFORE UPDATE ON public.organizations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_customers_updated_at
  BEFORE UPDATE ON public.customers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at
  BEFORE UPDATE ON public.invoices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at
  BEFORE UPDATE ON public.estimates
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_receipts_updated_at
  BEFORE UPDATE ON public.receipts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_settings_updated_at
  BEFORE UPDATE ON public.user_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
```

### 3.5 Enable Row Level Security

```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
```

### 3.6 Create RLS Policies

```sql
-- Profiles policies
CREATE POLICY "Users can view profiles based on role"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can insert their own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can update profiles based on role"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete profiles"
  ON public.profiles FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- User roles policies
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (has_role(auth.uid(), 'super_admin'));

-- Organizations policies
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (owner_id = auth.uid() OR EXISTS (
    SELECT 1 FROM org_members WHERE org_id = organizations.id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can insert their own organization"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

-- Org members policies
CREATE POLICY "Users can view members of their organization"
  ON public.org_members FOR SELECT
  USING (user_id = auth.uid() OR EXISTS (
    SELECT 1 FROM organizations WHERE id = org_members.org_id AND owner_id = auth.uid()
  ));

CREATE POLICY "Owners can manage org members"
  ON public.org_members FOR ALL
  USING (EXISTS (
    SELECT 1 FROM organizations WHERE id = org_members.org_id AND owner_id = auth.uid()
  ));

-- Customers policies
CREATE POLICY "Users can view customers based on role"
  ON public.customers FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own customers"
  ON public.customers FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update customers based on role"
  ON public.customers FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can delete customers based on role"
  ON public.customers FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- User settings policies
CREATE POLICY "Users can view settings based on role"
  ON public.user_settings FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own settings"
  ON public.user_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update settings based on role"
  ON public.user_settings FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete settings"
  ON public.user_settings FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));

-- Invoices policies
CREATE POLICY "Users can view invoices based on role"
  ON public.invoices FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own invoices"
  ON public.invoices FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update invoices based on role"
  ON public.invoices FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can delete invoices based on role"
  ON public.invoices FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Invoice items policies
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

-- Estimates policies
CREATE POLICY "Users can view estimates based on role"
  ON public.estimates FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own estimates"
  ON public.estimates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update estimates based on role"
  ON public.estimates FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can delete estimates based on role"
  ON public.estimates FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Estimate items policies
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

-- Receipts policies
CREATE POLICY "Users can view receipts based on role"
  ON public.receipts FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own receipts"
  ON public.receipts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update receipts based on role"
  ON public.receipts FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can delete receipts based on role"
  ON public.receipts FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Receipt items policies
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

-- Payments policies
CREATE POLICY "Users can view payments based on role"
  ON public.payments FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can create their own payments"
  ON public.payments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update payments based on role"
  ON public.payments FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can delete payments based on role"
  ON public.payments FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'super_admin'));

-- Billing subscriptions policies
CREATE POLICY "Users can view their organization's subscription"
  ON public.billing_subscriptions FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organizations WHERE id = billing_subscriptions.org_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM org_members WHERE org_id = billing_subscriptions.org_id AND user_id = auth.uid()
  ));

CREATE POLICY "System can create subscriptions"
  ON public.billing_subscriptions FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Owners can update their organization's subscription"
  ON public.billing_subscriptions FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM organizations WHERE id = billing_subscriptions.org_id AND owner_id = auth.uid()
  ));

-- Billing events policies
CREATE POLICY "Users can view their organization's billing events"
  ON public.billing_events FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM organizations WHERE id = billing_events.org_id AND owner_id = auth.uid()
  ) OR EXISTS (
    SELECT 1 FROM org_members WHERE org_id = billing_events.org_id AND user_id = auth.uid()
  ));

-- Plans policies
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Notifications policies
CREATE POLICY "Users can view notifications based on role"
  ON public.notifications FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can create notifications"
  ON public.notifications FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Users can update notifications based on role"
  ON public.notifications FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Admins can delete notifications"
  ON public.notifications FOR DELETE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

-- Activity logs policies
CREATE POLICY "Users can view activity logs based on role"
  ON public.activity_logs FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin') OR has_role(auth.uid(), 'super_admin'));

CREATE POLICY "System can create activity logs"
  ON public.activity_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Super admins can update activity logs"
  ON public.activity_logs FOR UPDATE
  USING (has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete activity logs"
  ON public.activity_logs FOR DELETE
  USING (has_role(auth.uid(), 'super_admin'));
```

---

## Step 4: Configure Storage Buckets

In your original Supabase dashboard:

1. Go to Storage
2. Create a bucket named `avatars`
3. Make it **Public**
4. Add these RLS policies in Storage settings:

```sql
-- Allow authenticated users to upload their own avatars
CREATE POLICY "Users can upload their own avatar"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to update their own avatars
CREATE POLICY "Users can update their own avatar"
ON storage.objects FOR UPDATE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow authenticated users to delete their own avatars
CREATE POLICY "Users can delete their own avatar"
ON storage.objects FOR DELETE
USING (
  bucket_id = 'avatars' 
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Allow public access to view avatars
CREATE POLICY "Public access to avatars"
ON storage.objects FOR SELECT
USING (bucket_id = 'avatars');
```

---

## Step 5: Configure Authentication

In your Supabase dashboard → Authentication → Settings:

1. **Site URL**: Set to your production URL or `http://localhost:5173` for development
2. **Redirect URLs**: Add your allowed redirect URLs
3. **Email Auth**: Enable email/password authentication
4. **Auto Confirm**: Enable auto-confirm for development (disable in production)

---

## Step 6: Deploy Edge Functions

After updating your environment variables, deploy your edge functions to your original database:

```bash
npx supabase link --project-ref <YOUR_PROJECT_ID>
npx supabase functions deploy create-checkout
npx supabase functions deploy check-subscription
npx supabase functions deploy customer-portal
```

---

## Step 7: Update Stripe Webhook (if using webhooks)

If you're using Stripe webhooks, update the webhook endpoint in Stripe Dashboard to point to your original Supabase project:

```
https://<YOUR_PROJECT_ID>.supabase.co/functions/v1/stripe-webhook
```

---

## Step 8: Import Data (Optional)

If you exported data from Lovable Cloud in Step 1, now import it:

1. Go to your original Supabase dashboard
2. Navigate to Table Editor
3. Import the CSV files you exported
4. Verify data integrity

---

## Step 9: Test Everything

### Checklist:

- [ ] User registration works
- [ ] User login works
- [ ] Profile data saves correctly
- [ ] Customers can be created
- [ ] Invoices can be created
- [ ] Estimates can be created
- [ ] Receipts can be created
- [ ] Avatar upload works
- [ ] Stripe checkout works (if configured)
- [ ] Admin features work (if you have admin users)

### Quick Test Queries:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public'
ORDER BY routine_name;

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public';

-- Check storage buckets
SELECT * FROM storage.buckets;
```

---

## Troubleshooting

### Issue: "new row violates row-level security policy"

**Solution**: Make sure you're logged in and the RLS policies are created correctly.

### Issue: Edge functions not working

**Solution**: 
1. Verify functions are deployed: `npx supabase functions list`
2. Check function logs in Supabase dashboard
3. Verify JWT verification settings in `supabase/config.toml`

### Issue: Avatar upload fails

**Solution**: 
1. Verify the `avatars` bucket exists and is public
2. Check storage RLS policies
3. Verify user is authenticated

### Issue: Stripe integration not working

**Solution**:
1. Re-add your Stripe secret key to your original database's secrets
2. Verify webhook endpoint is updated (if using webhooks)
3. Redeploy edge functions

---

## Final Notes

- **Keep a backup** of your Lovable Cloud data until you've verified everything works in your original database
- **Test thoroughly** before switching in production
- Your original database gives you full control via Supabase dashboard
- You can view/edit tables, run SQL queries, and manage everything directly

---

## Need Help?

If you encounter issues:
1. Check Supabase logs in your dashboard
2. Verify all environment variables are correct
3. Ensure all SQL scripts ran without errors
4. Check that storage buckets and RLS policies are configured

