# 🔄 Complete Guide: Switch Back to Your Old Database & Data Recovery

## 🎯 Objective
Switch from Lovable's cloud database (`LOVABLE_PROJECT_ID`) back to your original database (`YOUR_ORIGINAL_PROJECT_ID`) and ensure all your data (users, documents, settings) is preserved and accessible.

---

## ⚠️ CRITICAL: Pre-Switch Backup

### **Step 1: Backup Current Lovable Database (Safety Net)**
Before switching, backup any new data created on the Lovable database:

```bash
# Connect to Lovable database and export data
npx supabase db dump --project-ref LOVABLE_PROJECT_ID --data-only > lovable_backup_$(date +%Y%m%d_%H%M%S).sql
```

### **Step 2: Verify Your Old Database Access**
1. **Login to Supabase Dashboard**: https://supabase.com/dashboard
2. **Verify Project Access**: Ensure you can access project `YOUR_ORIGINAL_PROJECT_ID`
3. **Check Database Status**: Confirm the project is active and not paused

---

## 🔧 Environment Configuration Switch

### **Step 3: Update .env File**
Replace your current .env content with your old database credentials:

```properties
# SwiftFacture - Original Database Configuration
VITE_SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
VITE_SUPABASE_PROJECT_ID=YOUR_PROJECT_ID
VITE_SUPABASE_PUBLISHABLE_KEY=YOUR_ANON_KEY

# Service Role Key for Edge Functions
SUPABASE_SERVICE_ROLE_KEY=YOUR_SERVICE_ROLE_KEY

# Stripe Configuration
STRIPE_WEBHOOK_SECRET=YOUR_STRIPE_WEBHOOK_SECRET
STRIPE_SECRET_KEY=YOUR_STRIPE_SECRET_KEY

# Development Settings
NODE_ENV=development

# Backup Reference (Alternative DB - Commented Out)
# VITE_SUPABASE_URL=https://ALTERNATIVE_PROJECT_ID.supabase.co
# VITE_SUPABASE_PROJECT_ID=ALTERNATIVE_PROJECT_ID
# VITE_SUPABASE_PUBLISHABLE_KEY=ALTERNATIVE_ANON_KEY
```

### **Step 4: Update Supabase CLI Configuration**
```bash
# Link to your original database
npx supabase link --project-ref rlbhtujnuopelxxgssni

# Update config.toml
echo 'project_id = "rlbhtujnuopelxxgssni"' > supabase/config.toml
```

---

## 🗄️ Database Schema Verification & Missing Tables

### **Step 5: Check Current Schema State**
Connect to your old database and verify existing tables:

```sql
-- Run in Supabase SQL Editor for project rlbhtujnuopelxxgssni
SELECT schemaname, tablename, tableowner 
FROM pg_tables 
WHERE schemaname = 'public' 
ORDER BY tablename;
```

### **Step 6: Create Missing Tables (If Any)**
Based on our 21-table architecture, ensure these tables exist. Run each missing table creation:

#### **Core Profile Tables**
```sql
-- Create profiles table if missing
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  first_name TEXT,
  last_name TEXT,
  company_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### **Document Management Tables**
```sql
-- Create customers table if missing
CREATE TABLE IF NOT EXISTS public.customers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  address TEXT,
  city TEXT,
  postal_code TEXT,
  country TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoices table if missing
CREATE TABLE IF NOT EXISTS public.invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_number TEXT NOT NULL,
  date DATE NOT NULL,
  due_date DATE,
  status TEXT DEFAULT 'draft',
  subtotal DECIMAL(10,2) DEFAULT 0,
  tax DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  notes TEXT,
  template_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create invoice_items table if missing
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create estimates table if missing
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  estimate_number TEXT NOT NULL,
  date DATE NOT NULL,
  expiry_date DATE,
  template_name TEXT,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create estimate_items table if missing
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create receipts table if missing
CREATE TABLE IF NOT EXISTS public.receipts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  receipt_number TEXT NOT NULL,
  date DATE NOT NULL,
  template_name TEXT,
  subtotal NUMERIC DEFAULT 0,
  tax NUMERIC DEFAULT 0,
  total NUMERIC DEFAULT 0,
  payment_method TEXT,
  notes TEXT,
  status TEXT DEFAULT 'draft',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create receipt_items table if missing
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
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create payments table if missing
CREATE TABLE IF NOT EXISTS public.payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  invoice_id UUID REFERENCES public.invoices(id) ON DELETE SET NULL,
  amount NUMERIC NOT NULL,
  payment_date DATE NOT NULL,
  payment_method TEXT,
  transaction_id TEXT,
  notes TEXT,
  status TEXT DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### **Role & Permission Tables**
```sql
-- Create role enum if missing
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
        CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');
    END IF;
END
$$;

-- Create user_roles table if missing
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Create user_settings table if missing
CREATE TABLE IF NOT EXISTS public.user_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'en',
  timezone TEXT DEFAULT 'UTC',
  date_format TEXT DEFAULT 'MM/DD/YYYY',
  default_currency TEXT DEFAULT 'USD',
  default_tax_rate NUMERIC DEFAULT 0,
  default_template TEXT,
  invoice_prefix TEXT DEFAULT 'INV',
  estimate_prefix TEXT DEFAULT 'EST',
  receipt_prefix TEXT DEFAULT 'REC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### **Organization & Billing Tables**
```sql
-- Create organizations table if missing
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create org_members table if missing
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id, user_id)
);

-- Create plans table if missing
CREATE TABLE IF NOT EXISTS public.plans (
  id VARCHAR(50) PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  max_customers INTEGER,
  max_invoices_per_month INTEGER,
  max_premium_deliveries INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billing_subscriptions table if missing
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id VARCHAR(50) REFERENCES public.plans(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billing_events table if missing
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  processed_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

#### **Logging & Communication Tables**
```sql
-- Create notifications table if missing
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT,
  link TEXT,
  read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create activity_logs table if missing
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  action TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_logs table if missing
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type TEXT NOT NULL,
  recipient TEXT NOT NULL,
  subject TEXT,
  status TEXT DEFAULT 'pending',
  sent_at TIMESTAMP WITH TIME ZONE,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);
```

### **Step 7: Create Essential Functions**
```sql
-- Create update function
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

-- Create role functions
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
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

CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
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

-- Create subscription check function
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.billing_subscriptions bs
    JOIN public.organizations o ON bs.org_id = o.id
    JOIN public.org_members om ON o.id = om.org_id
    WHERE om.user_id = user_uuid
    AND bs.status = 'active'
    AND bs.subscription_end > NOW()
  )
$$;
```

---

## 🔐 Row Level Security (RLS) Setup

### **Step 8: Apply RLS Policies**
```sql
-- Enable RLS on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.invoice_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.estimate_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.receipt_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (users can only access their own data)
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can view their own customers" ON public.customers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own customers" ON public.customers FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Users can view their own invoices" ON public.invoices FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can manage their own invoices" ON public.invoices FOR ALL USING (auth.uid() = user_id);

-- Add similar policies for all other tables...
```

---

## 📦 Storage Setup

### **Step 9: Create Avatar Storage Bucket**
```sql
-- Create avatars bucket if missing
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'avatars',
  'avatars',
  true,
  5242880, -- 5MB limit
  ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- Storage RLS policies
CREATE POLICY "Avatar images are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'avatars');
CREATE POLICY "Users can upload their own avatar" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

---

## 🔄 Edge Functions Deployment

### **Step 10: Deploy Edge Functions to Your Old Database**
```bash
# Deploy all edge functions to your old database
npx supabase functions deploy create-checkout
npx supabase functions deploy stripe-webhook  
npx supabase functions deploy check-subscription
npx supabase functions deploy customer-portal

# Verify deployment
npx supabase functions list
```

---

## ✅ Testing & Verification

### **Step 11: Test Database Connection**
```bash
# Test the application
npm run dev

# Verify in browser:
# 1. Can you login with existing accounts?
# 2. Can you see your old invoices/documents?
# 3. Do billing functions work?
# 4. Are your customers still there?
```

### **Step 12: Data Verification Queries**
Run these in your Supabase SQL Editor to verify your data is accessible:

```sql
-- Check registered users
SELECT id, email, first_name, last_name, company_name, created_at 
FROM public.profiles 
ORDER BY created_at DESC;

-- Check invoices
SELECT id, invoice_number, date, total, status, created_at 
FROM public.invoices 
ORDER BY created_at DESC 
LIMIT 20;

-- Check customers  
SELECT id, name, email, created_at 
FROM public.customers 
ORDER BY created_at DESC 
LIMIT 20;

-- Check user roles
SELECT ur.user_id, p.email, ur.role 
FROM public.user_roles ur
JOIN public.profiles p ON ur.user_id = p.id;

-- Check estimates
SELECT id, estimate_number, date, total, status 
FROM public.estimates 
ORDER BY created_at DESC 
LIMIT 10;

-- Check receipts
SELECT id, receipt_number, date, total, payment_method 
FROM public.receipts 
ORDER BY created_at DESC 
LIMIT 10;
```

---

## 🚨 Troubleshooting

### **If Data Appears Missing:**
1. **Check RLS Policies**: Ensure you're logged in as the correct user
2. **Verify Database Connection**: Confirm you're connected to `rlbhtujnuopelxxgssni`
3. **Check Auth Status**: Verify user authentication is working
4. **Review Error Logs**: Check browser console and Supabase logs

### **If Schema Issues Occur:**
1. **Run Migration Commands**: Use the table creation scripts above
2. **Check Dependencies**: Ensure all foreign key relationships exist
3. **Verify Triggers**: Ensure update triggers are in place

### **If Billing Issues Occur:**
1. **Redeploy Edge Functions**: Ensure functions point to correct database
2. **Check Stripe Webhook**: Verify webhook endpoints are correct
3. **Test Subscription Flow**: Create a test subscription

---

## 📝 Final Checklist

- [ ] ✅ Updated .env file with old database credentials
- [ ] ✅ Linked Supabase CLI to old project  
- [ ] ✅ Verified all 21 tables exist
- [ ] ✅ Applied RLS policies
- [ ] ✅ Created missing functions
- [ ] ✅ Set up avatar storage bucket
- [ ] ✅ Deployed edge functions
- [ ] ✅ Tested user login
- [ ] ✅ Verified document access (invoices, estimates, receipts)
- [ ] ✅ Confirmed customer data exists
- [ ] ✅ Tested billing functionality
- [ ] ✅ Checked subscription system

---

## 💾 Emergency Recovery

If something goes wrong, you can always revert:

```bash
# Switch back to Lovable database temporarily
# Update .env with kvvqkzwrkselznrnqcbi credentials
# Then follow this guide again with proper planning
```

---

**🎯 Result**: After following this guide, you should have full access to your original SwiftFacture database with all your registered users, invoices, estimates, receipts, customers, and settings exactly as they were before Lovable made changes.