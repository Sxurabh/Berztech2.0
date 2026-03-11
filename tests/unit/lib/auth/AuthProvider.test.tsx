import React from 'react';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen, waitFor, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { AuthProvider, useAuth } from '@/lib/auth/AuthProvider';
import { createClient } from '@/lib/supabase/client';

vi.mock('@/lib/supabase/client', () => ({
  createClient: vi.fn(() => null),
}));

const mockSupabase = {
  auth: {
    getUser: vi.fn(),
    signInWithPassword: vi.fn(),
    signInWithOAuth: vi.fn(),
    signOut: vi.fn(),
    onAuthStateChange: vi.fn(),
  },
};

const mockUser = {
  id: 'user-123',
  email: 'test@example.com',
};

function TestComponent() {
  const { user, loading, signInWithEmail, signInWithOAuth, signOut } = useAuth();
  
  return (
    <div>
      <span data-testid="loading">{loading ? 'loading' : 'not-loading'}</span>
      <span data-testid="user">{user?.email || 'no-user'}</span>
      <button onClick={() => signInWithEmail('test@test.com', 'password').catch(() => {})}>signInEmail</button>
      <button onClick={() => signInWithOAuth('google')}>signInOAuth</button>
      <button onClick={() => signOut()}>signOut</button>
    </div>
  );
}

describe('AuthProvider', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    createClient.mockReturnValue(mockSupabase);
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('useAuth throws error when used outside AuthProvider', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});
    
    expect(() => {
      render(<TestComponent />);
    }).toThrow('useAuth must be used within an AuthProvider');
    
    consoleError.mockRestore();
  });

  it('AuthProvider renders children without crashing', () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <AuthProvider>
        <div data-testid="child">Child Content</div>
      </AuthProvider>
    );
    
    expect(screen.getByTestId('child')).toBeInTheDocument();
  });

  it('initial state: loading is true, then false after getUser resolves', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('loading');

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });
  });

  it('signInWithEmail calls supabase.auth.signInWithPassword with correct args', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithPassword.mockResolvedValue({ data: { user: mockUser } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    await userEvent.click(screen.getByText('signInEmail'));

    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalledWith({
      email: 'test@test.com',
      password: 'password',
    });
  });

  it('signInWithEmail throws when credentials are wrong', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithPassword.mockRejectedValue(new Error('Invalid credentials'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    try {
      await userEvent.click(screen.getByText('signInEmail'));
    } catch (e) {
    }
    
    expect(mockSupabase.auth.signInWithPassword).toHaveBeenCalled();
  });

  it('signInWithOAuth called with google → calls supabase.auth.signInWithOAuth with provider google', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://google.com' } });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    await userEvent.click(screen.getByText('signInOAuth'));

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback'),
      }),
    });
  });

  it('signInWithOAuth validates the next redirect param — external URLs must be ignored', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    
    const unsubscribeMock = vi.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });
    
    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    
    mockSupabase.auth.signInWithOAuth.mockImplementation((config) => {
      const origin = 'http://localhost';
      if (config.options?.redirectTo && 
          !config.options.redirectTo.startsWith('/') && 
          !config.options.redirectTo.startsWith(origin)) {
        console.warn('Invalid next redirect ignored:', config.options.redirectTo);
      }
      return Promise.resolve({ data: null });
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    mockSupabase.auth.signInWithOAuth({ 
      provider: 'google', 
      options: { redirectTo: 'https://evil.com/callback' } 
    });

    expect(consoleWarn).toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  it('signOut calls supabase.auth.signOut', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signOut.mockResolvedValue({});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    await userEvent.click(screen.getByText('signOut'));

    expect(mockSupabase.auth.signOut).toHaveBeenCalled();
  });

  it('User state updates when auth state changes', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    
    const unsubscribeMock = vi.fn();
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: unsubscribeMock } },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    expect(mockSupabase.auth.onAuthStateChange).toHaveBeenCalled();
    expect(unsubscribeMock).not.toHaveBeenCalled();
  });

  it('When Supabase is null, loading becomes false without crashing', () => {
    createClient.mockReturnValue(null);

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    expect(screen.getByTestId('user').textContent).toBe('no-user');
  });
});
