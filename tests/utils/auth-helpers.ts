// tests/utils/auth-helpers.ts
import { server } from '../mocks/server';
import { http, HttpResponse } from 'msw';

export function asAdmin() {
    server.use(
        http.get('*/auth/v1/user', () =>
            HttpResponse.json({ user: { id: 'admin-1', email: process.env.ADMIN_EMAIL } })
        )
    );
}

export function asClient(email = 'client@example.com') {
    server.use(
        http.get('*/auth/v1/user', () =>
            HttpResponse.json({ user: { id: 'client-1', email } })
        )
    );
}

export function asUnauthenticated() {
    server.use(
        http.get('*/auth/v1/user', () =>
            HttpResponse.json({ error: 'No auth' }, { status: 401 })
        )
    );
}
