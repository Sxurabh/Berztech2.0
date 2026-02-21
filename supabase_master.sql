-- ============================================================
-- BERZTECH MASTER DATABASE SETUP — v2 (SECURE + OPTIMIZED)
-- ============================================================
-- HOW TO UPDATE ADMIN EMAILS → Jump to Section 3 (ADMIN SETUP)
-- ============================================================


-- ============================================================
-- 0. EXTENSIONS
-- ============================================================

CREATE EXTENSION IF NOT EXISTS pgcrypto;


-- ============================================================
-- 1. COMPLETE CLEAN SLATE
--    Wipes everything: policies, triggers, functions, tables,
--    storage buckets, and roles. Safe to re-run from scratch.
-- ============================================================

-- Drop storage policies (bucket/objects must be deleted via Supabase Storage API, not SQL)
DROP POLICY IF EXISTS "Public Access"        ON storage.objects;
DROP POLICY IF EXISTS "Public read images"   ON storage.objects;
DROP POLICY IF EXISTS "Admin manage images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin upload images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin update images"  ON storage.objects;
DROP POLICY IF EXISTS "Admin delete images"  ON storage.objects;

-- Drop tables (CASCADE removes dependent policies, triggers, indexes)
DROP TABLE IF EXISTS public.settings        CASCADE;
DROP TABLE IF EXISTS public.subscribers     CASCADE;
DROP TABLE IF EXISTS public.testimonials    CASCADE;
DROP TABLE IF EXISTS public.requests        CASCADE;
DROP TABLE IF EXISTS public.blog_posts      CASCADE;
DROP TABLE IF EXISTS public.projects        CASCADE;
DROP TABLE IF EXISTS public.admin_users     CASCADE;

-- Drop shared functions
DROP FUNCTION IF EXISTS public.is_admin()        CASCADE;
DROP FUNCTION IF EXISTS public.update_updated_at() CASCADE;


-- ============================================================
-- 2. SHARED FUNCTIONS
-- ============================================================

-- Auto-update updated_at on any row change
CREATE OR REPLACE FUNCTION public.update_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc', now());
  RETURN NEW;
END;
$$;

-- Null-safe admin check using JWT email claim
-- SECURITY DEFINER runs as owner so it can safely read admin_users
-- even though the table is locked down via RLS
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _email text;
BEGIN
  _email := auth.jwt() ->> 'email';
  IF _email IS NULL THEN
    RETURN false;
  END IF;
  RETURN EXISTS (
    SELECT 1
    FROM public.admin_users
    WHERE email = lower(trim(_email))
  );
END;
$$;

-- Revoke public execute; only Postgres/service role should call directly
REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;


-- ============================================================
-- 3. ADMIN SETUP
-- ============================================================
--
--  ✏️  TO ADD / REMOVE ADMINS:
--     • Add   → INSERT INTO public.admin_users (email) VALUES ('new@email.com');
--     • Remove→ DELETE FROM public.admin_users WHERE email = 'old@email.com';
--  Emails are stored lowercase for consistent matching.
-- ============================================================

CREATE TABLE public.admin_users (
  email text PRIMARY KEY CHECK (email = lower(trim(email)))
);

-- No public access; is_admin() (SECURITY DEFINER) handles checks internally
ALTER TABLE public.admin_users ENABLE ROW LEVEL SECURITY;
REVOKE ALL ON public.admin_users FROM PUBLIC;

-- ✏️ CHANGE ADMIN EMAILS HERE
INSERT INTO public.admin_users (email) VALUES
  ('admin@yourdomain.com')   -- ← replace with your real admin email(s)
ON CONFLICT DO NOTHING;


-- ============================================================
-- 4. PROJECTS
-- ============================================================

CREATE TABLE public.projects (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client      text        NOT NULL,
  title       text        NOT NULL,
  description text,
  image       text        NOT NULL DEFAULT '/images/laptop.jpg',
  category    text        NOT NULL,
  year        text,
  services    text[]      NOT NULL DEFAULT '{}',
  stats       jsonb       NOT NULL DEFAULT '{}',
  color       text        NOT NULL DEFAULT 'blue',
  featured    boolean     NOT NULL DEFAULT false,
  slug        text        UNIQUE,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Single-column indexes for common filters
CREATE INDEX idx_projects_slug       ON public.projects(slug);
CREATE INDEX idx_projects_category   ON public.projects(category);
-- Composite: featured projects sorted by date (dashboard/homepage queries)
CREATE INDEX idx_projects_featured   ON public.projects(featured, created_at DESC);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read projects"
  ON public.projects FOR SELECT
  USING (true);

CREATE POLICY "Admin manage projects"
  ON public.projects FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_projects_updated
  BEFORE UPDATE ON public.projects
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 5. BLOG POSTS
-- ============================================================

CREATE TABLE public.blog_posts (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  title       text        NOT NULL,
  excerpt     text,
  content     text        NOT NULL DEFAULT '',
  category    text        NOT NULL,
  author      text        NOT NULL,
  read_time   text,
  image       text        NOT NULL DEFAULT '/images/laptop.jpg',
  featured    boolean     NOT NULL DEFAULT false,
  color       text        NOT NULL DEFAULT 'blue',
  slug        text        UNIQUE,
  published   boolean     NOT NULL DEFAULT false,
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_blog_slug     ON public.blog_posts(slug);
-- Composite: published posts sorted by date (the most common query)
CREATE INDEX idx_blog_pub_date ON public.blog_posts(published, created_at DESC);
-- Composite: featured published posts (homepage hero)
CREATE INDEX idx_blog_featured ON public.blog_posts(featured, published, created_at DESC);

ALTER TABLE public.blog_posts ENABLE ROW LEVEL SECURITY;

-- Public only sees published posts
CREATE POLICY "Public read published posts"
  ON public.blog_posts FOR SELECT
  USING (published = true);

-- Admin sees ALL posts (published or draft) and can write
CREATE POLICY "Admin manage blog"
  ON public.blog_posts FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_blog_updated
  BEFORE UPDATE ON public.blog_posts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 6. CLIENT REQUESTS
-- ============================================================

CREATE TABLE public.requests (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     uuid        REFERENCES auth.users(id) ON DELETE SET NULL,
  name        text        NOT NULL,
  email       text        NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  company     text,
  services    text[]      NOT NULL DEFAULT '{}',
  budget      text,
  message     text,
  status      text        NOT NULL DEFAULT 'submitted'
                CHECK (status IN ('submitted','discover','define','design','develop','deliver','maintain')),
  created_at  timestamptz NOT NULL DEFAULT timezone('utc', now()),
  updated_at  timestamptz NOT NULL DEFAULT timezone('utc', now())
);

CREATE INDEX idx_requests_user       ON public.requests(user_id) WHERE user_id IS NOT NULL;
CREATE INDEX idx_requests_status     ON public.requests(status);
-- Composite: admin inbox sorted by status + date
CREATE INDEX idx_requests_admin_view ON public.requests(status, created_at DESC);

ALTER TABLE public.requests ENABLE ROW LEVEL SECURITY;

-- Anyone (logged in or anonymous) can submit a request
CREATE POLICY "Anyone can submit request"
  ON public.requests FOR INSERT
  WITH CHECK (true);

-- Logged-in users can view only their own requests
CREATE POLICY "Users view own requests"
  ON public.requests FOR SELECT
  USING (auth.uid() IS NOT NULL AND auth.uid() = user_id);

-- Admin can do everything
CREATE POLICY "Admin manage requests"
  ON public.requests FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_requests_updated
  BEFORE UPDATE ON public.requests
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 7. TESTIMONIALS
-- ============================================================

CREATE TABLE public.testimonials (
  id           uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  client       text        NOT NULL,
  role         text,
  company      text,
  content      text        NOT NULL,
  image        text,
  metric       text,
  metric_label text,
  color        text        NOT NULL DEFAULT 'blue',
  featured     boolean     NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Composite: featured testimonials (homepage / carousel)
CREATE INDEX idx_testimonials_featured ON public.testimonials(featured, created_at DESC);

ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public read testimonials"
  ON public.testimonials FOR SELECT
  USING (true);

CREATE POLICY "Admin manage testimonials"
  ON public.testimonials FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- 8. STORAGE — IMAGES BUCKET
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('images', 'images', true)
ON CONFLICT DO NOTHING;

-- Anyone can read public images
CREATE POLICY "Public read images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'images');

-- Admin can upload, update, and delete images
CREATE POLICY "Admin upload images"
  ON storage.objects FOR INSERT
  WITH CHECK (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admin update images"
  ON storage.objects FOR UPDATE
  USING  (bucket_id = 'images' AND public.is_admin())
  WITH CHECK (bucket_id = 'images' AND public.is_admin());

CREATE POLICY "Admin delete images"
  ON storage.objects FOR DELETE
  USING (bucket_id = 'images' AND public.is_admin());


-- ============================================================
-- 9. SUBSCRIBERS
-- ============================================================

CREATE TABLE public.subscribers (
  id         uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  email      text        UNIQUE NOT NULL CHECK (email ~* '^[^@]+@[^@]+\.[^@]+$'),
  status     text        NOT NULL DEFAULT 'active'
               CHECK (status IN ('active', 'unsubscribed')),
  created_at timestamptz NOT NULL DEFAULT timezone('utc', now())
);

-- Useful for admin filtering active subscribers
CREATE INDEX idx_subscribers_status ON public.subscribers(status, created_at DESC);

ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Anyone can subscribe (insert their own email)
CREATE POLICY "Public subscribe"
  ON public.subscribers FOR INSERT
  WITH CHECK (true);

-- Admin manages the full list
CREATE POLICY "Admin manage subscribers"
  ON public.subscribers FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());


-- ============================================================
-- 10. SETTINGS (KEY-VALUE STORE)
-- ============================================================

CREATE TABLE public.settings (
  setting_key   text        PRIMARY KEY,
  setting_value text,
  updated_at    timestamptz NOT NULL DEFAULT timezone('utc', now())
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

-- Public can read non-sensitive settings (e.g. site config)
CREATE POLICY "Public read settings"
  ON public.settings FOR SELECT
  USING (true);

-- Only admin can write settings
CREATE POLICY "Admin manage settings"
  ON public.settings FOR ALL
  USING (public.is_admin())
  WITH CHECK (public.is_admin());

CREATE TRIGGER trg_settings_updated
  BEFORE UPDATE ON public.settings
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at();


-- ============================================================
-- 11. ROLE GRANTS
--     Supabase uses `anon` (unauthenticated) and
--     `authenticated` roles for all client requests.
--     Explicit grants are required alongside RLS.
-- ============================================================

-- anon: read-only access to public tables
GRANT SELECT ON public.projects      TO anon;
GRANT SELECT ON public.blog_posts    TO anon;
GRANT SELECT ON public.testimonials  TO anon;
GRANT SELECT ON public.settings      TO anon;
GRANT INSERT ON public.requests      TO anon;
GRANT INSERT ON public.subscribers   TO anon;

-- authenticated: same as anon + can see own requests
GRANT SELECT ON public.projects      TO authenticated;
GRANT SELECT ON public.blog_posts    TO authenticated;
GRANT SELECT ON public.testimonials  TO authenticated;
GRANT SELECT ON public.settings      TO authenticated;
GRANT INSERT ON public.requests      TO authenticated;
GRANT SELECT ON public.requests      TO authenticated;
GRANT INSERT ON public.subscribers   TO authenticated;

-- service_role already has full access by default in Supabase


-- ============================================================
-- DONE ✅
-- Re-run this file any time for a clean reset.
-- To change admins: update Section 3.
-- ============================================================