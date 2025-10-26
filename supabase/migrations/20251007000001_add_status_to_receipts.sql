-- Add status field to receipts table for tracking draft/sent state
ALTER TABLE public.receipts 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'sent'));

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_receipts_status ON public.receipts(status);
CREATE INDEX IF NOT EXISTS idx_receipts_user_status ON public.receipts(user_id, status);

-- Update existing receipts to have 'sent' status (assuming they were already processed)
UPDATE public.receipts 
SET status = 'sent' 
WHERE status IS NULL;