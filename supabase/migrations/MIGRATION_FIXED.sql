-- =====================================================
-- MIGRATION: Create Messaging Tables (No FK constraints)
-- Run this in: Supabase Dashboard → SQL Editor
-- =====================================================

-- Create project_messages table (no FK to profiles/tasks)
CREATE TABLE IF NOT EXISTS project_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL,
    sender_id UUID NOT NULL,
    sender_name TEXT,
    sender_email TEXT,
    content TEXT NOT NULL DEFAULT '',
    attachment_url TEXT,
    attachment_type TEXT CHECK (attachment_type IN ('image', 'document', null)),
    attachment_name TEXT,
    task_id UUID,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create message_reads table
CREATE TABLE IF NOT EXISTS message_reads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    message_id UUID NOT NULL,
    user_id UUID NOT NULL,
    user_email TEXT,
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

-- RLS Policies (simplified - allow authenticated users)
CREATE POLICY "Allow read for authenticated users" ON project_messages
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated users" ON project_messages
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Allow delete for authenticated users" ON project_messages
    FOR DELETE USING (auth.role() = 'authenticated');

CREATE POLICY "Allow read for authenticated" ON message_reads
    FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Allow insert for authenticated" ON message_reads
    FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Enable Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;

-- =====================================================
-- STORAGE: Create message-attachments bucket
-- =====================================================

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
DROP POLICY IF EXISTS "Allow public read messages" ON storage.objects;
CREATE POLICY "Allow public read messages" ON storage.objects
    FOR SELECT USING (bucket_id = 'message-attachments');

DROP POLICY IF EXISTS "Allow authenticated upload messages" ON storage.objects;
CREATE POLICY "Allow authenticated upload messages" ON storage.objects
    FOR INSERT WITH CHECK (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
    );

DROP POLICY IF EXISTS "Allow admin delete messages" ON storage.objects;
CREATE POLICY "Allow admin delete messages" ON storage.objects
    FOR DELETE USING (
        bucket_id = 'message-attachments'
        AND auth.role() = 'authenticated'
    );

-- =====================================================
-- VERIFICATION
-- =====================================================
SELECT 'Messaging tables created!' as status;
SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_name IN ('project_messages', 'message_reads');
