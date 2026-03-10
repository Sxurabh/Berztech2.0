import { http, HttpResponse } from 'msw';
import { mockAdminUser, mockClientUser } from './fixtures/users';

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
];
