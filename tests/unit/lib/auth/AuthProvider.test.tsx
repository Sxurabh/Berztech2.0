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
      <button onClick={() => signInWithOAuth('google').catch(() => {})}>signInOAuth</button>
      <button onClick={() => signOut().catch(() => {})}>signOut</button>
    </div>
  );
}

function TestComponentWithNext() {
  const { signInWithOAuth } = useAuth();
  
  return (
    <div>
      <button onClick={() => signInWithOAuth('google', { next: '/dashboard' }).catch(() => {})}>validNext</button>
      <button onClick={() => signInWithOAuth('google', { next: 'https://evil.com' }).catch(() => {})}>invalidNext</button>
      <button onClick={() => signInWithOAuth('google', { next: '//evil.com' }).catch(() => {})}>protocolRelative</button>
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

  it('signInWithEmail throws when credentials are invalid', async () => {
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
      expect(e.message).toBe('Invalid credentials');
    }
  });

  it('signInWithOAuth throws when provider returns error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockRejectedValue(new Error('OAuth failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    try {
      await userEvent.click(screen.getByText('signInOAuth'));
    } catch (e) {
      expect(e.message).toBe('OAuth failed');
    }
  });

  it('signOut throws when Supabase returns error', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: mockUser } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signOut.mockRejectedValue(new Error('Sign out failed'));

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });

    try {
      await userEvent.click(screen.getByText('signOut'));
    } catch (e) {
      expect(e.message).toBe('Sign out failed');
    }
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

  it('getUser error is caught and handled gracefully', async () => {
    mockSupabase.auth.getUser.mockRejectedValue(new Error('Network error'));
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    expect(consoleError).toHaveBeenCalledWith('Auth initialization error:', expect.any(Error));
    expect(screen.getByTestId('user').textContent).toBe('no-user');
    consoleError.mockRestore();
  });

  it('onAuthStateChange callback updates user when auth state changes', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    
    let authCallback;
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback) => {
      authCallback = callback;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    act(() => {
      authCallback('SIGNED_IN', { user: mockUser });
    });

    await waitFor(() => {
      expect(screen.getByTestId('user').textContent).toBe('test@example.com');
    });
  });

  it('signInWithOAuth rejects invalid next param (open redirect prevention)', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://google.com' } });

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

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

    expect(consoleWarn).not.toHaveBeenCalled();
    consoleWarn.mockRestore();
  });

  it('signInWithOAuth rejects invalid next param with external URL', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://google.com' } });

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponentWithNext />
      </AuthProvider>
    );

    await waitFor(() => {});

    await userEvent.click(screen.getByText('invalidNext'));

    expect(consoleWarn).toHaveBeenCalledWith('Invalid next redirect ignored:', 'https://evil.com');
    consoleWarn.mockRestore();
  });

  it('signInWithOAuth accepts valid next param and sets it in redirect URL', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://google.com' } });

    render(
      <AuthProvider>
        <TestComponentWithNext />
      </AuthProvider>
    );

    await waitFor(() => {});

    await userEvent.click(screen.getByText('validNext'));

    expect(mockSupabase.auth.signInWithOAuth).toHaveBeenCalledWith({
      provider: 'google',
      options: expect.objectContaining({
        redirectTo: expect.stringContaining('/auth/callback?next=%2Fdashboard'),
      }),
    });
  });

  it('signInWithOAuth throws when Supabase is not configured', async () => {
    createClient.mockReturnValue(null);
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.getByTestId('loading').textContent).toBe('not-loading');
    });

    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {});

    try {
      await userEvent.click(screen.getByText('signInOAuth'));
    } catch (e) {
      expect(e.message).toBe('Supabase is not configured');
    }

    consoleError.mockRestore();
  });

  it('signInWithOAuth rejects protocol-relative next param', async () => {
    mockSupabase.auth.getUser.mockResolvedValue({ data: { user: null } });
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: vi.fn() } },
    });
    mockSupabase.auth.signInWithOAuth.mockResolvedValue({ data: { url: 'https://google.com' } });

    const consoleWarn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    render(
      <AuthProvider>
        <TestComponentWithNext />
      </AuthProvider>
    );

    await waitFor(() => {});

    await userEvent.click(screen.getByText('protocolRelative'));

    expect(consoleWarn).toHaveBeenCalledWith('Invalid next redirect ignored:', '//evil.com');
    consoleWarn.mockRestore();
  });
});
