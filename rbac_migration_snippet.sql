-- SUPABASE RBAC MIGRATION SNIPPET
-- Paste this into your Supabase SQL Editor

-- 1. UPDATE PROFILE TRIGGER (Section 3 Fix)
-- This ensures the 'role' and 'full_name' from sign-up are saved to the profile table
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    COALESCE(new.raw_user_meta_data->>'role', 'renter')
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. UPDATE ROLE ENUM CONSTRAINT
-- This ensures the database allows the 'admin' role
ALTER TABLE public.profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE public.profiles 
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('renter','landlord','admin'));
