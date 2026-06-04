-- Add social link fields to profiles and keep auth-trigger profile creation in sync
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS website TEXT,
ADD COLUMN IF NOT EXISTS twitter TEXT,
ADD COLUMN IF NOT EXISTS linkedin TEXT,
ADD COLUMN IF NOT EXISTS github TEXT,
ADD COLUMN IF NOT EXISTS facebook TEXT,
ADD COLUMN IF NOT EXISTS instagram TEXT;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (
    id,
    email,
    full_name,
    avatar_url,
    role,
    website,
    twitter,
    linkedin,
    github,
    facebook,
    instagram,
    company_name,
    company_registration_number,
    company_website,
    company_phone,
    created_at,
    updated_at
  )
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'avatar_url',
    COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
    NEW.raw_user_meta_data->>'website',
    NEW.raw_user_meta_data->>'twitter',
    NEW.raw_user_meta_data->>'linkedin',
    NEW.raw_user_meta_data->>'github',
    NEW.raw_user_meta_data->>'facebook',
    NEW.raw_user_meta_data->>'instagram',
    NEW.raw_user_meta_data->>'company_name',
    NEW.raw_user_meta_data->>'company_registration_number',
    NEW.raw_user_meta_data->>'company_website',
    NEW.raw_user_meta_data->>'company_phone',
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;
