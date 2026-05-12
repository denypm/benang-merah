-- Supabase Schema for Benang Merah

-- 1. Create Profiles Table (extends auth.users)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public profiles are viewable by everyone."
  ON public.profiles FOR SELECT
  USING ( true );

CREATE POLICY "Users can insert their own profile."
  ON public.profiles FOR INSERT
  WITH CHECK ( auth.uid() = id );

CREATE POLICY "Users can update own profile."
  ON public.profiles FOR UPDATE
  USING ( auth.uid() = id );

-- 2. Create Articles Table
CREATE TABLE public.articles (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  author_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  excerpt TEXT,
  content JSONB, -- Storing Tiptap JSON format
  mood TEXT,
  category TEXT DEFAULT 'ESAI',
  status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'published')),
  read_time TEXT,
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for articles
ALTER TABLE public.articles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Published articles are viewable by everyone."
  ON public.articles FOR SELECT
  USING ( status = 'published' );

CREATE POLICY "Users can view their own draft articles."
  ON public.articles FOR SELECT
  USING ( auth.uid() = author_id AND status = 'draft' );

CREATE POLICY "Users can insert their own articles."
  ON public.articles FOR INSERT
  WITH CHECK ( auth.uid() = author_id );

CREATE POLICY "Users can update their own articles."
  ON public.articles FOR UPDATE
  USING ( auth.uid() = author_id );

CREATE POLICY "Users can delete their own articles."
  ON public.articles FOR DELETE
  USING ( auth.uid() = author_id );


-- 3. Create Competitions Table
CREATE TABLE public.competitions (
  id TEXT PRIMARY KEY, -- using string id like 'comp-1'
  title TEXT NOT NULL,
  theme TEXT,
  description TEXT,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'judging', 'completed')),
  prize TEXT,
  start_date TIMESTAMP WITH TIME ZONE,
  end_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for competitions (Public read-only)
ALTER TABLE public.competitions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Competitions are viewable by everyone."
  ON public.competitions FOR SELECT
  USING ( true );

-- 4. Create Likes Table
CREATE TABLE public.likes (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, article_id)
);

-- Function to handle user creation and create a profile automatically
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, avatar_url)
  VALUES (new.id, new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'avatar_url');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a user is created
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Insert Mock Competitions Data (Optional, for demo)
INSERT INTO public.competitions (id, title, theme, description, status, prize, start_date, end_date)
VALUES 
('comp-1', 'Sayembara Esai: Jejak Langkah di Kota Kosong', 'Kesunyian Urban', 'Tuliskan refleksi Anda tentang kehidupan di tengah kota metropolitan yang perlahan kehilangan manusianya. Esai maksimal 1500 kata.', 'active', 'Rp 5.000.000 + Kurasi Premium', now() - interval '5 days', now() + interval '15 days'),
('comp-2', 'Lomba Cipta Puisi Bulan Purnama', 'Romansa Malam', 'Rangkai kata tentang apa saja yang terjadi di bawah sinar bulan purnama. Bentuk bebas, maksimal 3 bait.', 'judging', 'Terbit Antologi Fisik', now() - interval '30 days', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;
