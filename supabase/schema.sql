-- ============================================
-- Berztech2.0 Database Schema
-- Run this in Supabase SQL Editor
-- ============================================

-- Projects table
CREATE TABLE IF NOT EXISTS projects (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  client TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  image TEXT DEFAULT '/images/laptop.jpg',
  category TEXT NOT NULL,
  year TEXT,
  services TEXT[] DEFAULT '{}',
  stats JSONB DEFAULT '{}',
  color TEXT DEFAULT 'blue',
  featured BOOLEAN DEFAULT false,
  slug TEXT UNIQUE,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Blog posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id SERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  excerpt TEXT,
  content TEXT DEFAULT '',
  category TEXT NOT NULL,
  author TEXT NOT NULL,
  read_time TEXT,
  image TEXT DEFAULT '/images/laptop.jpg',
  featured BOOLEAN DEFAULT false,
  color TEXT DEFAULT 'blue',
  slug TEXT UNIQUE,
  published BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

-- Public read policies
CREATE POLICY "Anyone can read projects"
  ON projects FOR SELECT
  USING (true);

CREATE POLICY "Anyone can read published blog posts"
  ON blog_posts FOR SELECT
  USING (published = true);

-- Authenticated user full access policies
CREATE POLICY "Authenticated users can insert projects"
  ON projects FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update projects"
  ON projects FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete projects"
  ON projects FOR DELETE
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can read all blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert blog posts"
  ON blog_posts FOR INSERT
  TO authenticated
  WITH CHECK (true);

CREATE POLICY "Authenticated users can update blog posts"
  ON blog_posts FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Authenticated users can delete blog posts"
  ON blog_posts FOR DELETE
  TO authenticated
  USING (true);

-- Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON projects
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER blog_posts_updated_at
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Client project requests table
CREATE TABLE IF NOT EXISTS requests (
  id TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  user_id UUID REFERENCES auth.users(id),
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  company TEXT,
  services TEXT[] DEFAULT '{}',
  budget TEXT,
  message TEXT,
  status TEXT NOT NULL DEFAULT 'submitted',
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE requests ENABLE ROW LEVEL SECURITY;

-- Anyone (even guests) can submit a request
CREATE POLICY "Anyone can insert requests"
  ON requests FOR INSERT
  WITH CHECK (true);

-- Authenticated users can see their own requests
CREATE POLICY "Users can read their own requests"
  ON requests FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Auto-update updated_at on requests
CREATE TRIGGER requests_updated_at
  BEFORE UPDATE ON requests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at();

-- Create storage bucket for images (run separately in Supabase dashboard)
-- INSERT INTO storage.buckets (id, name, public) VALUES ('images', 'images', true);
