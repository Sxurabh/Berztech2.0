export const mockAdminUser = {
  id: 'admin-uuid-1234',
  email: 'admin@berztech.com',
  email_confirmed_at: '2024-01-01T00:00:00.000Z',
  app_metadata: {
    provider: 'email',
    providers: ['email'],
  },
  user_metadata: {
    email: 'admin@berztech.com',
    email_verified: true,
    full_name: 'Admin User',
  },
  aud: 'authenticated',
  created_at: '2024-01-01T00:00:00.000Z',
};

export const mockClientUser = {
  id: 'client-uuid-5678',
  email: 'client@example.com',
  email_confirmed_at: '2024-01-15T00:00:00.000Z',
  app_metadata: {
    provider: 'email',
    providers: ['email'],
  },
  user_metadata: {
    email: 'client@example.com',
    email_verified: true,
    full_name: 'Client User',
  },
  aud: 'authenticated',
  created_at: '2024-01-15T00:00:00.000Z',
};

export const mockAnonSession = null;
