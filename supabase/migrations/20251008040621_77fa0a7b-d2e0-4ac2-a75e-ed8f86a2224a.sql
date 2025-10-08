-- Create organizations table
CREATE TABLE IF NOT EXISTS public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(owner_id)
);

-- Create org_members table
CREATE TABLE IF NOT EXISTS public.org_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'admin', 'member')),
  joined_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, org_id)
);

-- Create billing_subscriptions table
CREATE TABLE IF NOT EXISTS public.billing_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  plan_id TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'trialing' CHECK (status IN ('trialing', 'active', 'expired', 'cancelled')),
  trial_start TIMESTAMP WITH TIME ZONE,
  trial_end TIMESTAMP WITH TIME ZONE,
  subscription_start TIMESTAMP WITH TIME ZONE,
  subscription_end TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(org_id)
);

-- Create billing_events table
CREATE TABLE IF NOT EXISTS public.billing_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  event_type TEXT NOT NULL,
  org_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  metadata JSONB,
  timestamp TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.org_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.billing_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for organizations
CREATE POLICY "Users can view their own organization"
  ON public.organizations FOR SELECT
  USING (
    owner_id = auth.uid() OR 
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE org_id = organizations.id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their own organization"
  ON public.organizations FOR UPDATE
  USING (owner_id = auth.uid());

CREATE POLICY "Users can insert their own organization"
  ON public.organizations FOR INSERT
  WITH CHECK (owner_id = auth.uid());

-- RLS Policies for org_members
CREATE POLICY "Users can view members of their organization"
  ON public.org_members FOR SELECT
  USING (
    user_id = auth.uid() OR
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE id = org_members.org_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "Owners can manage org members"
  ON public.org_members FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE id = org_members.org_id AND owner_id = auth.uid()
    )
  );

-- RLS Policies for billing_subscriptions
CREATE POLICY "Users can view their organization's subscription"
  ON public.billing_subscriptions FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE id = billing_subscriptions.org_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE org_id = billing_subscriptions.org_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Owners can update their organization's subscription"
  ON public.billing_subscriptions FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE id = billing_subscriptions.org_id AND owner_id = auth.uid()
    )
  );

CREATE POLICY "System can create subscriptions"
  ON public.billing_subscriptions FOR INSERT
  WITH CHECK (true);

-- RLS Policies for billing_events
CREATE POLICY "Users can view their organization's billing events"
  ON public.billing_events FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.organizations 
      WHERE id = billing_events.org_id AND owner_id = auth.uid()
    ) OR
    EXISTS (
      SELECT 1 FROM public.org_members 
      WHERE org_id = billing_events.org_id AND user_id = auth.uid()
    )
  );

-- Function to check subscription access
CREATE OR REPLACE FUNCTION public.has_active_subscription(user_uuid UUID)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 
    FROM public.billing_subscriptions bs
    JOIN public.organizations o ON bs.org_id = o.id
    WHERE o.owner_id = user_uuid
    AND (
      bs.status = 'active' 
      OR (bs.status = 'trialing' AND bs.trial_end > now())
    )
  );
$$;

-- Trigger to auto-create organization and trial subscription on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user_trial()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  new_org_id UUID;
BEGIN
  -- Create organization
  INSERT INTO public.organizations (owner_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'company_name', NEW.email))
  RETURNING id INTO new_org_id;
  
  -- Add user as org owner
  INSERT INTO public.org_members (user_id, org_id, role)
  VALUES (NEW.id, new_org_id, 'owner');
  
  -- Create trial subscription
  INSERT INTO public.billing_subscriptions (org_id, plan_id, status, trial_start, trial_end)
  VALUES (
    new_org_id, 
    'trial-30', 
    'trialing', 
    now(), 
    now() + INTERVAL '30 days'
  );
  
  -- Log trial start event
  INSERT INTO public.billing_events (event_type, org_id, metadata)
  VALUES ('trial_started', new_org_id, jsonb_build_object('user_id', NEW.id, 'email', NEW.email));
  
  RETURN NEW;
END;
$$;

-- Create trigger for new user trial
DROP TRIGGER IF EXISTS on_auth_user_created_trial ON auth.users;
CREATE TRIGGER on_auth_user_created_trial
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user_trial();

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_org_id ON public.billing_subscriptions(org_id);
CREATE INDEX IF NOT EXISTS idx_billing_subscriptions_status ON public.billing_subscriptions(status);
CREATE INDEX IF NOT EXISTS idx_billing_events_org_id ON public.billing_events(org_id);
CREATE INDEX IF NOT EXISTS idx_org_members_user_id ON public.org_members(user_id);
CREATE INDEX IF NOT EXISTS idx_org_members_org_id ON public.org_members(org_id);