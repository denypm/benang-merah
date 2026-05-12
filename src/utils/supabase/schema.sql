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
  views_count INTEGER DEFAULT 0,
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

-- 5. Create Bookmarks Table (Suaka)
CREATE TABLE public.bookmarks (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (user_id, article_id)
);

ALTER TABLE public.bookmarks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own bookmarks." ON public.bookmarks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own bookmarks." ON public.bookmarks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own bookmarks." ON public.bookmarks FOR DELETE USING (auth.uid() = user_id);

-- 6. Create Follows Table
CREATE TABLE public.follows (
  follower_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Follows are viewable by everyone." ON public.follows FOR SELECT USING (true);
CREATE POLICY "Users can follow others." ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
CREATE POLICY "Users can unfollow others." ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- 7. Create Comments Table
CREATE TABLE public.comments (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  article_id UUID REFERENCES public.articles(id) ON DELETE CASCADE NOT NULL,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
  content TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.comments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Comments are viewable by everyone." ON public.comments FOR SELECT USING (true);
CREATE POLICY "Users can insert comments." ON public.comments FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own comments." ON public.comments FOR DELETE USING (auth.uid() = user_id);

-- 8. Create Notifications Table
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, -- The user receiving the notification
  actor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL, -- The user who did the action
  type TEXT CHECK (type IN ('like', 'comment', 'follow')),
  reference_id UUID, -- ID of the article or comment if applicable
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own notifications." ON public.notifications FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert notifications." ON public.notifications FOR INSERT WITH CHECK (true); -- In reality, you'd secure this with triggers or backend only
CREATE POLICY "Users can update their own notifications (mark read)." ON public.notifications FOR UPDATE USING (auth.uid() = user_id);


-- Insert Mock Competitions Data (Optional, for demo)
INSERT INTO public.competitions (id, title, theme, description, status, prize, start_date, end_date)
VALUES 
('comp-1', 'Sayembara Esai: Jejak Langkah di Kota Kosong', 'Kesunyian Urban', 'Tuliskan refleksi Anda tentang kehidupan di tengah kota metropolitan yang perlahan kehilangan manusianya. Esai maksimal 1500 kata.', 'active', 'Rp 5.000.000 + Kurasi Premium', now() - interval '5 days', now() + interval '15 days'),
('comp-2', 'Lomba Cipta Puisi Bulan Purnama', 'Romansa Malam', 'Rangkai kata tentang apa saja yang terjadi di bawah sinar bulan purnama. Bentuk bebas, maksimal 3 bait.', 'judging', 'Terbit Antologi Fisik', now() - interval '30 days', now() - interval '2 days')
ON CONFLICT (id) DO NOTHING;
