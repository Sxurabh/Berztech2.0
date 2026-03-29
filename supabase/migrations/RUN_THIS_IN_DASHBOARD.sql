-- =====================================================
-- MIGRATION 1: Create Messaging Tables
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create project_messages table
CREATE TABLE IF NOT EXISTS project_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
    sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    attachment_url TEXT,
    attachment_type TEXT CHECK (attachment_type IN ('image', 'document')),
    attachment_name TEXT,
    task_id UUID REFERENCES tasks(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message_reads table
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID REFERENCES project_messages(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
    read_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(message_id, user_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_project_messages_project_created 
    ON project_messages(project_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_reads_message_id 
    ON message_reads(message_id);
CREATE INDEX IF NOT EXISTS idx_message_reads_user_id 
    ON message_reads(user_id);

-- Enable RLS
ALTER TABLE project_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_reads ENABLE ROW LEVEL SECURITY;

-- RLS Policies for project_messages
-- Allow admins and project clients to read messages
CREATE POLICY "Allow read for project participants" ON project_messages
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id
            AND (
                p.client_email = (SELECT email FROM profiles WHERE id = auth.uid())
                OR EXISTS (
                    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Allow admins and project participants to insert messages
CREATE POLICY "Allow insert for project participants" ON project_messages
    FOR INSERT WITH CHECK (
        sender_id = auth.uid()
        AND EXISTS (
            SELECT 1 FROM projects p
            WHERE p.id = project_id
            AND (
                p.client_email = (SELECT email FROM profiles WHERE id = auth.uid())
                OR EXISTS (
                    SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
                )
            )
        )
    );

-- Allow admins to delete messages
CREATE POLICY "Allow delete for admins" ON project_messages
    FOR DELETE USING (
        EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- RLS Policies for message_reads
CREATE POLICY "Allow read for read participants" ON message_reads
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
        )
    );

CREATE POLICY "Allow insert for message recipient" ON message_reads
    FOR INSERT WITH CHECK (user_id = auth.uid());

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

-- =====================================================
-- MIGRATION 2: Create Storage Bucket
-- =====================================================

-- Create message-attachments bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
    'message-attachments',
    'message-attachments',
    true,
    10485760,
    ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
DROP POLICY IF EXISTS "Allow public read access" ON storage.objects;
CREATE POLICY "Allow public read access" ON storage.objects
    FOR SELECT USING (bucket_id = 'message-attachments');

DROP POLICY IF EXISTS "Allow authenticated upload" ON storage.objects;
CREATE POLICY "Allow authenticated upload" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Allow admin delete" ON storage.objects;
CREATE POLICY "Allow admin delete" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'message-attachments'
        AND EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
    );

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Tables created successfully!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('project_messages', 'message_reads');
