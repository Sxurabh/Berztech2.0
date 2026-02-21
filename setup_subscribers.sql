-- Create subscribers table
CREATE TABLE IF NOT EXISTS public.subscribers (
    id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
    email text UNIQUE NOT NULL,
    status text DEFAULT 'active' CHECK (status IN ('active', 'unsubscribed')),
    created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Turn on RLS
ALTER TABLE public.subscribers ENABLE ROW LEVEL SECURITY;

-- Allow public inserts
CREATE POLICY "Allow public insert to subscribers" ON public.subscribers
    FOR INSERT WITH CHECK (true);

-- Only admins can read/update/delete
CREATE POLICY "Admins can manage subscribers" ON public.subscribers
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin());
