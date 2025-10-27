-- Add missing columns to existing plans table
-- This fixes the migration issue where plans table exists but lacks new columns

-- Add display_order column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'display_order') THEN
        ALTER TABLE public.plans ADD COLUMN display_order INTEGER NOT NULL DEFAULT 0;
    END IF;
END
$$;

-- Add stripe_price_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'stripe_price_id') THEN
        ALTER TABLE public.plans ADD COLUMN stripe_price_id TEXT;
    END IF;
END
$$;

-- Add stripe_product_id column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'stripe_product_id') THEN
        ALTER TABLE public.plans ADD COLUMN stripe_product_id TEXT;
    END IF;
END
$$;

-- Add max_customers column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'max_customers') THEN
        ALTER TABLE public.plans ADD COLUMN max_customers INTEGER;
    END IF;
END
$$;

-- Add max_invoices_per_month column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'max_invoices_per_month') THEN
        ALTER TABLE public.plans ADD COLUMN max_invoices_per_month INTEGER;
    END IF;
END
$$;

-- Add max_premium_deliveries column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_name = 'plans' AND column_name = 'max_premium_deliveries') THEN
        ALTER TABLE public.plans ADD COLUMN max_premium_deliveries INTEGER;
    END IF;
END
$$;

-- Create indexes after ensuring columns exist
CREATE INDEX IF NOT EXISTS idx_plans_display_order ON public.plans(display_order);
CREATE INDEX IF NOT EXISTS idx_plans_stripe_price_id ON public.plans(stripe_price_id);
CREATE INDEX IF NOT EXISTS idx_plans_active_display ON public.plans(is_active, display_order);

-- Update existing plans with display order and placeholder Stripe IDs
UPDATE public.plans SET 
    display_order = CASE 
        WHEN id = 'free' THEN 1
        WHEN id = 'trial-30' THEN 1
        WHEN id = 'starter' THEN 2
        WHEN id = 'pro' OR id = 'professional' THEN 3
        WHEN id = 'enterprise' THEN 4
        ELSE 999
    END
WHERE display_order IS NULL OR display_order = 0;

-- Set placeholder Stripe IDs (these will be updated with real IDs later)
UPDATE public.plans SET 
    stripe_price_id = CASE
        WHEN id = 'starter' THEN 'price_PLACEHOLDER_STARTER'
        WHEN id = 'pro' OR id = 'professional' THEN 'price_PLACEHOLDER_PRO'
        WHEN id = 'enterprise' THEN 'price_PLACEHOLDER_ENTERPRISE'
        ELSE stripe_price_id
    END,
    stripe_product_id = CASE
        WHEN id = 'starter' THEN 'prod_PLACEHOLDER_STARTER'
        WHEN id = 'pro' OR id = 'professional' THEN 'prod_PLACEHOLDER_PRO'
        WHEN id = 'enterprise' THEN 'prod_PLACEHOLDER_ENTERPRISE'
        ELSE stripe_product_id
    END
WHERE stripe_price_id IS NULL;

-- Set plan limits
UPDATE public.plans SET 
    max_customers = CASE
        WHEN id = 'free' THEN 5
        WHEN id = 'trial-30' THEN -1
        WHEN id = 'starter' THEN 30
        WHEN id = 'pro' OR id = 'professional' THEN -1
        WHEN id = 'enterprise' THEN -1
        ELSE max_customers
    END,
    max_invoices_per_month = CASE
        WHEN id = 'free' THEN 15
        WHEN id = 'trial-30' THEN -1
        WHEN id = 'starter' THEN -1
        WHEN id = 'pro' OR id = 'professional' THEN -1
        WHEN id = 'enterprise' THEN -1
        ELSE max_invoices_per_month
    END,
    max_premium_deliveries = CASE
        WHEN id = 'free' THEN 0
        WHEN id = 'trial-30' THEN -1
        WHEN id = 'starter' THEN 36
        WHEN id = 'pro' OR id = 'professional' THEN 120
        WHEN id = 'enterprise' THEN 360
        ELSE max_premium_deliveries
    END
WHERE max_customers IS NULL;