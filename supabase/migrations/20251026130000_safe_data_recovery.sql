-- SAFE DATA RECOVERY MIGRATION
-- This migration ensures all existing data is preserved while adding new features
-- Run this ONLY after verifying your current data status

-- Step 1: Ensure profiles table exists and is populated
-- This will NOT delete existing data
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) PRIMARY KEY,
    email TEXT,
    first_name TEXT,
    last_name TEXT,
    avatar_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Populate profiles from auth.users if missing profiles
-- This will recover any missing profile connections
INSERT INTO public.profiles (id, email, created_at, updated_at)
SELECT 
    au.id, 
    au.email, 
    au.created_at,
    au.updated_at
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles)
ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    updated_at = NOW();

-- Step 2: Ensure customers table exists (preserve existing data)
CREATE TABLE IF NOT EXISTS public.customers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    address TEXT,
    city TEXT,
    state TEXT,
    zip_code TEXT,
    country TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 3: Add new columns safely (will not affect existing data)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS subscription_status TEXT DEFAULT 'free';

ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS trial_end_date TIMESTAMPTZ;

-- Step 4: Ensure organizations table exists for new trial system
CREATE TABLE IF NOT EXISTS public.organizations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 5: Create org_members table for trial system
CREATE TABLE IF NOT EXISTS public.org_members (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT DEFAULT 'member',
    joined_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(organization_id, user_id)
);

-- Step 6: Ensure existing users have organizations
INSERT INTO public.organizations (name, owner_id, created_at)
SELECT 
    COALESCE(p.first_name || ' ' || p.last_name, p.email, 'My Organization'),
    p.id,
    p.created_at
FROM public.profiles p
WHERE p.id NOT IN (SELECT owner_id FROM public.organizations WHERE owner_id IS NOT NULL)
ON CONFLICT DO NOTHING;

-- Add org memberships for owners
INSERT INTO public.org_members (organization_id, user_id, role)
SELECT 
    o.id,
    o.owner_id,
    'owner'
FROM public.organizations o
WHERE NOT EXISTS (
    SELECT 1 FROM public.org_members om 
    WHERE om.organization_id = o.id AND om.user_id = o.owner_id
);

-- Step 7: Create plans table if not exists
CREATE TABLE IF NOT EXISTS public.plans (
    id TEXT PRIMARY KEY,
    name_en TEXT NOT NULL,
    name_fr TEXT,
    price_monthly DECIMAL(10,2),
    price_yearly DECIMAL(10,2),
    features_en TEXT[],
    features_fr TEXT[],
    max_customers INTEGER,
    max_invoices_per_month INTEGER,
    max_premium_deliveries INTEGER,
    stripe_product_id TEXT,
    stripe_price_id TEXT,
    display_order INTEGER DEFAULT 0,
    active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default plans if empty
INSERT INTO public.plans (id, name_en, name_fr, price_monthly, max_customers, max_invoices_per_month, max_premium_deliveries, display_order)
VALUES 
    ('free', 'Free', 'Gratuit', 0.00, 5, 15, 0, 1),
    ('starter', 'Starter', 'Débutant', 19.99, 30, -1, 36, 2),
    ('professional', 'Professional', 'Professionnel', 39.99, -1, -1, 120, 3),
    ('enterprise', 'Enterprise', 'Entreprise', 79.99, -1, -1, 360, 4)
ON CONFLICT (id) DO UPDATE SET
    name_en = EXCLUDED.name_en,
    name_fr = EXCLUDED.name_fr,
    price_monthly = EXCLUDED.price_monthly,
    updated_at = NOW();

-- Step 8: Create billing tables if not exist
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    plan_id TEXT REFERENCES public.plans(id),
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    status TEXT NOT NULL DEFAULT 'inactive',
    current_period_start TIMESTAMPTZ,
    current_period_end TIMESTAMPTZ,
    canceled_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.billing_events (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
    event_type TEXT NOT NULL,
    event_data JSONB,
    processed BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Step 9: Data integrity verification
-- Show results to confirm data is intact
SELECT 
    'Data Recovery Summary' as status,
    (SELECT count(*) FROM auth.users) as auth_users,
    (SELECT count(*) FROM public.profiles) as profiles,
    (SELECT count(*) FROM public.customers) as customers,
    (SELECT count(*) FROM public.organizations) as organizations,
    (SELECT count(*) FROM public.plans) as plans;

-- Show any users missing profiles (should be 0)
SELECT 
    'Missing Profiles Check' as check_type,
    count(*) as missing_profile_users
FROM auth.users au
WHERE au.id NOT IN (SELECT id FROM public.profiles);

-- Verify all users have organizations
SELECT 
    'Missing Organizations Check' as check_type,
    count(*) as users_without_orgs
FROM public.profiles p
WHERE p.id NOT IN (SELECT owner_id FROM public.organizations WHERE owner_id IS NOT NULL);