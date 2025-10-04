-- Create role enum type
CREATE TYPE public.app_role AS ENUM ('user', 'admin', 'super_admin');

-- Create user_roles table (separate from profiles for security)
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create security definer function to check roles (prevents RLS recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Create function to get user's highest role
CREATE OR REPLACE FUNCTION public.get_user_role(_user_id UUID)
RETURNS app_role
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT role 
  FROM public.user_roles 
  WHERE user_id = _user_id 
  ORDER BY 
    CASE role
      WHEN 'super_admin' THEN 1
      WHEN 'admin' THEN 2
      WHEN 'user' THEN 3
    END
  LIMIT 1
$$;

-- Trigger to auto-assign 'user' role on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.user_roles (user_id, role)
  VALUES (NEW.id, 'user');
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created_role
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_role();

-- RLS Policies for user_roles table
CREATE POLICY "Users can view their own roles"
  ON public.user_roles
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Super admins can manage all roles"
  ON public.user_roles
  FOR ALL
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Update existing table policies to respect roles

-- Profiles: Super admins can view all, admins can view all, users view own
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
CREATE POLICY "Users can view profiles based on role"
  ON public.profiles
  FOR SELECT
  USING (
    auth.uid() = id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update profiles based on role"
  ON public.profiles
  FOR UPDATE
  USING (
    auth.uid() = id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Activity logs: Admins and super admins can view all
DROP POLICY IF EXISTS "Users can view their own activity logs" ON public.activity_logs;
CREATE POLICY "Users can view activity logs based on role"
  ON public.activity_logs
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Super admins can delete any data
CREATE POLICY "Super admins can delete profiles"
  ON public.profiles
  FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can delete activity logs"
  ON public.activity_logs
  FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));

CREATE POLICY "Super admins can update activity logs"
  ON public.activity_logs
  FOR UPDATE
  USING (public.has_role(auth.uid(), 'super_admin'));

-- Customers: Admins can view all, users only their own
DROP POLICY IF EXISTS "Users can view their own customers" ON public.customers;
CREATE POLICY "Users can view customers based on role"
  ON public.customers
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own customers" ON public.customers;
CREATE POLICY "Users can update customers based on role"
  ON public.customers
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can delete their own customers" ON public.customers;
CREATE POLICY "Users can delete customers based on role"
  ON public.customers
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Similar patterns for invoices, estimates, receipts, etc.
-- Admins can view and update (approve/deny), super admins can delete

DROP POLICY IF EXISTS "Users can view their own invoices" ON public.invoices;
CREATE POLICY "Users can view invoices based on role"
  ON public.invoices
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own invoices" ON public.invoices;
CREATE POLICY "Users can update invoices based on role"
  ON public.invoices
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can delete their own invoices" ON public.invoices;
CREATE POLICY "Users can delete invoices based on role"
  ON public.invoices
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Estimates
DROP POLICY IF EXISTS "Users can view their own estimates" ON public.estimates;
CREATE POLICY "Users can view estimates based on role"
  ON public.estimates
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own estimates" ON public.estimates;
CREATE POLICY "Users can update estimates based on role"
  ON public.estimates
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can delete their own estimates" ON public.estimates;
CREATE POLICY "Users can delete estimates based on role"
  ON public.estimates
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Receipts
DROP POLICY IF EXISTS "Users can view their own receipts" ON public.receipts;
CREATE POLICY "Users can view receipts based on role"
  ON public.receipts
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own receipts" ON public.receipts;
CREATE POLICY "Users can update receipts based on role"
  ON public.receipts
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can delete their own receipts" ON public.receipts;
CREATE POLICY "Users can delete receipts based on role"
  ON public.receipts
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Payments
DROP POLICY IF EXISTS "Users can view their own payments" ON public.payments;
CREATE POLICY "Users can view payments based on role"
  ON public.payments
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own payments" ON public.payments;
CREATE POLICY "Users can update payments based on role"
  ON public.payments
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can delete their own payments" ON public.payments;
CREATE POLICY "Users can delete payments based on role"
  ON public.payments
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- Notifications
DROP POLICY IF EXISTS "Users can view their own notifications" ON public.notifications;
CREATE POLICY "Users can view notifications based on role"
  ON public.notifications
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own notifications" ON public.notifications;
CREATE POLICY "Users can update notifications based on role"
  ON public.notifications
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can delete their own notifications" ON public.notifications;
CREATE POLICY "Admins can delete notifications"
  ON public.notifications
  FOR DELETE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can create their own notifications" ON public.notifications;
CREATE POLICY "Admins can create notifications"
  ON public.notifications
  FOR INSERT
  WITH CHECK (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

-- User settings
DROP POLICY IF EXISTS "Users can view their own settings" ON public.user_settings;
CREATE POLICY "Users can view settings based on role"
  ON public.user_settings
  FOR SELECT
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'admin') OR 
    public.has_role(auth.uid(), 'super_admin')
  );

DROP POLICY IF EXISTS "Users can update their own settings" ON public.user_settings;
CREATE POLICY "Users can update settings based on role"
  ON public.user_settings
  FOR UPDATE
  USING (
    auth.uid() = user_id OR 
    public.has_role(auth.uid(), 'super_admin')
  );

CREATE POLICY "Super admins can delete settings"
  ON public.user_settings
  FOR DELETE
  USING (public.has_role(auth.uid(), 'super_admin'));