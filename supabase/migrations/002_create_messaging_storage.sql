-- Create message-attachments bucket (public)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    true,
    10485760, -- 10MB
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'message-attachments');

CREATE POLICY "Allow authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
    );

CREATE POLICY "Allow admin delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'message-attachments'
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );
