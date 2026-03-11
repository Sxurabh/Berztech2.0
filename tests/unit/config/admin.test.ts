import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

describe('isAdminEmail', () => {
  const originalAdminEmail = process.env.ADMIN_EMAIL;

  beforeEach(() => {
    vi.stubEnv('ADMIN_EMAIL', 'admin@example.com');
    vi.resetModules();
  });

  afterEach(() => {
    vi.stubEnv('ADMIN_EMAIL', originalAdminEmail);
    vi.resetModules();
  });

  it('returns true for configured admin email (exact match)', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('admin@example.com')).toBe(true);
  });

  it('returns true regardless of letter case (upper/lower)', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('ADMIN@EXAMPLE.COM')).toBe(true);
    expect(isAdminEmail('Admin@Example.Com')).toBe(true);
    expect(isAdminEmail('aDmIn@ExAmPlE.cOm')).toBe(true);
  });

  it('returns false for a random non-admin email', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('user@example.com')).toBe(false);
    expect(isAdminEmail('john@company.org')).toBe(false);
  });

  it('returns false for empty string', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('')).toBe(false);
  });

  it('returns false for null', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail(null)).toBe(false);
  });

  it('returns false for undefined', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail(undefined)).toBe(false);
  });

  it('returns false for an email with the same domain but different username', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('admin2@example.com')).toBe(false);
    expect(isAdminEmail('administrator@example.com')).toBe(false);
    expect(isAdminEmail('support@example.com')).toBe(false);
  });

  it('returns false for a string that contains the admin email but has extra characters', async () => {
    const { isAdminEmail } = await import('@/config/admin');
    expect(isAdminEmail('fakeadmin@example.com')).toBe(false);
    expect(isAdminEmail('admin@example.com.fake')).toBe(false);
    expect(isAdminEmail('notadmin@example.com')).toBe(false);
  });
});
