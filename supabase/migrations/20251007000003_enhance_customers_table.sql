-- Add customer numbering sequence
CREATE SEQUENCE IF NOT EXISTS customer_number_seq START 1 INCREMENT 1;

-- Add missing columns to customers table (only if they don't exist)
DO $$ 
BEGIN
    -- Add customer_number column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='customer_number') THEN
        ALTER TABLE public.customers ADD COLUMN customer_number INTEGER UNIQUE DEFAULT nextval('customer_number_seq');
    END IF;
    
    -- Add customer_type column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='customer_type') THEN
        ALTER TABLE public.customers ADD COLUMN customer_type TEXT DEFAULT 'business' CHECK (customer_type IN ('business', 'individual'));
    END IF;
    
    -- Add company_name column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='company_name') THEN
        ALTER TABLE public.customers ADD COLUMN company_name TEXT;
    END IF;
    
    -- Add mobile_phone column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='mobile_phone') THEN
        ALTER TABLE public.customers ADD COLUMN mobile_phone TEXT;
    END IF;
    
    -- Add website column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='website') THEN
        ALTER TABLE public.customers ADD COLUMN website TEXT;
    END IF;
    
    -- Add street_address column (rename from address for clarity)
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='street_address') THEN
        ALTER TABLE public.customers ADD COLUMN street_address TEXT;
    END IF;
    
    -- Add state_province column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='state_province') THEN
        ALTER TABLE public.customers ADD COLUMN state_province TEXT;
    END IF;
    
    -- Add vat_id column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='vat_id') THEN
        ALTER TABLE public.customers ADD COLUMN vat_id TEXT;
    END IF;
    
    -- Add currency column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='currency') THEN
        ALTER TABLE public.customers ADD COLUMN currency TEXT DEFAULT 'EUR';
    END IF;
    
    -- Add status column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='status') THEN
        ALTER TABLE public.customers ADD COLUMN status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'blocked', 'pending'));
    END IF;
    
    -- Add notes column
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='notes') THEN
        ALTER TABLE public.customers ADD COLUMN notes TEXT;
    END IF;
END $$;

-- Set customer numbers for existing customers (only if column exists and has nulls)
DO $$
BEGIN
    IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='customers' AND column_name='customer_number') THEN
        UPDATE public.customers 
        SET customer_number = nextval('customer_number_seq') 
        WHERE customer_number IS NULL;
    END IF;
END $$;

-- Create indexes for better performance (only if they don't exist)
CREATE INDEX IF NOT EXISTS idx_customers_user_id ON public.customers(user_id);
CREATE INDEX IF NOT EXISTS idx_customers_customer_number ON public.customers(customer_number);
CREATE INDEX IF NOT EXISTS idx_customers_email ON public.customers(email);
CREATE INDEX IF NOT EXISTS idx_customers_phone ON public.customers(phone);
CREATE INDEX IF NOT EXISTS idx_customers_status ON public.customers(status);
CREATE INDEX IF NOT EXISTS idx_customers_customer_type ON public.customers(customer_type);

-- Add comments to table
COMMENT ON TABLE public.customers IS 'Enhanced customer management table with essential fields';
COMMENT ON COLUMN public.customers.customer_number IS 'Auto-incrementing customer number for easy reference';
COMMENT ON COLUMN public.customers.customer_type IS 'Type of customer: business or individual';