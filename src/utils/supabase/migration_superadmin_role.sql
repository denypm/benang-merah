-- Migration Script: Add Superadmin Role & Policies
-- Run this in your Supabase SQL Editor

-- 1. Add 'role' column to profiles if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                   WHERE table_schema='public' AND table_name='profiles' AND column_name='role') THEN
        ALTER TABLE public.profiles ADD COLUMN role TEXT DEFAULT 'user' CHECK (role IN ('user', 'superadmin'));
    END IF;
END $$;

-- 2. Add Superadmin policy for Articles deletion
-- This allows any user with role = 'superadmin' to bypass the standard author-only restriction.
DROP POLICY IF EXISTS "Superadmins can delete any article." ON public.articles;
CREATE POLICY "Superadmins can delete any article."
  ON public.articles FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'superadmin'
    )
  );

-- To promote your own account, run this command manually in Supabase SQL Editor:
-- UPDATE public.profiles SET role = 'superadmin' WHERE id = 'YOUR-USER-UUID-HERE';
