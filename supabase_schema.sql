-- supabase_schema.sql
-- Benang Merah Database Schema
-- Run this in the Supabase SQL Editor

-- 1. USERS TABLE
CREATE TABLE IF NOT EXISTS public.users (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  role TEXT DEFAULT 'writer', -- 'writer', 'curator', 'admin'
  avatar_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profile." 
ON public.users FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile." 
ON public.users FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Public profiles are viewable by everyone." 
ON public.users FOR SELECT USING (true);


-- 2. ARTICLES TABLE
CREATE TABLE IF NOT EXISTS public.articles (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content_full JSONB NOT NULL,
  thumbnail_url TEXT,
  mood TEXT,
  status TEXT DEFAULT 'draft', -- 'draft', 'published', 'submitted'
  category TEXT DEFAULT 'ESAI', -- 'ESAI', 'PUISI', 'CERPEN'
  read_time TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage their own articles"
ON public.articles FOR ALL USING (auth.uid() = user_id);

CREATE POLICY "Published articles are viewable by everyone"
ON public.articles FOR SELECT USING (status = 'published');

CREATE POLICY "Curators can view submitted articles"
ON public.articles FOR SELECT 
USING (status = 'submitted' AND EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('curator', 'admin')));


-- 3. ANNOTATIONS TABLE (Catatan Kurator)
CREATE TABLE IF NOT EXISTS public.annotations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  curator_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  para_id TEXT NOT NULL, -- identifier of the paragraph, e.g., 'para-1' or index
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Annotations are viewable by the article author and public if published"
ON public.annotations FOR SELECT 
USING (
  EXISTS (SELECT 1 FROM public.articles a WHERE a.id = article_id AND (a.user_id = auth.uid() OR a.status = 'published'))
);

CREATE POLICY "Curators can manage annotations"
ON public.annotations FOR ALL
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('curator', 'admin')));


-- 4. COMPETITIONS TABLE (Gelanggang)
CREATE TABLE IF NOT EXISTS public.competitions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  theme TEXT NOT NULL,
  description TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT DEFAULT 'active', -- 'active', 'judging', 'completed'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions are viewable by everyone"
ON public.competitions FOR SELECT USING (true);

CREATE POLICY "Only admins can manage competitions"
ON public.competitions FOR ALL 
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role = 'admin'));


-- 5. COMPETITION ENTRIES TABLE
CREATE TABLE IF NOT EXISTS public.competition_entries (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  competition_id UUID REFERENCES public.competitions(id) ON DELETE CASCADE NOT NULL,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.users(id) ON DELETE CASCADE NOT NULL,
  submitted_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  status TEXT DEFAULT 'pending',
  is_winner BOOLEAN DEFAULT false,
  score INTEGER,
  UNIQUE(competition_id, article_id)
);

ALTER TABLE public.competition_entries ENABLE ROW LEVEL SECURITY;

ON public.competition_entries FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own entries"
ON public.competition_entries FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Everyone can view winning entries if competition is completed"
ON public.competition_entries FOR SELECT 
USING (is_winner = true);

CREATE POLICY "Curators and Admins can view all entries"
ON public.competition_entries FOR SELECT
USING (EXISTS (SELECT 1 FROM public.users WHERE id = auth.uid() AND role IN ('curator', 'admin')));


-- TRIGGERS FOR UPDATED_AT
CREATE OR REPLACE FUNCTION update_modified_column() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW; 
END;
$$ language 'plpgsql';

CREATE TRIGGER update_articles_modtime 
BEFORE UPDATE ON public.articles 
FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- TRIGGER TO AUTO-CREATE USER PROFILE ON AUTH SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, display_name, role)
  VALUES (new.id, new.raw_user_meta_data->>'display_name', 'writer');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();
