-- Create plans table for subscription management
CREATE TABLE IF NOT EXISTS public.plans (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_fr TEXT NOT NULL,
  description_en TEXT,
  description_fr TEXT,
  price_monthly NUMERIC NOT NULL DEFAULT 0,
  price_yearly NUMERIC,
  stripe_price_id TEXT,
  stripe_product_id TEXT,
  features JSONB NOT NULL DEFAULT '[]'::jsonb,
  max_customers INTEGER,
  max_invoices_per_month INTEGER,
  max_premium_deliveries INTEGER,
  is_active BOOLEAN NOT NULL DEFAULT true,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for active plans
CREATE INDEX IF NOT EXISTS idx_plans_active ON public.plans(is_active, display_order);

-- Enable RLS
ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read active plans
CREATE POLICY "Anyone can view active plans"
  ON public.plans FOR SELECT
  USING (is_active = true);

-- Only admins can manage plans
CREATE POLICY "Admins can manage plans"
  ON public.plans FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role) OR has_role(auth.uid(), 'super_admin'::app_role));

-- Insert initial plans data
INSERT INTO public.plans (id, name_en, name_fr, description_en, description_fr, price_monthly, price_yearly, stripe_price_id, stripe_product_id, features, max_customers, max_invoices_per_month, max_premium_deliveries, display_order) VALUES
('free', 'Free', 'Gratuit', 'Perfect for getting started', 'Parfait pour commencer', 0, 0, NULL, NULL, 
'["5 customers", "15 invoices/estimates per month", "Basic templates", "PDF export"]'::jsonb, 
5, 15, 0, 1),

('starter', 'Starter', 'Démarrage', 'Great for small businesses', 'Idéal pour les petites entreprises', 19.99, 203.89, 'price_1SMPD4RogxYobEmxWT7P4zDG', 'prod_TJ1FKRu0auL1vc',
'["30 customers", "Unlimited invoices/estimates", "36 premium deliveries", "Email support", "Convert estimates to invoices"]'::jsonb,
30, -1, 36, 2),

('professional', 'Professional', 'Professionnel', 'For growing businesses', 'Pour les entreprises en croissance', 39.99, 407.89, 'price_1SMPDVRogxYobEmx01OzT5DG', 'prod_TJ1G4VS7ciOI3T',
'["Unlimited customers", "Unlimited invoices/estimates", "120 premium deliveries", "Advanced reporting", "Priority support", "API access"]'::jsonb,
-1, -1, 120, 3),

('enterprise', 'Enterprise', 'Entreprise', 'For large organizations', 'Pour les grandes organisations', 79.99, 815.89, 'price_1SMPDeRogxYobEmxIFqkLJK4', 'prod_TJ1G5mWJ9P8lXH',
'["Unlimited customers", "Unlimited invoices/estimates", "360 premium deliveries", "Custom branding", "Dedicated support", "Multiple trade names"]'::jsonb,
-1, -1, 360, 4)

ON CONFLICT (id) DO NOTHING;

-- Create trigger for updated_at
CREATE TRIGGER update_plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();