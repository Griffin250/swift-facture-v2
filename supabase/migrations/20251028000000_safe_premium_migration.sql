-- Safe Migration: Add Premium Subscription Features to Existing Database
-- This migration handles existing tables and only adds what's missing

-- ============================================================================
-- ORGANIZATIONS TABLE (Multi-tenant support)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ORG_MEMBERS TABLE (User-Organization relationships)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- ============================================================================
-- PLANS TABLE (Handle existing table safely)
-- ============================================================================
-- Add columns if they don't exist
ALTER TABLE public.plans 
  ADD COLUMN IF NOT EXISTS stripe_price_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS stripe_yearly_price_id VARCHAR(100),
  ADD COLUMN IF NOT EXISTS limits JSONB,
  ADD COLUMN IF NOT EXISTS features JSONB,
  ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- ============================================================================
-- BILLING_SUBSCRIPTIONS TABLE (Core subscription tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id VARCHAR(50) REFERENCES public.plans(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'trial' CHECK (status IN ('trial', 'trialing', 'active', 'past_due', 'canceled', 'incomplete', 'expired')),
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- BILLING_EVENTS TABLE (Event tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- EMAIL_LOGS TABLE (Email tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.email_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  email_type VARCHAR(50) NOT NULL,
  recipient_email VARCHAR(255) NOT NULL,
  subject VARCHAR(500),
  sent_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  status VARCHAR(20) DEFAULT 'sent' CHECK (status IN ('sent', 'failed', 'pending')),
  provider_response JSONB
);

-- ============================================================================
-- USAGE_RECORDS TABLE (Usage tracking)
-- ============================================================================
CREATE TABLE IF NOT EXISTS public.usage_records (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE CASCADE,
  resource_type VARCHAR(50) NOT NULL,
  usage_count INTEGER DEFAULT 0,
  period_start TIMESTAMP WITH TIME ZONE NOT NULL,
  period_end TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- ============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_records ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- ROW LEVEL SECURITY POLICIES (Create only if not exists)
-- ============================================================================

-- Organizations: Users can view/manage their own organizations
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'organizations' 
        AND policyname = 'Users can view own organization'
    ) THEN
        CREATE POLICY "Users can view own organization" ON organizations
          FOR SELECT USING (owner_id = auth.uid() OR id IN (
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
          ));
    END IF;
END $$;

-- Org Members: View organization members
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'org_members' 
        AND policyname = 'Organization members can view members'
    ) THEN
        CREATE POLICY "Organization members can view members" ON org_members
          FOR SELECT USING (organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
            UNION
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
          ));
    END IF;
END $$;

-- Plans: Anyone can view active plans
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'plans' 
        AND policyname = 'Anyone can view active plans'
    ) THEN
        CREATE POLICY "Anyone can view active plans"
          ON public.plans FOR SELECT
          USING (is_active = true);
    END IF;
END $$;

-- Billing Subscriptions: Organization members only
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'billing_subscriptions' 
        AND policyname = 'Organization members can view subscriptions'
    ) THEN
        CREATE POLICY "Organization members can view subscriptions" ON billing_subscriptions
          FOR SELECT USING (organization_id IN (
            SELECT id FROM organizations WHERE owner_id = auth.uid()
            UNION
            SELECT organization_id FROM org_members WHERE user_id = auth.uid()
          ));
    END IF;
END $$;

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_organizations_slug ON public.organizations(slug);
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON public.org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_organization_id ON public.billing_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_trial_end ON public.billing_subscriptions(trial_end);
CREATE INDEX IF NOT EXISTS idx_billing_events_organization_id ON public.billing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_subscription_id ON public.billing_events(subscription_id);
CREATE INDEX IF NOT EXISTS idx_usage_records_subscription_id ON public.usage_records(subscription_id);

-- ============================================================================
-- INSERT DEFAULT PLANS (Only if they don't exist)
-- ============================================================================
INSERT INTO public.plans (id, name_en, name_fr, description_en, description_fr, price_monthly, price_yearly, features, limits, is_active, stripe_price_id, stripe_yearly_price_id) 
VALUES 
  (
    'free',
    'Free Plan',
    'Plan Gratuit',
    'Basic invoicing features for small businesses',
    'Fonctionnalités de facturation de base pour les petites entreprises',
    0.00,
    0.00,
    '["Basic templates", "PDF export", "Email support"]'::jsonb,
    '{"invoices": 15, "customers": 5, "deliveries": 0}'::jsonb,
    true,
    null,
    null
  ),
  (
    'starter',
    'Starter Plan',
    'Plan Débutant',
    'Perfect for growing businesses',
    'Parfait pour les entreprises en croissance',
    19.99,
    199.90,
    '["All Free features", "Unlimited invoices", "Premium templates", "Priority support"]'::jsonb,
    '{"invoices": 999999, "customers": 30, "deliveries": 36}'::jsonb,
    true,
    'price_starter_monthly',
    'price_starter_yearly'
  ),
  (
    'pro',
    'Professional Plan',
    'Plan Professionnel',
    'Advanced features for established businesses',
    'Fonctionnalités avancées pour les entreprises établies',
    49.99,
    499.90,
    '["All Starter features", "Advanced reporting", "API access", "Custom branding"]'::jsonb,
    '{"invoices": 999999, "customers": 999999, "deliveries": 120}'::jsonb,
    true,
    'price_pro_monthly',
    'price_pro_yearly'
  ),
  (
    'enterprise',
    'Enterprise Plan',
    'Plan Entreprise',
    'Full-featured solution for large organizations',
    'Solution complète pour les grandes organisations',
    99.99,
    999.90,
    '["All Pro features", "White-label", "Dedicated support", "Custom integrations"]'::jsonb,
    '{"invoices": 999999, "customers": 999999, "deliveries": 999999}'::jsonb,
    true,
    'price_enterprise_monthly',
    'price_enterprise_yearly'
  ),
  (
    'trial-30',
    '30-Day Trial',
    'Essai 30 Jours',
    '30-day free trial with full access',
    'Essai gratuit de 30 jours avec accès complet',
    0.00,
    0.00,
    '["Full access to all features", "30-day trial period"]'::jsonb,
    '{"invoices": 999999, "customers": 999999, "deliveries": 30}'::jsonb,
    true,
    null,
    null
  )
ON CONFLICT (id) DO NOTHING;

-- ============================================================================
-- COMPLETION MESSAGE
-- ============================================================================
-- This will show in the migration logs
SELECT 'Premium subscription migration completed successfully! Your existing data has been preserved.' as migration_status;