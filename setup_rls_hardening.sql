-- RLS Hardening Script
-- This replaces the weak `auth.role() = 'authenticated'` policies with rigorous checks verifying 
-- that the request strictly originated from the configured Admin email.

-- 1. Hardening: Testimonials
drop policy if exists "Enable insert for authenticated users only" on public.testimonials;
create policy "Enable insert for admin only" on public.testimonials
  for insert with check (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

drop policy if exists "Enable update for admin only" on public.testimonials;
drop policy if exists "Enable update for authenticated users only" on public.testimonials;
create policy "Enable update for admin only" on public.testimonials
  for update using (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

drop policy if exists "Enable delete for admin only" on public.testimonials;
drop policy if exists "Enable delete for authenticated users only" on public.testimonials;
create policy "Enable delete for admin only" on public.testimonials
  for delete using (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

-- 2. Hardening: Projects
drop policy if exists "Enable insert for authenticated users only" on public.projects;
drop policy if exists "Enable insert for admin only" on public.projects;
create policy "Enable insert for admin only" on public.projects
  for insert with check (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

drop policy if exists "Enable update for admin only" on public.projects;
drop policy if exists "Enable update for authenticated users only" on public.projects;
create policy "Enable update for admin only" on public.projects
  for update using (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

drop policy if exists "Enable delete for admin only" on public.projects;
drop policy if exists "Enable delete for authenticated users only" on public.projects;
create policy "Enable delete for admin only" on public.projects
  for delete using (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

-- 3. Hardening: Blog Posts
drop policy if exists "Enable insert for authenticated users only" on public.blog_posts;
drop policy if exists "Enable insert for admin only" on public.blog_posts;
create policy "Enable insert for admin only" on public.blog_posts
  for insert with check (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

drop policy if exists "Enable update for admin only" on public.blog_posts;
drop policy if exists "Enable update for authenticated users only" on public.blog_posts;
create policy "Enable update for admin only" on public.blog_posts
  for update using (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

drop policy if exists "Enable delete for admin only" on public.blog_posts;
drop policy if exists "Enable delete for authenticated users only" on public.blog_posts;
create policy "Enable delete for admin only" on public.blog_posts
  for delete using (auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com');

-- 4. Hardening: Storage Buckets (Images)
drop policy if exists "Authenticated Upload" on storage.objects;
drop policy if exists "Admin Upload" on storage.objects;
create policy "Admin Upload"
on storage.objects for insert
with check ( bucket_id = 'images' and auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com' );

drop policy if exists "Authenticated Update" on storage.objects;
drop policy if exists "Admin Update" on storage.objects;
create policy "Admin Update"
on storage.objects for update
using ( bucket_id = 'images' and auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com' );

drop policy if exists "Authenticated Delete" on storage.objects;
drop policy if exists "Admin Delete" on storage.objects;
create policy "Admin Delete"
on storage.objects for delete
using ( bucket_id = 'images' and auth.role() = 'authenticated' and auth.jwt()->>'email' = 'saurabhkirve@gmail.com' );
