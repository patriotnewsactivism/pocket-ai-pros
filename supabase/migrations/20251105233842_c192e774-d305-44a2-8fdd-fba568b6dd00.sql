-- Update reseller default commission rate to 40%
ALTER TABLE public.resellers 
ALTER COLUMN commission_rate SET DEFAULT 40.00;

-- Update existing resellers to 40% commission
UPDATE public.resellers 
SET commission_rate = 40.00 
WHERE commission_rate = 20.00;

-- Create function to auto-create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.users (
    id,
    email,
    full_name,
    plan,
    status,
    bots_limit,
    conversations_limit,
    conversations_used
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', ''),
    'free',
    'active',
    1,
    60,
    0
  );
  RETURN NEW;
END;
$$;

-- Create trigger for auto-creating user profile
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Add index for faster referral lookups
CREATE INDEX IF NOT EXISTS idx_users_created_at ON public.users(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bots_user_status ON public.bots(user_id, status);
CREATE INDEX IF NOT EXISTS idx_conversations_bot ON public.conversations(bot_id, created_at DESC);