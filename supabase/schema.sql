-- ============================================
-- MIHUR – Full Database Schema
-- Run this in your Supabase SQL Editor
-- ============================================

-- 1. Categories
CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT NOT NULL,
  icon_name TEXT NOT NULL
);

-- 2. Courses
CREATE TABLE IF NOT EXISTS courses (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  provider TEXT NOT NULL,
  duration TEXT NOT NULL,
  level TEXT NOT NULL,
  description TEXT NOT NULL,
  image TEXT NOT NULL,
  url TEXT NOT NULL,
  category_id TEXT REFERENCES categories(id) ON DELETE CASCADE
);

-- 3. Saved courses (many‑to‑many)
CREATE TABLE IF NOT EXISTS saved_courses (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  course_id TEXT REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, course_id)
);

-- 4. User profiles (questionnaire answers)
CREATE TABLE IF NOT EXISTS user_profiles (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT,
  skill_level TEXT,
  reason TEXT,
  weekly_hours INTEGER,
  goal TEXT,
  experience TEXT,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 5. User roadmaps
CREATE TABLE IF NOT EXISTS user_roadmaps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  category_id TEXT REFERENCES categories(id),
  total_steps INTEGER DEFAULT 0,
  completed_steps INTEGER DEFAULT 0,
  progress_percent INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 6. Roadmap steps
CREATE TABLE IF NOT EXISTS roadmap_steps (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_id UUID NOT NULL REFERENCES user_roadmaps(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  step_order INTEGER NOT NULL,
  is_completed BOOLEAN DEFAULT false,
  completed_at TIMESTAMP WITH TIME ZONE,
  course_id TEXT REFERENCES courses(id) ON DELETE SET NULL,
  estimated_hours INTEGER,
  external_url TEXT,           -- YouTube or other external link
  thumbnail TEXT,              -- video thumbnail
  url TEXT,                    -- direct course link (from courses table)
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- 7. User favourites (videos from roadmap steps)
CREATE TABLE IF NOT EXISTS user_favorites (
  id BIGSERIAL PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  external_url TEXT NOT NULL,
  title TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(user_id, external_url)
);

-- ============================================
-- ENABLE ROW LEVEL SECURITY
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_roadmaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE roadmap_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_favorites ENABLE ROW LEVEL SECURITY;

-- ============================================
-- RLS POLICIES
-- ============================================

-- Categories: read‑only for everyone
CREATE POLICY "Anyone can view categories" ON categories
  FOR SELECT USING (true);

-- Courses: read‑only for everyone
CREATE POLICY "Anyone can view courses" ON courses
  FOR SELECT USING (true);

-- Saved courses: users manage their own
CREATE POLICY "Users can view own saved courses" ON saved_courses
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved courses" ON saved_courses
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved courses" ON saved_courses
  FOR DELETE USING (auth.uid() = user_id);

-- User profiles: each user only their own
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON user_profiles
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- User roadmaps: users own them
CREATE POLICY "Users can view own roadmaps" ON user_roadmaps
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own roadmaps" ON user_roadmaps
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own roadmaps" ON user_roadmaps
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own roadmaps" ON user_roadmaps
  FOR DELETE USING (auth.uid() = user_id);

-- Roadmap steps: users can see steps of their own roadmaps
CREATE POLICY "Users can view steps of own roadmaps" ON roadmap_steps
  FOR SELECT USING (EXISTS (
    SELECT 1 FROM user_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can insert steps into own roadmaps" ON roadmap_steps
  FOR INSERT WITH CHECK (EXISTS (
    SELECT 1 FROM user_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can update steps of own roadmaps" ON roadmap_steps
  FOR UPDATE USING (EXISTS (
    SELECT 1 FROM user_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()
  ));
CREATE POLICY "Users can delete steps of own roadmaps" ON roadmap_steps
  FOR DELETE USING (EXISTS (
    SELECT 1 FROM user_roadmaps WHERE id = roadmap_id AND user_id = auth.uid()
  ));

-- User favorites: users manage their own
CREATE POLICY "Users can view own favorites" ON user_favorites
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own favorites" ON user_favorites
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own favorites" ON user_favorites
  FOR DELETE USING (auth.uid() = user_id);

-- ============================================
-- SAMPLE DATA (12 categories + 2 courses)
-- ============================================
INSERT INTO categories (id, name, icon_name, description) VALUES
  ('tech', 'Tech', 'Terminal', 'Coding, AI, Cybersecurity, and Cloud Computing.'),
  ('business', 'Business', 'Briefcase', 'Entrepreneurship, Finance, and Management.'),
  ('science', 'Science', 'FlaskConical', 'Physics, Biology, Chemistry, and Astronomy.'),
  ('design', 'Design', 'Palette', 'UI/UX, Graphic Design, and Motion Graphics.'),
  ('languages', 'Languages', 'Languages', 'Spanish, French, Mandarin, and more.'),
  ('arts', 'Arts', 'Theater', 'History, Literature, and Philosophy.'),
  ('marketing', 'Marketing', 'Megaphone', 'Digital Marketing, SEO, and Brand Strategy.'),
  ('health', 'Health', 'Heart', 'Nutrition, Fitness, and Mental Wellness.'),
  ('personal-dev', 'Personal Dev', 'User', 'Productivity, Leadership, and Soft Skills.'),
  ('math', 'Math', 'Calculator', 'Calculus, Statistics, and Discrete Math.'),
  ('music', 'Music', 'Music', 'Theory, Production, and Instrument Mastery.'),
  ('photography', 'Photography', 'Camera', 'Composition, Lighting, and Post-Processing.')
ON CONFLICT (id) DO NOTHING;

INSERT INTO courses (id, title, provider, duration, level, description, image, url, category_id) VALUES
  ('1', 'Neural Networks 101', 'Coursera', '24h total', 'Intermediate', 'Master the fundamentals of deep learning and backpropagation from industry experts.', 'https://images.unsplash.com/photo-1677442136019-21780ecad995?auto=format&fit=crop&w=800&q=80', 'https://www.coursera.org/learn/neural-networks-deep-learning', 'tech'),
  ('2', 'Python for Data Science', 'Coursera', '30h total', 'Beginner', 'Start your journey into data analysis with Python, NumPy, and Pandas.', 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80', 'https://www.coursera.org/learn/python-for-applied-data-science', 'tech')
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- OPTIONAL: AUTO‑UPDATE updated_at for user_profiles
-- ============================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS update_user_profiles_updated_at ON user_profiles;
CREATE TRIGGER update_user_profiles_updated_at
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_user_roadmaps_updated_at ON user_roadmaps;
CREATE TRIGGER update_user_roadmaps_updated_at
  BEFORE UPDATE ON user_roadmaps
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();