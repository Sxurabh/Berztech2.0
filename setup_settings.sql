CREATE TABLE IF NOT EXISTS public.settings (
    setting_key text PRIMARY KEY,
    setting_value text,
    updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read of settings" ON public.settings
    FOR SELECT USING (true);

CREATE POLICY "Admins can update settings" ON public.settings
    FOR ALL USING (auth.role() = 'authenticated' AND public.is_admin());
