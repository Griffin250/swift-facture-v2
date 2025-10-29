-- Migration: Fix Stripe Price IDs for Premium Checkout
-- This addresses the 500 error when users select premium packages

BEGIN;

-- Update Starter plan with real Stripe IDs
UPDATE public.plans SET 
    stripe_price_id = 'price_1SMQxBRogxYobEmxfmD1JSHO',
    stripe_product_id = 'prod_TJ335JbTq1eIeC'
WHERE id = 'starter' 
  AND (stripe_price_id IS NULL 
       OR stripe_price_id LIKE '%starter%' 
       OR stripe_price_id LIKE '%placeholder%'
       OR NOT stripe_price_id ~ '^price_[A-Za-z0-9]+$');

-- Update Professional plan with real Stripe IDs
UPDATE public.plans SET 
    stripe_price_id = 'price_1SMQytRogxYobEmxhMpXZUZe',
    stripe_product_id = 'prod_TJ35UueOk9C6Iz'
WHERE (id = 'professional' OR id = 'pro')
  AND (stripe_price_id IS NULL 
       OR stripe_price_id LIKE '%pro%' 
       OR stripe_price_id LIKE '%placeholder%'
       OR NOT stripe_price_id ~ '^price_[A-Za-z0-9]+$');

-- Update Enterprise plan with real Stripe IDs  
UPDATE public.plans SET 
    stripe_price_id = 'price_1SMR02RogxYobEmxopfcFYAa',
    stripe_product_id = 'prod_TJ36iP5VIL2ZVu'
WHERE id = 'enterprise'
  AND (stripe_price_id IS NULL 
       OR stripe_price_id LIKE '%enterprise%' 
       OR stripe_price_id LIKE '%placeholder%'
       OR NOT stripe_price_id ~ '^price_[A-Za-z0-9]+$');

-- Verify the updates
DO $$
DECLARE
  plan_record RECORD;
BEGIN
  FOR plan_record IN 
    SELECT id, name_en, stripe_price_id, stripe_product_id 
    FROM public.plans 
    WHERE stripe_price_id IS NOT NULL 
    ORDER BY id
  LOOP
    RAISE NOTICE 'Plan: % (%) - Price ID: % - Product ID: %', 
      plan_record.id, 
      plan_record.name_en,
      plan_record.stripe_price_id,
      plan_record.stripe_product_id;
  END LOOP;
END $$;

COMMIT;