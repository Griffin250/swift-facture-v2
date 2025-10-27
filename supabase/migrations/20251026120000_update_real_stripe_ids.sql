-- Update plans table with real Stripe Product and Price IDs
-- Run this to connect your database plans to your actual Stripe products

-- Update Starter plan
UPDATE public.plans SET 
    stripe_product_id = 'prod_TJ335JbTq1eIeC',
    stripe_price_id = 'price_1SMQxBRogxYobEmxfmD1JSHO'
WHERE id = 'starter';

-- Update Professional plan  
UPDATE public.plans SET 
    stripe_product_id = 'prod_TJ35UueOk9C6Iz',
    stripe_price_id = 'price_1SMQytRogxYobEmxhMpXZUZe'
WHERE id IN ('professional', 'pro');

-- Update Enterprise plan
UPDATE public.plans SET 
    stripe_product_id = 'prod_TJ36iP5VIL2ZVu', 
    stripe_price_id = 'price_1SMR02RogxYobEmxopfcFYAa'
WHERE id = 'enterprise';

-- Verify the updates
SELECT 
    id, 
    name_en, 
    price_monthly,
    stripe_product_id,
    stripe_price_id,
    display_order
FROM public.plans 
WHERE stripe_price_id IS NOT NULL
ORDER BY display_order;