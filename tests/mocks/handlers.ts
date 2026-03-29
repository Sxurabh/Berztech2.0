import { http, HttpResponse } from 'msw';
import { mockAdminUser, mockClientUser } from './fixtures/users';
import { mockMessages, mockMessage, mockReadReceipt } from './fixtures/messages';

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || process.env.ADMIN_EMAIL || 'admin@berztech.com';

export const handlers = [
  http.get('/api/auth/getUser', ({ request }) => {
    const url = new URL(request.url);
    const email = url.searchParams.get('email');

    if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return HttpResponse.json({ user: mockAdminUser });
    }

    if (email) {
      return HttpResponse.json({ user: mockClientUser });
    }

    return HttpResponse.json({ user: null });
  }),

  http.post('/api/auth/getUser', async ({ request }) => {
    const body = await request.json() as { email?: string };
    const email = body.email;

    if (email && email.toLowerCase() === ADMIN_EMAIL.toLowerCase()) {
      return HttpResponse.json({ user: mockAdminUser });
    }

    if (email) {
      return HttpResponse.json({ user: mockClientUser });
    }

    return HttpResponse.json({ user: null });
  }),

  http.get('/api/messages', ({ request }) => {
    const url = new URL(request.url);
    const projectId = url.searchParams.get('project_id');

    if (!projectId) {
      return HttpResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    if (projectId === 'error-project') {
      return HttpResponse.json(
        { error: 'Server error' },
        { status: 500 }
      );
    }

    const messages = mockMessages.filter(m => m.project_id === projectId);
    return HttpResponse.json({ data: messages });
  }),

  http.post('/api/messages', async ({ request }) => {
    const body = await request.json() as { project_id?: string; content?: string; attachment_url?: string; attachment_type?: string; attachment_name?: string };

    if (!body.project_id) {
      return HttpResponse.json(
        { error: 'Validation failed', details: { project_id: ['Required'] } },
        { status: 400 }
      );
    }

    if (body.project_id === 'error-project') {
      return HttpResponse.json(
        { error: 'Failed to send message' },
        { status: 500 }
      );
    }

    if (!body.content || body.content.trim() === '') {
      return HttpResponse.json(
        { error: 'Validation failed', details: { content: ['Required'] } },
        { status: 400 }
      );
    }

    return HttpResponse.json({
      data: {
        ...mockMessage,
        project_id: body.project_id,
        content: body.content,
        attachment_url: body.attachment_url || null,
        attachment_type: body.attachment_type || null,
        attachment_name: body.attachment_name || null,
      }
    }, { status: 201 });
  }),

  http.patch('/api/messages/:id/read', ({ params }) => {
    const { id } = params;

    if (id === 'msg-own') {
      return HttpResponse.json(
        { error: 'Cannot mark own message as read' },
        { status: 400 }
      );
    }

    if (id === 'msg-not-found') {
      return HttpResponse.json(
        { error: 'Message not found' },
        { status: 404 }
      );
    }

    return HttpResponse.json({
      data: {
        ...mockReadReceipt,
        message_id: id,
      }
    });
  }),

  http.post('/api/messages/upload', async ({ request }) => {
    const formData = await request.formData();
    const file = formData.get('file');
    const projectId = formData.get('project_id');

    if (!file) {
      return HttpResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!projectId) {
      return HttpResponse.json(
        { error: 'project_id is required' },
        { status: 400 }
      );
    }

    const fileName = file instanceof File ? file.name : 'file.jpg';
    const isImage = fileName.match(/\.(jpg|jpeg|png|gif|webp)$/i);

    return HttpResponse.json({
      url: `https://storage.example.com/message-attachments/${Date.now()}-${fileName}`,
      type: isImage ? 'image' : 'document',
      name: fileName,
    });
  }),
];
