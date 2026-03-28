# Project Messaging System - Design Specification

**Date:** 2026-03-28
**Status:** Approved

---

## Overview

A real-time messaging system integrated into the project detail view, allowing admins and clients to communicate directly within the platform. Messages are organized per project, support file attachments, and include read receipts.

---

## Database Schema

### Table: `project_messages`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, default gen_random_uuid() |
| project_id | uuid | foreign key → projects.id, not null |
| sender_id | uuid | foreign key → profiles.id, not null |
| content | text | not null |
| attachment_url | text | nullable |
| attachment_type | text | nullable (image, document) |
| attachment_name | text | nullable |
| task_id | uuid | foreign key → tasks.id, nullable |
| created_at | timestamptz | default now() |

### Table: `message_reads`

| Column | Type | Constraints |
|--------|------|-------------|
| id | uuid | primary key, default gen_random_uuid() |
| message_id | uuid | foreign key → project_messages.id, not null |
| user_id | uuid | foreign key → profiles.id, not null |
| read_at | timestamptz | default now() |

**Indexes:** `project_messages(project_id, created_at)`, `message_reads(message_id)`

### RLS Policies

- **Select:** User must be admin OR associated with the project (client who created it)
- **Insert:** User must be admin OR associated with the project
- **Delete:** Admin only

---

## API Endpoints

### POST /api/messages
Send a new message.

**Request:**
```json
{
  "project_id": "uuid",
  "content": "string",
  "task_id": "uuid (optional)",
  "attachment_url": "string (optional)",
  "attachment_type": "string (optional)",
  "attachment_name": "string (optional)"
}
```

**Response:** `201 Created` with message object

### GET /api/messages?project_id=X
Fetch messages for a project.

**Query params:** `project_id` (required), `limit` (default 50), `before` (cursor for pagination)

**Response:** `200 OK` with array of messages + read status

### PATCH /api/messages/[id]/read
Mark message as read for current user.

**Response:** `200 OK`

### POST /api/messages/upload
Upload attachment to Supabase Storage.

**Request:** multipart/form-data with `file`

**Response:** `200 OK` with `{ url, type, name }`

---

## UI Components

### 1. ChatPanel
Collapsible side panel (~350px width) appearing on project detail pages.

**States:**
- **Collapsed:** Toggle button visible on right edge
- **Expanded:** Full chat interface

**Layout (top to bottom):**
1. Header: Project name + close button
2. Message list: Scrollable, auto-scroll on new message
3. Input area: Attachment button + text input + send button

### 2. MessageBubble
Individual message rendering.

**Variants:**
- **Own message:** Right-aligned, primary color background
- **Other message:** Left-aligned, muted background

**Elements:**
- Sender avatar + name (for others)
- Message content
- Attachment preview (if present)
- Timestamp
- Read status icons (✓ sent, ✓✓ delivered, ✓✓ blue = read)

### 3. AttachmentPreview
File attachment display.

**Image:** Inline thumbnail, click to expand
**Document:** Card with file icon, name, size, download link

### 4. ChatInput
Message composition area.

**Elements:**
- Attachment button (paperclip icon)
- Text input (auto-grow textarea)
- Send button (arrow icon)
- File upload progress indicator

---

## Real-time Behavior

### Subscription
- Subscribe to `project_messages` INSERT events filtered by project_id
- Subscribe to `message_reads` INSERT events for current user's messages

### Updates
- New messages appear instantly without page refresh
- Read receipts update in real-time when other party reads

---

## Storage

### Bucket: `message-attachments`
- Public bucket for message files
- Path pattern: `{project_id}/{message_id}/{filename}`
- Max file size: 10MB
- Allowed types: images (jpg, png, gif, webp), documents (pdf, doc, docx, txt)

---

## Integration Points

### Admin Portal
- Chat panel accessible from:
  - Project detail page header (button)
  - Kanban board (project context menu)
- Visible only for admins

### Client Portal
- Chat panel accessible from:
  - Client dashboard project list
  - Individual project view
- Visible only to authenticated clients

---

## File Structure

```
src/
├── app/
│   └── api/
│       └── messages/
│           ├── route.js (GET, POST)
│           ├── [id]/
│           │   └── read/
│           │       └── route.js (PATCH)
│           └── upload/
│               └── route.js (POST)
├── components/
│   └── chat/
│       ├── ChatPanel.jsx
│       ├── MessageBubble.jsx
│       ├── MessageList.jsx
│       ├── ChatInput.jsx
│       └── AttachmentPreview.jsx
└── lib/
    └── hooks/
        └── useMessages.js
```

---

## Dependencies

- `@supabase/supabase-js` (already in project)
- Supabase Realtime (already configured)

---

## Out of Scope (v1)

- Typing indicators
- Message editing/deletion
- Group messaging (multiple clients per project)
- Push notifications
- Search within messages
- Message reactions
