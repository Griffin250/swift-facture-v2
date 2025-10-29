-- SwiftFacture Trial System - Fixed SQL Migration
-- Copy and paste this entire code into your Supabase SQL Editor and run it

-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE NOT NULL,
  owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create org_members table (link users to organizations)
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- Create plans table (FIXED - added updated_at column)
CREATE TABLE IF NOT EXISTS public.plans (
  id VARCHAR(50) PRIMARY KEY,
  name_en VARCHAR(100) NOT NULL,
  name_fr VARCHAR(100) NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_monthly DECIMAL(10,2) DEFAULT 0,
  price_yearly DECIMAL(10,2) DEFAULT 0,
  trial_days INTEGER DEFAULT 0,
  features JSONB DEFAULT '[]',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create billing_subscriptions table
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  plan_id VARCHAR(50) REFERENCES public.plans(id) NOT NULL,
  status VARCHAR(20) DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'past_due', 'canceled', 'expired')),
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  current_period_start TIMESTAMP WITH TIME ZONE,
  current_period_end TIMESTAMP WITH TIME ZONE,
  stripe_customer_id VARCHAR(100),
  stripe_subscription_id VARCHAR(100),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(organization_id)
);

-- Create billing_events table
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  subscription_id UUID REFERENCES public.billing_subscriptions(id) ON DELETE CASCADE,
  event_type VARCHAR(50) NOT NULL,
  event_data JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create email_logs table
CREATE TABLE IF NOT EXISTS public.email_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email_type VARCHAR(50) NOT NULL,
    recipient_email VARCHAR(255) NOT NULL,
    organization_name VARCHAR(255),
    metadata JSONB DEFAULT '{}',
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create indexes for email logs
CREATE INDEX IF NOT EXISTS idx_email_logs_type_date ON public.email_logs(email_type, sent_at);
CREATE INDEX IF NOT EXISTS idx_email_logs_recipient ON public.email_logs(recipient_email);

-- Enable RLS on all tables
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.email_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organizations"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Users can create their own organizations"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Organization owners can update their organizations"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for org_members
CREATE POLICY "Users can view org members of their organizations"
  ON public.org_members FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
    )
  );

CREATE POLICY "Organization owners can manage members"
  ON public.org_members FOR ALL
  USING (
    organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid())
  )
  WITH CHECK (
    organization_id IN (SELECT id FROM public.organizations WHERE owner_id = auth.uid())
  );

-- RLS Policies for plans (public read)
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- RLS Policies for billing_subscriptions
CREATE POLICY "Users can view their organization's subscription"
  ON public.billing_subscriptions FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
    )
  );

-- RLS Policies for billing_events
CREATE POLICY "Users can view their organization's billing events"
  ON public.billing_events FOR SELECT
  USING (
    organization_id IN (
      SELECT id FROM public.organizations 
      WHERE owner_id = auth.uid() OR 
      id IN (SELECT organization_id FROM public.org_members WHERE user_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_organizations_owner_id ON public.organizations(owner_id);
CREATE INDEX IF NOT EXISTS idx_org_members_organization_id ON public.org_members(organization_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_organization_id ON public.billing_subscriptions(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_trial_end ON public.billing_subscriptions(trial_end);
CREATE INDEX IF NOT EXISTS idx_billing_events_organization_id ON public.billing_events(organization_id);
CREATE INDEX IF NOT EXISTS idx_billing_events_event_type ON public.billing_events(event_type);

-- Insert default plans (FIXED - now works correctly)
INSERT INTO public.plans (id, name_en, name_fr, description_en, description_fr, price_monthly, price_yearly, trial_days, features) VALUES
  ('trial-30', 'Free Trial', 'Essai Gratuit', '30-day free trial with full access', 'Essai gratuit de 30 jours avec accès complet', 0, 0, 30, '["invoices", "receipts", "estimates", "customers", "templates"]'),
  ('starter', 'Starter', 'Débutant', 'Perfect for freelancers and small businesses', 'Parfait pour les freelances et petites entreprises', 19.99, 199.99, 30, '["invoices", "receipts", "estimates", "customers", "basic_templates", "email_support"]'),
  ('pro', 'Professional', 'Professionnel', 'Advanced features for growing businesses', 'Fonctionnalités avancées pour entreprises en croissance', 39.99, 399.99, 30, '["invoices", "receipts", "estimates", "customers", "premium_templates", "advanced_reporting", "priority_support", "api_access"]'),
  ('enterprise', 'Enterprise', 'Entreprise', 'Full-featured solution for large organizations', 'Solution complète pour grandes organisations', 79.99, 799.99, 30, '["invoices", "receipts", "estimates", "customers", "premium_templates", "advanced_reporting", "priority_support", "api_access", "custom_branding", "dedicated_support"]')
ON CONFLICT (id) DO UPDATE SET
  name_en = EXCLUDED.name_en,
  name_fr = EXCLUDED.name_fr,
  description_en = EXCLUDED.description_en,
  description_fr = EXCLUDED.description_fr,
  price_monthly = EXCLUDED.price_monthly,
  price_yearly = EXCLUDED.price_yearly,
  trial_days = EXCLUDED.trial_days,
  features = EXCLUDED.features,
  updated_at = now();

-- RLS Policies for email_logs table
-- Admin users can view all email logs
CREATE POLICY "Admin users can view all email logs" ON public.email_logs
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.user_roles
            WHERE user_roles.user_id = auth.uid()
            AND user_roles.role = 'admin'
        )
    );

-- Service role can insert email logs
CREATE POLICY "Service can insert email logs" ON public.email_logs
    FOR INSERT WITH CHECK (true);

-- Success message
SELECT 'SwiftFacture trial system tables created successfully!' as status;