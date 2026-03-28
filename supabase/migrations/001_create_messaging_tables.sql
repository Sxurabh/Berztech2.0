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
-- Allow read for participants
CREATE POLICY "Allow read for read participants" ON message_reads
    FOR SELECT USING (
        user_id = auth.uid()
        OR EXISTS (
            SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true
        )
    );

-- Allow insert for all project participants
CREATE POLICY "Allow insert for message recipient" ON message_reads
    FOR INSERT WITH CHECK (
        user_id = auth.uid()
    );

-- Enable Realtime for messaging tables
ALTER PUBLICATION supabase_realtime ADD TABLE project_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE message_reads;
