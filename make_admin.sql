-- RUN THIS IN SUPABASE SQL EDITOR TO CREATE ADMIN
-- TARGET USER: 6f5868f3-843f-4e2f-a49a-4b43d2f01046

-- 1. Update the profile table
UPDATE public.profiles 
SET role = 'admin' 
WHERE id = '6f5868f3-843f-4e2f-a49a-4b43d2f01046';

-- 2. Update the Auth metadata (for Middleware access)
UPDATE auth.users 
SET raw_user_meta_data = raw_user_meta_data || '{"role": "admin"}'::jsonb
WHERE id = '6f5868f3-843f-4e2f-a49a-4b43d2f01046';
